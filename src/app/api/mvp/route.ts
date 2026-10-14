import { NextResponse } from "next/server";
import { z } from "zod";
import { garantirUsuario, idDaSessao, sqlMvp } from "@/lib/repositorio";
import { sessaoDaRequisicao } from "@/lib/sessao-servidor";

const Publicar = z.object({ action: z.literal("publicar"), tipo: z.enum(["contratar","disponivel"]), categoria: z.string().min(2).max(80), titulo: z.string().min(3).max(140), descricao: z.string().max(3000).default(""), valor: z.number().nonnegative().max(1000000).nullable().optional(), urgente: z.boolean().optional(), localizacaoDescricao: z.string().max(180).optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), raioKm: z.number().int().min(1).max(100).optional() });
const Perfil = z.object({ action: z.literal("salvarPerfil"), nome: z.string().min(2).max(80), bio: z.string().max(1200).default(""), categorias: z.array(z.string().min(2).max(80)).max(10), disponivel: z.boolean(), localizacaoDescricao: z.string().max(180).optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), portfolio: z.array(z.object({ descricao: z.string().min(2).max(500), imagemUrl: z.string().url().optional() })).max(12).default([]) });
const AbrirConversa = z.object({ action: z.literal("abrirConversa"), publicacaoId: z.string().min(1).max(120) });
const EnviarMensagem = z.object({ action: z.literal("enviarMensagem"), conversaId: z.string().min(1).max(120), texto: z.string().min(1).max(3000) });
const EnviarProposta = z.object({ action: z.literal("enviarProposta"), publicacaoId: z.string().min(1).max(120), valor: z.number().positive().max(1000000), mensagem: z.string().max(1200).default("") });
const AceitarProposta = z.object({ action: z.literal("aceitarProposta"), propostaId: z.string().min(1).max(120) });
const AtualizarOrdem = z.object({ action: z.literal("atualizarOrdem"), ordemId: z.string().min(1).max(120), status: z.enum(["em_andamento","concluido","cancelado"]) });
const Avaliar = z.object({ action: z.literal("avaliar"), ordemId: z.string().min(1).max(120), nota: z.number().int().min(1).max(5), comentario: z.string().max(1200).default("") });
const Denunciar = z.object({ action: z.literal("denunciar"), usuarioAlvoId: z.string().max(120).optional(), publicacaoId: z.string().max(120).optional(), motivo: z.string().min(5).max(1000) });
const Bloquear = z.object({ action: z.literal("bloquear"), usuarioAlvoId: z.string().min(1).max(120) });
const Payload = z.discriminatedUnion("action", [Publicar, Perfil, AbrirConversa, EnviarMensagem, EnviarProposta, AceitarProposta, AtualizarOrdem, Avaliar, Denunciar, Bloquear]);

async function contexto(req: Request) {
  const sessao = await sessaoDaRequisicao(req);
  if (!sessao) return null;
  const userId = await garantirUsuario(sessao);
  const sql = await sqlMvp();
  return { sessao, userId, sql };
}

function semBanco(erro: unknown) {
  const mensagem = erro instanceof Error ? erro.message : "Falha interna";
  const status = mensagem.includes("DATABASE_URL") ? 503 : 500;
  return NextResponse.json({ erro: mensagem }, { status });
}

export async function GET(req: Request) {
  try {
    const ctx = await contexto(req);
    if (!ctx) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    const { sql, userId } = ctx;
    const url = new URL(req.url);
    const recurso = url.searchParams.get("recurso") || "feed";

    if (recurso === "feed") {
      const categoria = (url.searchParams.get("categoria") || "").trim();
      const q = (url.searchParams.get("q") || "").trim();
      const rows = await sql`SELECT p.id,p.tipo,p.categoria,p.titulo,p.descricao,p.valor,p.urgente,p.status,p.localizacao_descricao,p.latitude,p.longitude,p.raio_km,p.criado_em,u.id AS autor_id,u.nome AS autor_nome
        FROM publicacoes p JOIN usuarios u ON u.id=p.usuario_id
        WHERE p.status IN ('aberta','em_andamento')
          AND (${categoria} = '' OR p.categoria = ${categoria})
          AND (${q} = '' OR p.titulo ILIKE ${`%${q}%`} OR p.descricao ILIKE ${`%${q}%`} OR p.categoria ILIKE ${`%${q}%`})
          AND NOT EXISTS (SELECT 1 FROM bloqueios b WHERE b.bloqueador_id=${userId} AND b.bloqueado_id=p.usuario_id)
        ORDER BY p.urgente DESC,p.criado_em DESC LIMIT 100`;
      return NextResponse.json({ publicacoes: rows });
    }

    if (recurso === "perfil") {
      const usuarios = await sql`SELECT id,nome,email,papel,bio,categorias,disponivel,localizacao_descricao,latitude,longitude FROM usuarios WHERE id=${userId} LIMIT 1`;
      const portfolio = await sql`SELECT id,descricao,imagem_url,criado_em FROM portfolio WHERE usuario_id=${userId} ORDER BY criado_em DESC LIMIT 20`;
      const avaliacao = await sql`SELECT COALESCE(AVG(nota),0)::float AS media, COUNT(*)::int AS total FROM avaliacoes WHERE avaliado_id=${userId}`;
      return NextResponse.json({ perfil: usuarios[0] || null, portfolio, avaliacao: avaliacao[0] || { media: 0, total: 0 } });
    }

    if (recurso === "conversas") {
      const conversaId = url.searchParams.get("conversaId");
      if (conversaId) {
        const acesso = await sql`SELECT id FROM conversas WHERE id=${conversaId} AND (${userId}=contratante_id OR ${userId}=profissional_id) LIMIT 1`;
        if (!acesso.length) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });
        const mensagens = await sql`SELECT m.id,m.conversa_id,m.usuario_id,m.texto,m.criado_em,u.nome AS autor_nome FROM mensagens m JOIN usuarios u ON u.id=m.usuario_id WHERE m.conversa_id=${conversaId} ORDER BY m.criado_em ASC LIMIT 100`;
        return NextResponse.json({ mensagens });
      }
      const conversas = await sql`SELECT c.id,c.publicacao_id,c.atualizado_em,p.titulo,
        CASE WHEN c.contratante_id=${userId} THEN up.nome ELSE uc.nome END AS outra_pessoa,
        (SELECT texto FROM mensagens m WHERE m.conversa_id=c.id ORDER BY m.criado_em DESC LIMIT 1) AS ultima_mensagem
        FROM conversas c LEFT JOIN publicacoes p ON p.id=c.publicacao_id
        JOIN usuarios uc ON uc.id=c.contratante_id JOIN usuarios up ON up.id=c.profissional_id
        WHERE c.contratante_id=${userId} OR c.profissional_id=${userId}
        ORDER BY c.atualizado_em DESC LIMIT 50`;
      return NextResponse.json({ conversas });
    }

    if (recurso === "servicos") {
      const publicacoes = await sql`SELECT p.*, (SELECT COUNT(*)::int FROM propostas pr WHERE pr.publicacao_id=p.id) AS total_propostas FROM publicacoes p WHERE p.usuario_id=${userId} ORDER BY p.criado_em DESC LIMIT 100`;
      const propostas = await sql`SELECT pr.id,pr.publicacao_id,pr.valor,pr.mensagem,pr.status,pr.criado_em,u.nome AS profissional_nome,p.titulo FROM propostas pr JOIN usuarios u ON u.id=pr.profissional_id JOIN publicacoes p ON p.id=pr.publicacao_id WHERE p.usuario_id=${userId} OR pr.profissional_id=${userId} ORDER BY pr.criado_em DESC LIMIT 100`;
      const ordens = await sql`SELECT o.id,o.publicacao_id,o.status,o.valor,o.pagamento_status,o.criado_em,o.concluido_em,p.titulo,uc.nome AS contratante_nome,up.nome AS profissional_nome FROM ordens_servico o JOIN publicacoes p ON p.id=o.publicacao_id JOIN usuarios uc ON uc.id=o.contratante_id JOIN usuarios up ON up.id=o.profissional_id WHERE o.contratante_id=${userId} OR o.profissional_id=${userId} ORDER BY o.criado_em DESC LIMIT 100`;
      return NextResponse.json({ publicacoes, propostas, ordens });
    }

    return NextResponse.json({ erro: "Recurso inválido" }, { status: 400 });
  } catch (erro) {
    return semBanco(erro);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await contexto(req);
    if (!ctx) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    const body = Payload.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: body.error.flatten() }, { status: 422 });
    const { sql, userId } = ctx;
    const p = body.data;

    if (p.action === "publicar") {
      const id = `pub-${crypto.randomUUID()}`;
      await sql`INSERT INTO publicacoes (id,usuario_id,tipo,categoria,titulo,descricao,valor,urgente,localizacao_descricao,latitude,longitude,raio_km)
        VALUES (${id},${userId},${p.tipo},${p.categoria},${p.titulo},${p.descricao},${p.valor ?? null},${p.urgente || false},${p.localizacaoDescricao || null},${p.latitude ?? null},${p.longitude ?? null},${p.raioKm || 10})`;
      return NextResponse.json({ ok: true, id }, { status: 201 });
    }

    if (p.action === "salvarPerfil") {
      await sql`UPDATE usuarios SET nome=${p.nome},bio=${p.bio},categorias=${p.categorias.join(",")},disponivel=${p.disponivel},localizacao_descricao=${p.localizacaoDescricao || null},latitude=${p.latitude ?? null},longitude=${p.longitude ?? null},atualizado_em=now() WHERE id=${userId}`;
      await sql`DELETE FROM portfolio WHERE usuario_id=${userId}`;
      for (const item of p.portfolio) await sql`INSERT INTO portfolio (id,usuario_id,descricao,imagem_url) VALUES (${`port-${crypto.randomUUID()}`},${userId},${item.descricao},${item.imagemUrl || null})`;
      return NextResponse.json({ ok: true });
    }

    if (p.action === "abrirConversa") {
      const pubs = await sql`SELECT id,usuario_id,tipo FROM publicacoes WHERE id=${p.publicacaoId} LIMIT 1`;
      if (!pubs.length) return NextResponse.json({ erro: "Publicação não encontrada" }, { status: 404 });
      const pub = pubs[0] as { id: string; usuario_id: string; tipo: string };
      if (pub.usuario_id === userId) return NextResponse.json({ erro: "Você não pode conversar consigo mesmo" }, { status: 409 });
      const contratanteId = pub.tipo === "contratar" ? pub.usuario_id : userId;
      const profissionalId = pub.tipo === "contratar" ? userId : pub.usuario_id;
      const bloqueio = await sql`SELECT 1 FROM bloqueios WHERE (bloqueador_id=${contratanteId} AND bloqueado_id=${profissionalId}) OR (bloqueador_id=${profissionalId} AND bloqueado_id=${contratanteId}) LIMIT 1`;
      if (bloqueio.length) return NextResponse.json({ erro: "Conversa indisponível" }, { status: 403 });
      const existente = await sql`SELECT id FROM conversas WHERE publicacao_id=${p.publicacaoId} AND contratante_id=${contratanteId} AND profissional_id=${profissionalId} LIMIT 1`;
      if (existente.length) return NextResponse.json({ ok: true, conversaId: existente[0].id });
      const id = `conv-${crypto.randomUUID()}`;
      await sql`INSERT INTO conversas (id,publicacao_id,contratante_id,profissional_id) VALUES (${id},${p.publicacaoId},${contratanteId},${profissionalId})`;
      return NextResponse.json({ ok: true, conversaId: id }, { status: 201 });
    }

    if (p.action === "enviarMensagem") {
      const acesso = await sql`SELECT id FROM conversas WHERE id=${p.conversaId} AND (${userId}=contratante_id OR ${userId}=profissional_id) LIMIT 1`;
      if (!acesso.length) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });
      const id = `msg-${crypto.randomUUID()}`;
      await sql`INSERT INTO mensagens (id,conversa_id,usuario_id,texto) VALUES (${id},${p.conversaId},${userId},${p.texto})`;
      await sql`UPDATE conversas SET atualizado_em=now() WHERE id=${p.conversaId}`;
      return NextResponse.json({ ok: true, id }, { status: 201 });
    }

    if (p.action === "enviarProposta") {
      const pubs = await sql`SELECT id,usuario_id,tipo,status FROM publicacoes WHERE id=${p.publicacaoId} LIMIT 1`;
      if (!pubs.length || pubs[0].tipo !== "contratar" || pubs[0].status !== "aberta") return NextResponse.json({ erro: "Vaga indisponível para proposta" }, { status: 409 });
      if (pubs[0].usuario_id === userId) return NextResponse.json({ erro: "Você não pode propor para sua própria vaga" }, { status: 409 });
      const id = `prop-${crypto.randomUUID()}`;
      await sql`INSERT INTO propostas (id,publicacao_id,profissional_id,valor,mensagem) VALUES (${id},${p.publicacaoId},${userId},${p.valor},${p.mensagem}) ON CONFLICT (publicacao_id,profissional_id) DO UPDATE SET valor=EXCLUDED.valor,mensagem=EXCLUDED.mensagem,status='pendente',criado_em=now()`;
      return NextResponse.json({ ok: true, id });
    }

    if (p.action === "aceitarProposta") {
      const props = await sql`SELECT pr.id,pr.publicacao_id,pr.profissional_id,pr.valor,p.usuario_id,p.status FROM propostas pr JOIN publicacoes p ON p.id=pr.publicacao_id WHERE pr.id=${p.propostaId} LIMIT 1`;
      if (!props.length || props[0].usuario_id !== userId) return NextResponse.json({ erro: "Proposta não encontrada" }, { status: 404 });
      if (props[0].status !== "aberta") return NextResponse.json({ erro: "Serviço já fechado" }, { status: 409 });
      const ordemId = `os-${crypto.randomUUID()}`;
      await sql`INSERT INTO ordens_servico (id,publicacao_id,proposta_id,contratante_id,profissional_id,valor) VALUES (${ordemId},${props[0].publicacao_id},${p.propostaId},${userId},${props[0].profissional_id},${props[0].valor})`;
      await sql`UPDATE propostas SET status=CASE WHEN id=${p.propostaId} THEN 'aceita' ELSE 'recusada' END WHERE publicacao_id=${props[0].publicacao_id}`;
      await sql`UPDATE publicacoes SET status='em_andamento',atualizado_em=now() WHERE id=${props[0].publicacao_id}`;
      return NextResponse.json({ ok: true, ordemId });
    }

    if (p.action === "atualizarOrdem") {
      const ordens = await sql`SELECT id,publicacao_id,contratante_id,profissional_id,status FROM ordens_servico WHERE id=${p.ordemId} LIMIT 1`;
      if (!ordens.length || (ordens[0].contratante_id !== userId && ordens[0].profissional_id !== userId)) return NextResponse.json({ erro: "Ordem não encontrada" }, { status: 404 });
      await sql`UPDATE ordens_servico SET status=${p.status},concluido_em=CASE WHEN ${p.status}='concluido' THEN now() ELSE concluido_em END WHERE id=${p.ordemId}`;
      if (p.status === "concluido") await sql`UPDATE publicacoes SET status='finalizada',atualizado_em=now() WHERE id=${ordens[0].publicacao_id}`;
      if (p.status === "cancelado") await sql`UPDATE publicacoes SET status='aberta',atualizado_em=now() WHERE id=${ordens[0].publicacao_id}`;
      return NextResponse.json({ ok: true });
    }

    if (p.action === "avaliar") {
      const ordens = await sql`SELECT contratante_id,profissional_id,status FROM ordens_servico WHERE id=${p.ordemId} LIMIT 1`;
      if (!ordens.length || ordens[0].status !== "concluido") return NextResponse.json({ erro: "Serviço ainda não pode ser avaliado" }, { status: 409 });
      const avaliadoId = ordens[0].contratante_id === userId ? ordens[0].profissional_id : ordens[0].contratante_id;
      if (!avaliadoId || (ordens[0].contratante_id !== userId && ordens[0].profissional_id !== userId)) return NextResponse.json({ erro: "Sem acesso" }, { status: 403 });
      await sql`INSERT INTO avaliacoes (id,ordem_id,avaliador_id,avaliado_id,nota,comentario) VALUES (${`av-${crypto.randomUUID()}`},${p.ordemId},${userId},${avaliadoId},${p.nota},${p.comentario}) ON CONFLICT (ordem_id,avaliador_id) DO UPDATE SET nota=EXCLUDED.nota,comentario=EXCLUDED.comentario`;
      return NextResponse.json({ ok: true });
    }

    if (p.action === "denunciar") {
      if (!p.usuarioAlvoId && !p.publicacaoId) return NextResponse.json({ erro: "Informe o alvo da denúncia" }, { status: 422 });
      await sql`INSERT INTO denuncias (id,denunciante_id,usuario_alvo_id,publicacao_id,motivo) VALUES (${`den-${crypto.randomUUID()}`},${userId},${p.usuarioAlvoId || null},${p.publicacaoId || null},${p.motivo})`;
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (p.action === "bloquear") {
      if (p.usuarioAlvoId === userId) return NextResponse.json({ erro: "Bloqueio inválido" }, { status: 422 });
      await sql`INSERT INTO bloqueios (bloqueador_id,bloqueado_id) VALUES (${userId},${p.usuarioAlvoId}) ON CONFLICT DO NOTHING`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erro: "Ação inválida" }, { status: 400 });
  } catch (erro) {
    return semBanco(erro);
  }
}
