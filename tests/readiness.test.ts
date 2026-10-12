import { test, mock } from "node:test";
import sharp from "sharp";
import {
  POST as uploadPhoto,
  DELETE as deletePhoto,
} from "../src/app/api/portfolio/route";
import { blobStorage } from "../src/lib/media-storage";
import {
  MAX_PHOTO_BYTES,
  MAX_PHOTO_REQUEST_BYTES,
} from "../src/lib/media-limits";
import { limit } from "../src/lib/marketplace-server";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { neonConfig } from "@neondatabase/serverless";
import { GET, POST } from "../src/app/api/marketplace/route";
import { criarCookieSessao } from "../src/lib/sessao-servidor";

test("production readiness regressions", async (t) => {
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
  await db.exec(
    await readFile(
      new URL("../migrations/002-production-readiness.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(
    await readFile(
      new URL("../migrations/002-production-readiness.sql", import.meta.url),
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
    latitude: -16.68,
    longitude: -49.26,
  };
  const pub = (await (await post(p, a)).json()).id;
  const conv = (
    await (await post({ action: "interest", publicationId: pub }, b)).json()
  ).id;
  const profile = {
    action: "profile",
    nome: "Conta A",
    bio: "Faxina residencial",
    categoria: "Faxina",
    cidade: "Goiânia",
    bairro: "Centro",
    portfolio: "Limpeza",
    latitude: -16.68,
    longitude: -49.26,
    images: [],
  };
  process.env.MODERATOR_EMAILS = "c@test.local,a@test.local";
  await post(profile, a);
  await t.test(
    "geo filters before pagination and preserves precise cursor ordering",
    async () => {
      await db.exec(
        "INSERT INTO ml_accounts(google_sub,name,email) SELECT 'geo-'||n,'Geo '||n,'geo-'||n||'@test.local' FROM generate_series(1,130) n",
      );
      await db.exec(
        "INSERT INTO ml_profiles(user_id,category,city,neighborhood,latitude,longitude,updated_at) SELECT id,'Faxina','Outra cidade','Centro',0,0,now() FROM ml_accounts WHERE google_sub LIKE 'geo-%'",
      );
      await db.query(
        "UPDATE ml_profiles SET updated_at='2020-01-01T12:00:00.123456Z' WHERE user_id=$1",
        [a],
      );
      const filtered = await (
        await get("professionals&lat=-16.68&lng=-49.26&radius=1")
      ).json();
      assert.equal(filtered.profissionais.length, 1);
      assert.equal(filtered.profissionais[0].id, a);
      const city = await (await get("professionals&cidade=Goiânia")).json();
      assert.equal(city.profissionais.length, 1);
      await db.exec(
        "UPDATE ml_profiles SET updated_at='2030-01-01T12:00:00.123456Z' WHERE city='Outra cidade'",
      );
      const ids: string[] = [];
      let cursor = "";
      do {
        const page = await (
          await get(
            "professionals&cidade=Outra%20cidade" +
              (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
          )
        ).json();
        ids.push(...page.profissionais.map((r: { id: string }) => r.id));
        cursor = page.nextCursor || "";
      } while (cursor);
      assert.equal(ids.length, 130);
      assert.equal(new Set(ids).size, 130);
      assert.equal((await get("professionals&lat=999&lng=0")).status, 400);
    },
  );
  await t.test(
    "publication geo, price unit, period and author editing",
    async () => {
      assert.equal(
        (
          await (
            await get(
              "feed&lat=-16.68&lng=-49.26&radius=1&unidade=diaria&min=10000&max=20000",
            )
          ).json()
        ).publicacoes.length,
        1,
      );
      assert.equal(
        (await (await get("feed&lat=0&lng=0&radius=1")).json()).publicacoes
          .length,
        0,
      );
      assert.equal((await get("feed&min=10000")).status, 400);
      assert.equal(
        (await (await get("feed&unidade=hora&min=1")).json()).publicacoes
          .length,
        0,
      );
      assert.equal(
        (await (await get("feed&inicio=2031-01-01T00:00:00Z")).json())
          .publicacoes.length,
        0,
      );
      assert.equal(
        (
          await post(
            {
              ...p,
              action: "edit",
              id: pub,
              version: 1,
              titulo: "Nova oferta",
            },
            b,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await post(
            {
              ...p,
              action: "edit",
              id: pub,
              version: 1,
              titulo: "Nova oferta",
            },
            a,
          )
        ).status,
        200,
      );
      assert.equal(
        (await post({ ...p, action: "edit", id: pub, version: 1 }, a)).status,
        409,
      );
      assert.equal(
        (
          await post(
            { action: "status", id: pub, version: 2, status: "closed" },
            a,
          )
        ).status,
        200,
      );
      let mine = (await (await get("mine", a)).json()).publicacoes.find(
        (x: { id: string }) => x.id === pub,
      );
      assert.equal(mine.situacao, "pendente");
      assert.equal(
        (
          await post(
            {
              action: "serviceStatus",
              id: pub,
              version: 3,
              situacao: "finalizado",
            },
            a,
          )
        ).status,
        200,
      );
      mine = (await (await get("mine", a)).json()).publicacoes.find(
        (x: { id: string }) => x.id === pub,
      );
      assert.equal(mine.status, "closed");
      assert.equal(mine.situacao, "finalizado");
      await db.query("UPDATE ml_publications SET status='active' WHERE id=$1", [
        pub,
      ]);
    },
  );
  await t.test(
    "blocking hides content bilaterally and own unblock restores it",
    async () => {
      await post({ action: "block", userId: b }, a);
      assert.equal((await (await get("feed", b)).json()).publicacoes.length, 0);
      assert.equal(
        (await (await get("professionals&cidade=Goiânia", b)).json())
          .profissionais.length,
        0,
      );
      assert.equal((await get("publicProfile&id=" + a, b)).status, 404);
      assert.equal((await (await get("feed")).json()).publicacoes.length, 1);
      assert.equal((await (await get("blocks", a)).json()).bloqueados[0].id, b);
      await post({ action: "unblock", userId: b }, a);
      assert.equal((await get("publicProfile&id=" + a, b)).status, 200);
    },
  );
  await t.test(
    "message history pages without omissions or duplicates",
    async () => {
      await db.query(
        "INSERT INTO ml_messages(conversation_id,sender_id,body,client_id,created_at) SELECT $1,$2,'Mensagem '||n,gen_random_uuid(),'2030-01-01T12:00:00.123456Z'::timestamptz FROM generate_series(1,135) n",
        [conv, b],
      );
      const latest = await (await get("messages&id=" + conv, a)).json();
      assert.equal(latest.mensagens.length, 100);
      assert.equal(latest.hasMore, true);
      const older = await (
        await get(
          "messages&id=" +
            conv +
            "&cursor=" +
            encodeURIComponent(latest.nextCursor),
          a,
        )
      ).json();
      assert.equal(older.mensagens.length, 35);
      assert.equal(older.hasMore, false);
      assert.equal(
        new Set([...latest.mensagens, ...older.mensagens].map((x) => x.id))
          .size,
        135,
      );
      assert.equal((await get("messages&id=" + conv, c)).status, 404);
    },
  );
  await t.test(
    "reports deduplicate, prohibit self review and preserve immutable decision",
    async () => {
      const report = {
        action: "report",
        publicationId: pub,
        reason: "Conteúdo incorreto",
      };
      const first = (await (await post(report, b)).json()).id;
      assert.equal((await (await post(report, b)).json()).id, first);
      assert.equal(
        (
          await post(
            {
              action: "moderate",
              reportId: first,
              decision: "remove",
              note: "Sou autor do anúncio",
            },
            a,
          )
        ).status,
        409,
      );
      const reviews = await Promise.all([
        post(
          {
            action: "moderate",
            reportId: first,
            decision: "remove",
            note: "Revisão independente",
          },
          c,
        ),
        post(
          {
            action: "moderate",
            reportId: first,
            decision: "keep",
            note: "Outra revisão concorrente",
          },
          c,
        ),
      ]);
      assert.deepEqual(reviews.map((r) => r.status).sort(), [200, 409]);
      const actions = await db.query<{ note: string }>(
        "SELECT note FROM ml_moderation_actions WHERE report_id=$1",
        [first],
      );
      assert.equal(actions.rows.length, 1);
      await db.query(
        "UPDATE ml_moderation_actions SET note='Sobrescrito' WHERE report_id=$1",
        [first],
      );
      await db.query("DELETE FROM ml_moderation_actions WHERE report_id=$1", [
        first,
      ]);
      const after = await db.query<{ note: string }>(
        "SELECT note FROM ml_moderation_actions WHERE report_id=$1",
        [first],
      );
      assert.equal(after.rows[0].note, actions.rows[0].note);
    },
  );
  await t.test(
    "only participants can report a message; profile removal hides discovery",
    async () => {
      const message = (
        await db.query<{ id: string }>(
          "SELECT id FROM ml_messages WHERE conversation_id=$1 LIMIT 1",
          [conv],
        )
      ).rows[0].id;
      assert.equal(
        (
          await post(
            {
              action: "report",
              targetType: "message",
              targetId: message,
              reason: "Mensagem abusiva",
            },
            c,
          )
        ).status,
        404,
      );
      const r = (
        await (
          await post(
            {
              action: "report",
              targetType: "message",
              targetId: message,
              reason: "Mensagem abusiva",
            },
            a,
          )
        ).json()
      ).id;
      assert.equal(
        (
          await post(
            {
              action: "moderate",
              reportId: r,
              decision: "remove",
              note: "Mensagem removida",
            },
            c,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await db.query<{ removed: boolean }>(
            "SELECT removed FROM ml_messages WHERE id=$1",
            [message],
          )
        ).rows[0].removed,
        true,
      );
      const profileReport = (
        await (
          await post(
            {
              action: "report",
              targetType: "profile",
              targetId: a,
              reason: "Perfil abusivo",
            },
            b,
          )
        ).json()
      ).id;
      assert.equal(
        (
          await post(
            {
              action: "moderate",
              reportId: profileReport,
              decision: "remove",
              note: "Perfil removido",
            },
            c,
          )
        ).status,
        200,
      );
      assert.equal((await get("publicProfile&id=" + a)).status, 404);
      await post({ ...profile, bio: "Editado" }, a);
      assert.equal((await get("publicProfile&id=" + a)).status, 404);
    },
  );
  async function extraUser(n: string) {
    const row = (
      await db.query<{ id: string }>(
        "INSERT INTO ml_accounts(google_sub,name,email) VALUES($1,$1,$2) RETURNING id",
        [n, n + "@test.local"],
      )
    ).rows[0];
    tokens.set(row.id, await criarCookieSessao({ id: row.id, nome: n }));
    return row.id;
  }
  await t.test(
    "suspension revokes existing session and makes counterpart chat read-only",
    async () => {
      const user = await extraUser("suspended");
      const own = (
        await (
          await post({ ...p, requestId: crypto.randomUUID() }, user)
        ).json()
      ).id;
      const conversation = (
        await (await post({ action: "interest", publicationId: own }, b)).json()
      ).id;
      const report = (
        await (
          await post(
            { action: "report", publicationId: own, reason: "Abuso de conta" },
            b,
          )
        ).json()
      ).id;
      assert.equal(
        (
          await post(
            {
              action: "moderate",
              reportId: report,
              decision: "suspend",
              note: "Conta suspensa após revisão",
            },
            c,
          )
        ).status,
        200,
      );
      assert.equal(
        (await post({ ...p, requestId: crypto.randomUUID() }, user)).status,
        403,
      );
      const conversations = (await (await get("conversations", b)).json())
        .conversas;
      assert.equal(
        conversations.find((x: { id: string }) => x.id === conversation)
          .somenteLeitura,
        true,
      );
      assert.equal(
        (
          await post(
            {
              action: "message",
              conversationId: conversation,
              texto: "Olá",
              clientId: crypto.randomUUID(),
            },
            b,
          )
        ).status,
        403,
      );
    },
  );
  await t.test(
    "deletion has receipt, hides account and disallows contact and stale session",
    async () => {
      const user = await extraUser("deleting");
      await post({ ...profile, nome: "Excluir" }, user);
      const own = (
        await (
          await post({ ...p, requestId: crypto.randomUUID() }, user)
        ).json()
      ).id;
      assert.equal(
        (await post({ action: "deleteAccount", confirm: "não" }, user)).status,
        400,
      );
      const deletion = await post(
        { action: "deleteAccount", confirm: "EXCLUIR" },
        user,
      );
      assert.equal(deletion.status, 200);
      assert.ok((await deletion.json()).protocolo);
      assert.match(
        deletion.headers.get("set-cookie") || "",
        /mao-de-obra-sessao=/,
      );
      assert.equal((await get("publicProfile&id=" + user)).status, 404);
      assert.equal(
        (await post({ action: "interest", publicationId: own }, b)).status,
        403,
      );
      assert.equal((await get("profile", user)).status, 403);
      assert.equal((await get("deletions", b)).status, 403);
      assert.equal(
        (await (await get("deletions", c)).json()).solicitacoes.length,
        1,
      );
    },
  );
  await t.test(
    "limits expire, quota emits Retry-After and public reads are limited",
    async () => {
      await db.query(
        "INSERT INTO ml_request_limits(subject,scope,window_start,count,expires_at) VALUES('old','test',now()-interval '2 days',1,now()-interval '1 day')",
      );
      await limit(a, "limited-test", 1);
      await assert.rejects(limit(a, "limited-test", 1));
      assert.equal(
        (await db.query("SELECT * FROM ml_request_limits WHERE subject='old'"))
          .rows.length,
        0,
      );
      await get("feed");
      await db.exec(
        "UPDATE ml_request_limits SET count=240 WHERE scope='read' AND subject LIKE 'ip:%'",
      );
      const response = await get("feed");
      assert.equal(response.status, 429);
      assert.equal(response.headers.get("retry-after"), "60");
      await db.exec("DELETE FROM ml_request_limits WHERE scope='read'");
    },
  );
  await t.test(
    "photo quota reserves slots; pending images remain manageable after reload",
    async () => {
      const user = await extraUser("photos");
      process.env.BLOB_READ_WRITE_TOKEN = "fake-test-token";
      const png = await sharp({
        create: { width: 10, height: 10, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();
      async function upload(bytes = png, sizeHeader?: number) {
        const fd = new FormData();
        fd.set(
          "file",
          new File([new Uint8Array(bytes)], "photo.png", { type: "image/png" }),
        );
        return uploadPhoto(
          new Request("http://localhost/api/portfolio", {
            method: "POST",
            headers: {
              origin: "http://localhost",
              cookie: "mao-de-obra-sessao=" + tokens.get(user),
              ...(sizeHeader ? { "content-length": String(sizeHeader) } : {}),
            },
            body: fd,
          }),
        );
      }
      assert.equal(MAX_PHOTO_BYTES, 4_000_000);
      assert.equal(
        (await upload(png, MAX_PHOTO_REQUEST_BYTES + 1)).status,
        413,
      );
      await db.query(
        "INSERT INTO ml_media(owner_id,url) SELECT $1,'https://test.public.blob.vercel-storage.com/'||n FROM generate_series(1,9) n",
        [user],
      );
      await db.query(
        "INSERT INTO ml_media_slots(owner_id,slot,reservation_id,url) SELECT $1,n,gen_random_uuid(),'https://test.public.blob.vercel-storage.com/'||n FROM generate_series(1,9) n",
        [user],
      );
      let release!: () => void, started!: () => void;
      const gate = new Promise<void>((r) => (release = r)),
        entered = new Promise<void>((r) => (started = r));
      const putMock = mock.method(blobStorage, "put", async (path: string) => {
        started();
        await gate;
        return { url: "https://test.public.blob.vercel-storage.com/" + path };
      });
      const first = upload();
      await entered;
      const second = await upload();
      assert.equal(second.status, 409);
      release();
      const photo = await first;
      assert.equal(photo.status, 200);
      const url = (await photo.json()).url;
      putMock.mock.restore();
      const loaded = await (await get("profile", user)).json();
      assert.equal(loaded.midias.length, 10);
      assert.equal(loaded.perfil.images.length, 0);
      const delMock = mock.method(blobStorage, "del", async () => {
        throw new Error("Storage temporarily offline");
      });
      const removed = await deletePhoto(
        new Request("http://localhost/api/portfolio", {
          method: "DELETE",
          headers: {
            origin: "http://localhost",
            cookie: "mao-de-obra-sessao=" + tokens.get(user),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }),
      );
      assert.equal(removed.status, 200);
      delMock.mock.restore();
      assert.equal(
        (await db.query("SELECT * FROM ml_blob_deletions WHERE url=$1", [url]))
          .rows.length,
        1,
      );
      assert.equal(
        (
          await db.query("SELECT * FROM ml_media_slots WHERE owner_id=$1", [
            user,
          ])
        ).rows.length,
        9,
      );
    },
  );
  await t.test(
    "restore requires moderator and revokes the old suspended session",
    async () => {
      const user = (
        await db.query<{ id: string }>(
          "SELECT id FROM ml_accounts WHERE google_sub='suspended'",
        )
      ).rows[0].id;
      assert.equal(
        (
          await post(
            {
              action: "restoreAccount",
              userId: user,
              note: "Reativação após revisão",
            },
            b,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await post(
            {
              action: "restoreAccount",
              userId: user,
              note: "Reativação após revisão",
            },
            c,
          )
        ).status,
        200,
      );
      assert.equal((await get("profile", user)).status, 401);
      tokens.set(
        user,
        await criarCookieSessao({
          id: user,
          nome: "Reativado",
          sessionVersion: 2,
        }),
      );
      assert.equal((await get("profile", user)).status, 200);
      assert.equal(
        (
          await post(
            {
              action: "restoreAccount",
              userId: user,
              note: "Repetição indevida",
            },
            c,
          )
        ).status,
        409,
      );
    },
  );
  await t.test(
    "operator purge only finalizes a requested deletion and queues stored photos",
    async () => {
      const user = (
        await db.query<{ id: string }>(
          "SELECT id FROM ml_accounts WHERE google_sub='deleting'",
        )
      ).rows[0].id;
      await db.query(
        "INSERT INTO ml_media(owner_id,url) VALUES($1,'https://test.public.blob.vercel-storage.com/delete-me')",
        [user],
      );
      const old = process.argv[2];
      process.argv[2] = user;
      try {
        const driver = "../node_modules/@neondatabase/serverless/index.mjs";
        const esm = await import(driver);
        esm.neonConfig.fetchFunction = neonConfig.fetchFunction;
        const script = "../scripts/account-purge.mjs";
        await import(script);
      } finally {
        process.argv[2] = old;
      }
      const accountRow = (
        await db.query<{ email: string; name: string; google_sub: string }>(
          "SELECT * FROM ml_accounts WHERE id=$1",
          [user],
        )
      ).rows[0];
      assert.equal(accountRow.email, "");
      assert.equal(accountRow.name, "Conta excluída");
      assert.equal(accountRow.google_sub, "deleted:" + user);
      assert.equal(
        (await db.query("SELECT * FROM ml_profiles WHERE user_id=$1", [user]))
          .rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            "SELECT * FROM ml_blob_deletions WHERE url='https://test.public.blob.vercel-storage.com/delete-me'",
          )
        ).rows.length,
        1,
      );
      assert.ok(
        (
          await db.query<{ completed_at: Date }>(
            "SELECT completed_at FROM ml_deletion_requests WHERE account_id=$1",
            [user],
          )
        ).rows[0].completed_at,
      );
      assert.equal(
        (
          await db.query<{ status: string }>(
            "SELECT status FROM ml_accounts WHERE id=$1",
            [a],
          )
        ).rows[0].status,
        "active",
      );
    },
  );
  await db.close();
});
