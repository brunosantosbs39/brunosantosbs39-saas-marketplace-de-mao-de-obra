import { readLimitedBody } from "@/lib/request-body";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getDb,
  account,
  sameOrigin,
  requiredId,
  canParticipate,
  HttpError,
  rateLimit,
  moderator,
} from "@/lib/marketplace-server";
import {
  publicationInput,
  profileInput,
  messageInput,
} from "@/lib/marketplace-validation";
export const dynamic = "force-dynamic";
function ok(data: unknown) {
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
function failure(e: unknown) {
  if (e instanceof HttpError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof z.ZodError)
    return NextResponse.json(
      {
        error: "Confira os campos informados.",
        fields: e.flatten().fieldErrors,
      },
      { status: 400 },
    );
  console.error(
    "marketplace request failed",
    e instanceof Error ? e.name : "unknown",
  );
  return NextResponse.json(
    { error: "Não foi possível concluir. Tente novamente." },
    { status: 500 },
  );
}
export async function GET(req: Request) {
  try {
    const u = new URL(req.url),
      action = u.searchParams.get("action") || "feed",
      sql = getDb();
    if (action === "feed") {
      const categoria = u.searchParams.get("categoria") || "",
        cidade = (u.searchParams.get("cidade") || "").slice(0, 100),
        bairro = (u.searchParams.get("bairro") || "").slice(0, 100),
        tipo = u.searchParams.get("tipo") || "";
      const page = Number(u.searchParams.get("page") || 0);
      if (!Number.isInteger(page) || page < 0 || page > 1000)
        throw new HttpError(400, "Página inválida.");
      const rows =
        await sql`SELECT p.id,p.type AS tipo,p.category AS categoria,p.title AS titulo,p.description AS descricao,p.author_id AS "autorId",a.name AS autor,p.city AS cidade,p.neighborhood AS bairro,p.price_minor AS preco,p.price_unit AS unidade,p.starts_at AS inicio,p.ends_at AS fim,p.status,p.version,p.created_at AS "criadoEm" FROM ml_publications p JOIN ml_accounts a ON a.id=p.author_id WHERE p.status='active' AND p.ends_at>now() AND (${categoria}='' OR p.category=${categoria}) AND (${tipo}='' OR p.type=${tipo}) AND (${cidade}='' OR lower(p.city)=lower(${cidade})) AND (${bairro}='' OR lower(p.neighborhood)=lower(${bairro})) ORDER BY p.created_at DESC,p.id LIMIT 21 OFFSET ${page * 20}`;
      return ok({ publicacoes: rows.slice(0, 20), hasMore: rows.length > 20 });
    }
    if (action === "professionals")
      return ok({
        profissionais:
          await sql`SELECT a.id,a.name AS nome,p.bio,p.category AS categoria,p.city AS cidade,p.neighborhood AS bairro,p.portfolio,p.latitude,p.longitude,p.images FROM ml_profiles p JOIN ml_accounts a ON a.id=p.user_id ORDER BY p.updated_at DESC LIMIT 100`,
      });
    const id = await account(req);
    if (action === "reports") {
      await moderator(id);
      return ok({
        denuncias:
          await sql`SELECT r.id,r.reason,r.created_at,p.title,p.id AS publication_id,p.status FROM ml_reports r JOIN ml_publications p ON p.id=r.publication_id WHERE r.reviewed_at IS NULL ORDER BY r.created_at LIMIT 100`,
      });
    }
    if (action === "mine")
      return ok({
        publicacoes:
          await sql`SELECT id,type AS tipo,category AS categoria,title AS titulo,description AS descricao,author_id AS "autorId",status,version,ends_at AS fim,city AS cidade,neighborhood AS bairro,price_minor AS preco,price_unit AS unidade FROM ml_publications WHERE author_id=${id} ORDER BY created_at DESC LIMIT 100`,
      });
    if (action === "profile")
      return ok({
        perfil: (
          await sql`SELECT a.name AS nome,coalesce(p.bio,'') AS bio,coalesce(p.category,'Faxina') AS categoria,coalesce(p.city,'') AS cidade,coalesce(p.neighborhood,'') AS bairro,coalesce(p.portfolio,'') AS portfolio,p.latitude,p.longitude,coalesce(p.images,'[]') AS images FROM ml_accounts a LEFT JOIN ml_profiles p ON p.user_id=a.id WHERE a.id=${id}`
        )[0],
      });
    if (action === "conversations")
      return ok({
        conversas:
          await sql`SELECT c.id,c.publication_id AS "publicacaoId",p.title AS titulo,CASE WHEN c.author_id=${id} THEN b.name ELSE a.name END AS contato,CASE WHEN c.author_id=${id} THEN c.initiator_id ELSE c.author_id END AS "contatoId",EXISTS(SELECT 1 FROM ml_blocks bl WHERE (bl.blocker_id=c.author_id AND bl.blocked_id=c.initiator_id) OR (bl.blocker_id=c.initiator_id AND bl.blocked_id=c.author_id)) AS bloqueada FROM ml_conversations c JOIN ml_publications p ON p.id=c.publication_id JOIN ml_accounts a ON a.id=c.author_id JOIN ml_accounts b ON b.id=c.initiator_id WHERE c.author_id=${id} OR c.initiator_id=${id} ORDER BY c.created_at DESC LIMIT 100`,
      });
    if (action === "messages") {
      const convId = requiredId(u.searchParams.get("id"));
      const c = (
        await sql`SELECT author_id,initiator_id FROM ml_conversations WHERE id=${convId}`
      )[0];
      if (
        !c ||
        !canParticipate(c as { author_id: string; initiator_id: string }, id)
      )
        throw new HttpError(404, "Conversa indisponível.");
      return ok({
        mensagens:
          await sql`SELECT * FROM (SELECT id,sender_id AS "autorId",body AS texto,created_at AS "criadoEm" FROM ml_messages WHERE conversation_id=${convId} ORDER BY created_at DESC,id DESC LIMIT 100) recent ORDER BY "criadoEm",id`,
      });
    }
    throw new HttpError(400, "Operação inválida.");
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    if (Number(req.headers.get("content-length") || 0) > 20000)
      throw new HttpError(413, "Solicitação muito grande.");
    const raw = new TextDecoder().decode(await readLimitedBody(req, 20000));
    if (raw.length > 20000)
      throw new HttpError(413, "Solicitação muito grande.");
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "Solicitação inválida.");
    }
    const action = input.action;
    if (action === "moderate") {
      await moderator(id);
      const p = z
        .object({
          reportId: z.uuid(),
          remove: z.boolean(),
          note: z.string().trim().min(5).max(1000),
        })
        .parse(input);
      await sql.transaction([
        sql`UPDATE ml_publications SET status='removed',version=version+1 WHERE id=(SELECT publication_id FROM ml_reports WHERE id=${p.reportId}) AND ${p.remove}`,
        sql`UPDATE ml_reports SET reviewed_at=now(),review_note=${p.note},reviewed_by=${id} WHERE id=${p.reportId}`,
      ]);
      return ok({ ok: true });
    }
    if (action === "publish") {
      const p = publicationInput.parse(input);
      if (new Date(p.fim) <= new Date())
        throw new HttpError(400, "Escolha um período futuro.");
      const rows =
        await sql`INSERT INTO ml_publications(author_id,type,category,title,description,city,neighborhood,price_minor,price_unit,starts_at,ends_at,request_id) VALUES(${id},${p.tipo},${p.categoria},${p.titulo},${p.descricao},${p.cidade},${p.bairro},${p.preco},${p.unidade},${p.inicio},${p.fim},${p.requestId}) ON CONFLICT(author_id,request_id) DO UPDATE SET request_id=excluded.request_id RETURNING id`;
      return ok({ id: rows[0].id });
    }
    if (action === "status") {
      const p = z
        .object({
          id: z.uuid(),
          status: z.enum(["active", "paused", "closed"]),
          version: z.number().int().positive(),
        })
        .parse(input);
      const rows =
        await sql`UPDATE ml_publications SET status=${p.status},version=version+1 WHERE id=${p.id} AND author_id=${id} AND version=${p.version} AND status NOT IN ('closed','removed') AND (${p.status}<>'active' OR ends_at>now()) RETURNING id`;
      if (!rows[0])
        throw new HttpError(
          409,
          "Publicação indisponível ou alterada. Atualize a lista.",
        );
      return ok({ ok: true });
    }
    if (action === "profile") {
      const p = profileInput.parse(input);
      if (p.images.length) {
        const media = await sql`SELECT url FROM ml_media WHERE owner_id=${id}`;
        const owned = new Set(media.map((m) => m.url));
        if (p.images.some((url) => !owned.has(url)))
          throw new HttpError(403, "Foto não pertence à conta.");
      }
      const lat =
          p.latitude == null ? null : Math.round(p.latitude * 100) / 100,
        lng = p.longitude == null ? null : Math.round(p.longitude * 100) / 100;
      await sql.transaction([
        sql`UPDATE ml_accounts SET name=${p.nome} WHERE id=${id}`,
        sql`INSERT INTO ml_profiles(user_id,bio,category,city,neighborhood,portfolio,latitude,longitude,images) VALUES(${id},${p.bio},${p.categoria},${p.cidade},${p.bairro},${p.portfolio},${lat},${lng},${JSON.stringify(p.images)}::jsonb) ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,category=excluded.category,city=excluded.city,neighborhood=excluded.neighborhood,portfolio=excluded.portfolio,latitude=excluded.latitude,longitude=excluded.longitude,images=excluded.images,updated_at=now()`,
      ]);
      return ok({ ok: true });
    }
    if (action === "interest") {
      const pubId = requiredId(input.publicationId);
      const rows =
        await sql`INSERT INTO ml_conversations(publication_id,author_id,initiator_id) SELECT p.id,p.author_id,${id} FROM ml_publications p WHERE p.id=${pubId} AND p.author_id<>${id} AND p.status='active' AND p.ends_at>now() AND NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=${id} AND b.blocked_id=p.author_id) OR (b.blocker_id=p.author_id AND b.blocked_id=${id})) ON CONFLICT(publication_id,initiator_id) DO UPDATE SET publication_id=excluded.publication_id RETURNING id`;
      if (!rows[0])
        throw new HttpError(403, "Não é possível iniciar esta conversa.");
      return ok({ id: rows[0].id });
    }
    if (action === "message") {
      const p = messageInput.parse(input);
      const rows =
        await sql`INSERT INTO ml_messages(conversation_id,sender_id,body,client_id) SELECT c.id,${id},${p.texto},${p.clientId} FROM ml_conversations c JOIN ml_publications p ON p.id=c.publication_id WHERE p.status<>'removed' AND c.id=${p.conversationId} AND (c.author_id=${id} OR c.initiator_id=${id}) AND NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=c.author_id AND b.blocked_id=c.initiator_id) OR (b.blocker_id=c.initiator_id AND b.blocked_id=c.author_id)) ON CONFLICT(sender_id,client_id) DO UPDATE SET client_id=excluded.client_id WHERE ml_messages.conversation_id=excluded.conversation_id RETURNING id`;
      if (!rows[0])
        throw new HttpError(403, "Conversa indisponível para envio.");
      return ok({ id: rows[0].id });
    }
    if (action === "block" || action === "unblock") {
      const target = requiredId(input.userId);
      if (target === id) throw new HttpError(400, "Contato inválido.");
      if (action === "block")
        await sql`INSERT INTO ml_blocks(blocker_id,blocked_id) SELECT ${id},a.id FROM ml_accounts a WHERE a.id=${target} ON CONFLICT DO NOTHING`;
      else
        await sql`DELETE FROM ml_blocks WHERE blocker_id=${id} AND blocked_id=${target}`;
      return ok({ ok: true });
    }
    if (action === "report") {
      const p = z
        .object({
          publicationId: z.uuid(),
          reason: z.string().trim().min(5).max(1000),
        })
        .parse(input);
      await sql`INSERT INTO ml_reports(reporter_id,publication_id,reason) VALUES(${id},${p.publicationId},${p.reason})`;
      return ok({ ok: true });
    }
    throw new HttpError(400, "Operação inválida.");
  } catch (e) {
    return failure(e);
  }
}
