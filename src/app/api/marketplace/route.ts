import { NextResponse } from "next/server";
import { z } from "zod";
import { readLimitedBody } from "@/lib/request-body";
import {
  getDb,
  account,
  viewer,
  sameOrigin,
  requiredId,
  canParticipate,
  HttpError,
  rateLimit,
  limit,
  readLimit,
  moderator,
  failure,
} from "@/lib/marketplace-server";
import {
  publicationInput,
  profileInput,
  messageInput,
} from "@/lib/marketplace-validation";
import { search, decodeCursor, encodeCursor } from "@/lib/marketplace-search";
import { nomeCookieSessao } from "@/lib/sessao-servidor";
export const dynamic = "force-dynamic";
function ok(data: unknown) {
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
export async function GET(req: Request) {
  try {
    const u = new URL(req.url),
      action = u.searchParams.get("action") || "feed",
      sql = getDb();
    await readLimit(req);
    const id = await viewer(req);
    if (id) await limit(id, "read", 180);
    if (action === "feed" || action === "professionals")
      return ok(await search(u, id, action));
    if (action === "publicProfile") {
      const target = requiredId(u.searchParams.get("id"));
      const rows =
        await sql`SELECT a.id,a.name AS nome,p.bio,p.category AS categoria,p.city AS cidade,p.neighborhood AS bairro,p.portfolio,p.images,p.service_radius_km AS "raioAtendimento" FROM ml_profiles p JOIN ml_accounts a ON a.id=p.user_id WHERE a.id=${target} AND a.status='active' AND NOT p.hidden AND NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=${id}::uuid AND b.blocked_id=a.id) OR (b.blocked_id=${id}::uuid AND b.blocker_id=a.id))`;
      if (!rows[0]) throw new HttpError(404, "Perfil indisponível.");
      return ok({ perfil: rows[0] });
    }
    if (!id) throw new HttpError(401, "Entre com Google para continuar.");
    if (action === "reports") {
      await moderator(id);
      return ok({
        denuncias:
          await sql`SELECT r.id,r.reason,r.target_type,r.target_id,r.reporter_id,r.created_at,coalesce(p.title,a.name,'Mensagem denunciada') AS title,p.description,p.city,p.neighborhood,pr.bio,pr.portfolio,pr.images,m.body AS texto,p.author_id,coalesce(p.author_id,pr.user_id,m.sender_id) AS target_account FROM ml_reports r LEFT JOIN ml_publications p ON r.target_type='publication' AND p.id=r.target_id LEFT JOIN ml_profiles pr ON r.target_type='profile' AND pr.user_id=r.target_id LEFT JOIN ml_accounts a ON a.id=pr.user_id LEFT JOIN ml_messages m ON r.target_type='message' AND m.id=r.target_id WHERE r.reviewed_at IS NULL AND r.reporter_id<>${id} AND coalesce(p.author_id,pr.user_id,m.sender_id)<>${id} ORDER BY r.created_at,r.id LIMIT 100`,
      });
    }
    if (action === "moderationHistory") {
      await moderator(id);
      return ok({
        acoes:
          await sql`SELECT id,target_type,target_id,decision,note,created_at FROM ml_moderation_actions ORDER BY created_at DESC,id DESC LIMIT 100`,
        suspensos:
          await sql`SELECT id,name AS nome FROM ml_accounts WHERE status='suspended' ORDER BY created_at DESC LIMIT 100`,
      });
    }
    if (action === "deletions") {
      await moderator(id);
      return ok({
        solicitacoes:
          await sql`SELECT r.id AS protocolo,r.account_id,a.email,r.created_at,r.completed_at FROM ml_deletion_requests r JOIN ml_accounts a ON a.id=r.account_id WHERE r.completed_at IS NULL ORDER BY r.created_at LIMIT 100`,
      });
    }
    if (action === "ownPublication") {
      const target = requiredId(u.searchParams.get("id"));
      const rows =
        await sql`SELECT id,type AS tipo,category AS categoria,title AS titulo,description AS descricao,status,version,starts_at AS inicio,ends_at AS fim,city AS cidade,neighborhood AS bairro,price_minor AS preco,price_unit AS unidade,latitude,longitude FROM ml_publications WHERE author_id=${id} AND id=${target}`;
      if (!rows[0]) throw new HttpError(404, "Publicação indisponível.");
      return ok({ publicacao: rows[0] });
    }
    if (action === "mine")
      return ok({
        publicacoes:
          await sql`SELECT id,type AS tipo,category AS categoria,title AS titulo,description AS descricao,author_id AS "autorId",status,version,service_status AS situacao,starts_at AS inicio,ends_at AS fim,city AS cidade,neighborhood AS bairro,price_minor AS preco,price_unit AS unidade,latitude,longitude FROM ml_publications WHERE author_id=${id} ORDER BY created_at DESC LIMIT 100`,
      });
    if (action === "profile")
      return ok({
        perfil: (
          await sql`SELECT a.name AS nome,coalesce(p.bio,'') AS bio,coalesce(p.category,'Faxina') AS categoria,coalesce(p.city,'') AS cidade,coalesce(p.neighborhood,'') AS bairro,coalesce(p.portfolio,'') AS portfolio,p.latitude,p.longitude,coalesce(p.images,'[]') AS images,coalesce(p.service_radius_km,10) AS "raioAtendimento",coalesce(p.hidden,false) AS hidden FROM ml_accounts a LEFT JOIN ml_profiles p ON p.user_id=a.id WHERE a.id=${id}`
        )[0],
        midias:
          await sql`SELECT url FROM ml_media WHERE owner_id=${id} ORDER BY created_at,id`,
      });
    if (action === "blocks")
      return ok({
        bloqueados:
          await sql`SELECT a.id,a.name AS nome FROM ml_blocks b JOIN ml_accounts a ON a.id=b.blocked_id WHERE b.blocker_id=${id} ORDER BY a.name,a.id`,
      });
    if (action === "conversations")
      return ok({
        conversas:
          await sql`SELECT c.id,c.publication_id AS "publicacaoId",p.title AS titulo,CASE WHEN c.author_id=${id} THEN b.name ELSE a.name END AS contato,CASE WHEN c.author_id=${id} THEN c.initiator_id ELSE c.author_id END AS "contatoId",EXISTS(SELECT 1 FROM ml_blocks bl WHERE (bl.blocker_id=c.author_id AND bl.blocked_id=c.initiator_id) OR (bl.blocker_id=c.initiator_id AND bl.blocked_id=c.author_id)) AS bloqueada,(p.status='removed' OR a.status<>'active' OR b.status<>'active') AS "somenteLeitura" FROM ml_conversations c JOIN ml_publications p ON p.id=c.publication_id JOIN ml_accounts a ON a.id=c.author_id JOIN ml_accounts b ON b.id=c.initiator_id WHERE c.author_id=${id} OR c.initiator_id=${id} ORDER BY c.created_at DESC LIMIT 100`,
      });
    if (action === "messages") {
      const conv = requiredId(u.searchParams.get("id")),
        c = (
          await sql`SELECT author_id,initiator_id FROM ml_conversations WHERE id=${conv}`
        )[0];
      if (
        !c ||
        !canParticipate(c as { author_id: string; initiator_id: string }, id)
      )
        throw new HttpError(404, "Conversa indisponível.");
      const cursor = decodeCursor(u.searchParams.get("cursor"));
      const rows =
        await sql`SELECT id,sender_id AS "autorId",CASE WHEN removed THEN '[Mensagem removida pela moderação]' ELSE body END AS texto,removed,created_at AS "criadoEm",created_at AS cursor_at,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_stamp FROM ml_messages WHERE conversation_id=${conv} AND (${cursor?.at ?? null}::timestamptz IS NULL OR (created_at,id)<(${cursor?.at ?? null}::timestamptz,${cursor?.id ?? null}::uuid)) ORDER BY created_at DESC,id DESC LIMIT 101`;
      return ok({
        mensagens: rows.slice(0, 100).reverse(),
        hasMore: rows.length > 100,
        nextCursor: rows.length > 100 ? encodeCursor(rows[99]) : null,
      });
    }
    throw new HttpError(400, "Operação inválida.");
  } catch (e) {
    return failure(e, req);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    let input;
    try {
      input = JSON.parse(
        new TextDecoder().decode(await readLimitedBody(req, 20000)),
      );
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, "Solicitação inválida.");
    }
    if (!input || typeof input !== "object")
      throw new HttpError(400, "Solicitação inválida.");
    const action = input.action;
    if (action === "moderate") {
      await moderator(id);
      const p = z
        .object({
          reportId: z.uuid(),
          decision: z.enum(["keep", "remove", "suspend"]).optional(),
          remove: z.boolean().optional(),
          note: z.string().trim().min(5).max(1000),
        })
        .parse(input);
      const decision = p.decision ?? (p.remove ? "remove" : "keep");
      const rows =
        await sql`WITH target AS (SELECT r.id,r.reporter_id,r.target_type,r.target_id,coalesce(p.author_id,pr.user_id,m.sender_id) AS owner FROM ml_reports r LEFT JOIN ml_publications p ON r.target_type='publication' AND p.id=r.target_id LEFT JOIN ml_profiles pr ON r.target_type='profile' AND pr.user_id=r.target_id LEFT JOIN ml_messages m ON r.target_type='message' AND m.id=r.target_id WHERE r.id=${p.reportId}), reviewed AS (UPDATE ml_reports r SET reviewed_at=now(),review_note=${p.note},reviewed_by=${id},decision=${decision} FROM target t WHERE r.id=t.id AND r.reviewed_at IS NULL AND t.reporter_id<>${id} AND t.owner<>${id} RETURNING r.id,r.target_type,r.target_id,t.owner), audit AS (INSERT INTO ml_moderation_actions(report_id,moderator_id,target_type,target_id,decision,note) SELECT id,${id},target_type,target_id,${decision},${p.note} FROM reviewed RETURNING id), publications AS (UPDATE ml_publications SET status='removed',version=version+1 WHERE ${decision}='remove' AND id IN (SELECT target_id FROM reviewed WHERE target_type='publication')), profiles AS (UPDATE ml_profiles SET hidden=true WHERE ${decision}='remove' AND user_id IN (SELECT target_id FROM reviewed WHERE target_type='profile')), messages AS (UPDATE ml_messages SET removed=true WHERE ${decision}='remove' AND id IN (SELECT target_id FROM reviewed WHERE target_type='message')), suspended AS (UPDATE ml_accounts SET status='suspended',session_version=session_version+1 WHERE ${decision}='suspend' AND id IN (SELECT owner FROM reviewed)) SELECT id FROM audit`;
      if (!rows.length)
        throw new HttpError(
          409,
          "Denúncia já revisada, inexistente ou sem revisor imparcial.",
        );
      return ok({ ok: true });
    }
    if (action === "restoreAccount") {
      await moderator(id);
      const p = z
        .object({ userId: z.uuid(), note: z.string().trim().min(5).max(1000) })
        .parse(input);
      const rows =
        await sql`WITH restored AS (UPDATE ml_accounts SET status='active',session_version=session_version+1 WHERE id=${p.userId} AND status='suspended' RETURNING id), audit AS (INSERT INTO ml_moderation_actions(moderator_id,target_type,target_id,decision,note) SELECT ${id},'account',id,'restore',${p.note} FROM restored RETURNING id) SELECT id FROM audit`;
      if (!rows.length)
        throw new HttpError(409, "Conta indisponível ou já reativada.");
      return ok({ ok: true });
    }
    if (action === "deleteAccount") {
      z.object({ confirm: z.literal("EXCLUIR") }).parse(input);
      const rows =
        await sql`WITH disabled AS (UPDATE ml_accounts SET status='deletion_requested',session_version=session_version+1 WHERE id=${id} RETURNING id), receipt AS (INSERT INTO ml_deletion_requests(account_id) SELECT id FROM disabled ON CONFLICT(account_id) DO UPDATE SET account_id=excluded.account_id RETURNING id) SELECT id AS protocolo FROM receipt`;
      const response = ok({
        protocolo: rows[0].protocolo,
        info: "Exposição pública e novos contatos desativados. A remoção definitiva de dados e mídia será tratada pelo suporte conforme a política de retenção.",
      });
      response.cookies.delete(nomeCookieSessao);
      return response;
    }
    if (action === "publish" || action === "edit") {
      const p = publicationInput.parse(input);
      if (new Date(p.fim) <= new Date())
        throw new HttpError(400, "Escolha um período futuro.");
      if (action === "publish") {
        const existing =
          await sql`SELECT id FROM ml_publications WHERE author_id=${id} AND request_id=${p.requestId}`;
        if (existing[0]) return ok({ id: existing[0].id });
        await limit(id, "publish", 10, 86400);
        const lat =
            p.latitude == null ? null : Math.round(p.latitude * 100) / 100,
          lng =
            p.longitude == null ? null : Math.round(p.longitude * 100) / 100;
        const rows =
          await sql`INSERT INTO ml_publications(author_id,type,category,title,description,city,neighborhood,price_minor,price_unit,starts_at,ends_at,request_id,latitude,longitude) VALUES(${id},${p.tipo},${p.categoria},${p.titulo},${p.descricao},${p.cidade},${p.bairro},${p.preco},${p.unidade},${p.inicio},${p.fim},${p.requestId},${lat},${lng}) ON CONFLICT(author_id,request_id) DO UPDATE SET request_id=excluded.request_id RETURNING id`;
        return ok({ id: rows[0].id });
      }
      const edit = z
        .object({ id: z.uuid(), version: z.number().int().positive() })
        .parse(input);
      const rows =
        await sql`UPDATE ml_publications SET type=${p.tipo},category=${p.categoria},title=${p.titulo},description=${p.descricao},city=${p.cidade},neighborhood=${p.bairro},price_minor=${p.preco},price_unit=${p.unidade},starts_at=${p.inicio},ends_at=${p.fim},latitude=${p.latitude == null ? null : Math.round(p.latitude * 100) / 100},longitude=${p.longitude == null ? null : Math.round(p.longitude * 100) / 100},updated_at=now(),version=version+1 WHERE id=${edit.id} AND author_id=${id} AND version=${edit.version} AND status NOT IN ('closed','removed') RETURNING id`;
      if (!rows[0])
        throw new HttpError(
          409,
          "Publicação indisponível ou alterada. Atualize a lista.",
        );
      return ok({ id: rows[0].id });
    }
    if (action === "status" || action === "serviceStatus") {
      const p = z
        .object({
          id: z.uuid(),
          version: z.number().int().positive(),
          status: z.enum(["active", "paused", "closed"]).optional(),
          situacao: z.enum(["pendente", "finalizado"]).optional(),
        })
        .parse(input);
      let rows;
      if (action === "serviceStatus") {
        if (!p.situacao)
          throw new HttpError(400, "Escolha a situação do serviço.");
        rows =
          await sql`UPDATE ml_publications SET service_status=${p.situacao},version=version+1 WHERE id=${p.id} AND author_id=${id} AND version=${p.version} AND status<>'removed' RETURNING id`;
      } else {
        if (!p.status) throw new HttpError(400, "Escolha o estado do anúncio.");
        rows =
          await sql`UPDATE ml_publications SET status=${p.status},version=version+1 WHERE id=${p.id} AND author_id=${id} AND version=${p.version} AND status NOT IN ('closed','removed') AND (${p.status}<>'active' OR ends_at>now()) RETURNING id`;
      }
      if (!rows[0])
        throw new HttpError(
          409,
          "Publicação indisponível ou alterada. Atualize a lista.",
        );
      return ok({ ok: true });
    }
    if (action === "profile") {
      const p = profileInput.parse(input);
      const rows =
        await sql`WITH owned AS (SELECT count(DISTINCT url) AS total FROM ml_media WHERE owner_id=${id} AND url=ANY(${p.images}::text[])), eligible AS (SELECT id FROM ml_accounts WHERE id=${id} AND status='active' AND (SELECT total FROM owned)=${new Set(p.images).size}), renamed AS (UPDATE ml_accounts SET name=${p.nome} WHERE id IN (SELECT id FROM eligible)) INSERT INTO ml_profiles(user_id,bio,category,city,neighborhood,portfolio,latitude,longitude,images,service_radius_km) SELECT id,${p.bio},${p.categoria},${p.cidade},${p.bairro},${p.portfolio},${p.latitude == null ? null : Math.round(p.latitude * 100) / 100},${p.longitude == null ? null : Math.round(p.longitude * 100) / 100},${JSON.stringify(p.images)}::jsonb,${p.raioAtendimento} FROM eligible ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,category=excluded.category,city=excluded.city,neighborhood=excluded.neighborhood,portfolio=excluded.portfolio,latitude=excluded.latitude,longitude=excluded.longitude,images=excluded.images,service_radius_km=excluded.service_radius_km,updated_at=now() RETURNING user_id`;
      if (!rows[0])
        throw new HttpError(
          403,
          "Foto não pertence à conta ou conta indisponível.",
        );
      return ok({ ok: true });
    }
    if (action === "interest") {
      const pub = requiredId(input.publicationId);
      await limit(id, "interest", 30, 3600);
      const rows =
        await sql`INSERT INTO ml_conversations(publication_id,author_id,initiator_id) SELECT p.id,p.author_id,${id} FROM ml_publications p JOIN ml_accounts a ON a.id=p.author_id WHERE p.id=${pub} AND a.status='active' AND p.author_id<>${id} AND p.status='active' AND p.ends_at>now() AND NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=${id} AND b.blocked_id=p.author_id) OR (b.blocker_id=p.author_id AND b.blocked_id=${id})) ON CONFLICT(publication_id,initiator_id) DO UPDATE SET publication_id=excluded.publication_id RETURNING id`;
      if (!rows[0])
        throw new HttpError(403, "Não é possível iniciar esta conversa.");
      return ok({ id: rows[0].id });
    }
    if (action === "message") {
      const p = messageInput.parse(input);
      await limit(id, "message", 60);
      const rows =
        await sql`INSERT INTO ml_messages(conversation_id,sender_id,body,client_id) SELECT c.id,${id},${p.texto},${p.clientId} FROM ml_conversations c JOIN ml_publications p ON p.id=c.publication_id JOIN ml_accounts a ON a.id=c.author_id JOIN ml_accounts i ON i.id=c.initiator_id WHERE a.status='active' AND i.status='active' AND p.status<>'removed' AND c.id=${p.conversationId} AND (c.author_id=${id} OR c.initiator_id=${id}) AND NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=c.author_id AND b.blocked_id=c.initiator_id) OR (b.blocker_id=c.initiator_id AND b.blocked_id=c.author_id)) ON CONFLICT(sender_id,client_id) DO UPDATE SET client_id=excluded.client_id WHERE ml_messages.conversation_id=excluded.conversation_id RETURNING id`;
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
          publicationId: z.uuid().optional(),
          targetType: z.enum(["publication", "profile", "message"]).optional(),
          targetId: z.uuid().optional(),
          reason: z.string().trim().min(5).max(1000),
        })
        .parse(input);
      const type = p.targetType ?? "publication",
        target = requiredId(p.targetId ?? p.publicationId);
      const existing =
        await sql`SELECT id FROM ml_reports WHERE reporter_id=${id} AND target_type=${type} AND target_id=${target} AND reviewed_at IS NULL`;
      if (existing[0]) return ok({ ok: true, id: existing[0].id });
      await limit(id, "report", 10, 3600);
      const rows =
        await sql`INSERT INTO ml_reports(reporter_id,publication_id,target_type,target_id,reason) SELECT ${id},CASE WHEN ${type}='publication' THEN ${target}::uuid ELSE NULL END,${type},${target},${p.reason} WHERE (${type}='publication' AND EXISTS(SELECT 1 FROM ml_publications WHERE id=${target})) OR (${type}='profile' AND EXISTS(SELECT 1 FROM ml_profiles WHERE user_id=${target})) OR (${type}='message' AND EXISTS(SELECT 1 FROM ml_messages m JOIN ml_conversations c ON c.id=m.conversation_id WHERE m.id=${target} AND (c.author_id=${id} OR c.initiator_id=${id}))) ON CONFLICT(reporter_id,target_type,target_id) WHERE reviewed_at IS NULL DO UPDATE SET reason=ml_reports.reason RETURNING id`;
      if (!rows[0]) throw new HttpError(404, "Conteúdo indisponível.");
      return ok({ ok: true, id: rows[0].id });
    }
    throw new HttpError(400, "Operação inválida.");
  } catch (e) {
    return failure(e, req);
  }
}
