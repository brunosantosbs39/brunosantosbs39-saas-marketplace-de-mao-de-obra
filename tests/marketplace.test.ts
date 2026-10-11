import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { neonConfig } from "@neondatabase/serverless";
import { GET, POST } from "../src/app/api/marketplace/route";
import { criarCookieSessao, lerCookieSessao } from "../src/lib/sessao-servidor";
import { publicationInput } from "../src/lib/marketplace-validation";

test("marketplace: isolation, persistence, retries, expiry, origin and blocks", async () => {
  const db = new PGlite();
  await db.exec(
    await readFile(
      new URL("../migrations/001-marketplace.sql", import.meta.url),
      "utf8",
    ),
  );
  // Replay verifies that deploying migration twice preserves data/schema.
  await db.exec(
    await readFile(
      new URL("../migrations/001-marketplace.sql", import.meta.url),
      "utf8",
    ),
  );
  process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
  process.env.AUTH_SECRET = "local-integration-tests-only";
  neonConfig.fetchFunction = async (
    _url: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const body = JSON.parse(init!.body as string);
    async function query(
      q: { query: string; params: unknown[] },
      client: Pick<PGlite, "query"> = db,
    ) {
      const result = await client.query<Record<string, unknown>>(
        q.query,
        q.params,
      );
      return {
        fields: result.fields,
        rows: result.rows.map((row) =>
          result.fields.map((f) => {
            const v = row[f.name];
            return v == null
              ? null
              : v instanceof Date
                ? v.toISOString()
                : typeof v === "boolean"
                  ? v
                    ? "t"
                    : "f"
                  : [114, 3802].includes(f.dataTypeID)
                    ? JSON.stringify(v)
                    : String(v);
          }),
        ),
        rowCount: result.rows.length,
      };
    }
    try {
      return Response.json(
        body.queries
          ? {
              results: await db.transaction(async (tx) => {
                const out = [];
                for (const q of body.queries) out.push(await query(q, tx));
                return out;
              }),
            }
          : await query(body),
      );
    } catch (e) {
      return Response.json({ message: (e as Error).message }, { status: 400 });
    }
  };
  const users = await db.query<{ id: string }>(
    "INSERT INTO ml_accounts(google_sub,name,email) VALUES('A','Conta A','a@test.local'),('B','Conta B','b@test.local'),('C','Conta C','c@test.local') RETURNING id",
  );
  const [a, b, c] = users.rows.map((x) => x.id);
  const tokens = new Map<string, string>();
  for (const id of [a, b, c])
    tokens.set(id, await criarCookieSessao({ id, nome: id }));
  async function get(action: string, id?: string) {
    return GET(
      new Request("http://localhost/api/marketplace?action=" + action, {
        headers: id ? { cookie: "mao-de-obra-sessao=" + tokens.get(id) } : {},
      }),
    );
  }
  async function post(body: object, id?: string, origin = "http://localhost") {
    return POST(
      new Request("http://localhost/api/marketplace", {
        method: "POST",
        headers: {
          origin,
          "Content-Type": "application/json",
          ...(id ? { cookie: "mao-de-obra-sessao=" + tokens.get(id) } : {}),
        },
        body: JSON.stringify(body),
      }),
    );
  }
  const p = {
    action: "publish",
    tipo: "disponivel",
    categoria: "Faxina",
    titulo: "Limpeza residencial",
    descricao: "Atendimento de limpeza residencial.",
    cidade: "Goiânia",
    bairro: "Centro",
    preco: 18000,
    unidade: "diaria",
    inicio: "2030-01-01T12:00:00Z",
    fim: "2030-01-02T12:00:00Z",
    requestId: crypto.randomUUID(),
  };
  assert.equal((await post(p)).status, 401);
  assert.equal((await post(p, a, "https://other.example")).status, 403);
  assert.equal((await post({ ...p, preco: -1 }, a)).status, 400);
  assert.equal(
    publicationInput.safeParse({ ...p, fim: p.inicio }).success,
    false,
  );
  const published = await post(p, a);
  assert.equal(published.status, 200);
  const pub = (await published.json()).id;
  assert.equal((await (await post(p, a)).json()).id, pub);
  const feed = await (await get("feed", b)).json();
  assert.equal(feed.publicacoes.length, 1);
  assert.equal(feed.publicacoes[0].preco, 18000);
  assert.equal("email" in feed.publicacoes[0], false);
  assert.equal(
    (await post({ action: "status", id: pub, status: "closed", version: 1 }, b))
      .status,
    409,
  );
  assert.equal(
    (await post({ action: "interest", publicationId: pub }, a)).status,
    403,
  );
  const conv = (
    await (await post({ action: "interest", publicationId: pub }, b)).json()
  ).id;
  assert.ok(conv);
  assert.equal(
    (await (await post({ action: "interest", publicationId: pub }, b)).json())
      .id,
    conv,
  );
  assert.equal((await get("messages&id=" + conv, c)).status, 404);
  const m = {
    action: "message",
    conversationId: conv,
    texto: "Olá, podemos combinar?",
    clientId: crypto.randomUUID(),
  };
  assert.equal((await post(m, c)).status, 403);
  assert.equal((await post(m, b)).status, 200);
  assert.equal((await post(m, b)).status, 200);
  assert.equal(
    (await (await get("messages&id=" + conv, a)).json()).mensagens.length,
    1,
  );
  assert.equal(
    (await (await get("conversations", c)).json()).conversas.length,
    0,
  );
  await post({ action: "block", userId: b }, a);
  assert.equal(
    (await post({ ...m, clientId: crypto.randomUUID() }, b)).status,
    403,
  );
  assert.equal(
    (await post({ ...m, clientId: crypto.randomUUID() }, a)).status,
    403,
  );
  assert.equal(
    (await post({ action: "interest", publicationId: pub }, b)).status,
    403,
  );
  await post({ action: "unblock", userId: b }, a);
  assert.equal(
    (await post({ ...m, clientId: crypto.randomUUID() }, a)).status,
    200,
  );
  await db.query(
    "UPDATE ml_publications SET starts_at='2020-01-01',ends_at='2020-01-02' WHERE id=$1",
    [pub],
  );
  assert.equal((await (await get("feed")).json()).publicacoes.length, 0);
  assert.equal(
    (await post({ action: "interest", publicationId: pub }, c)).status,
    403,
  );
  assert.equal(await lerCookieSessao(tokens.get(a)! + "tampered"), null);
  assert.equal(
    await lerCookieSessao(await criarCookieSessao({ nome: "Fake local" })),
    null,
  );

  // Profile retains only coarse coordinates and rejects images owned by another account.
  const profile = {
    action: "profile",
    nome: "Conta A",
    bio: "Faxina residencial",
    categoria: "Faxina",
    cidade: "Goiânia",
    bairro: "Centro",
    portfolio: "Limpeza",
    latitude: -16.67891,
    longitude: -49.25678,
    images: [],
  };
  assert.equal((await post(profile, a)).status, 200);
  const prof = (await (await get("profile", a)).json()).perfil;
  assert.equal(prof.latitude, -16.68);
  assert.equal(prof.longitude, -49.26);
  assert.equal(
    (
      await post(
        { ...profile, images: ["https://example.com/not-owned.webp"] },
        a,
      )
    ).status,
    403,
  );
  await post(
    { action: "report", publicationId: pub, reason: "Conteúdo incorreto" },
    b,
  );
  assert.equal((await get("reports", b)).status, 403);
  process.env.MODERATOR_EMAILS = "a@test.local";
  const reports = (await (await get("reports", a)).json()).denuncias;
  assert.equal(reports.length, 1);
  assert.equal(
    (
      await post(
        {
          action: "moderate",
          reportId: reports[0].id,
          remove: true,
          note: "Remoção após revisão",
        },
        a,
      )
    ).status,
    200,
  );
  assert.equal(
    (await post({ ...m, clientId: crypto.randomUUID() }, a)).status,
    403,
  );
  assert.equal(
    (await post({ action: "status", id: pub, status: "active", version: 2 }, a))
      .status,
    409,
  );
  assert.equal((await (await get("reports", a)).json()).denuncias.length, 0);
  await db.query("UPDATE ml_rate_limits SET count=120 WHERE account_id=$1", [
    b,
  ]);
  assert.equal(
    (await post({ ...m, clientId: crypto.randomUUID() }, b)).status,
    429,
  );
  await db.close();
});
