import { banco } from "./banco";
import type { Sessao } from "./types";

let schemaPronto = false;

export function idDaSessao(sessao: Sessao) {
  if (sessao.id) return sessao.id;
  const base = (sessao.email || sessao.nome || "usuario").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `usr-${base || "local"}`.slice(0, 80);
}

export async function sqlMvp() {
  const sql = await banco();
  if (!sql) throw new Error("DATABASE_URL não configurado");
  if (!schemaPronto) {
    await sql`CREATE TABLE IF NOT EXISTS usuarios (
      id text PRIMARY KEY,
      nome text NOT NULL,
      email text,
      papel text NOT NULL DEFAULT 'ambos',
      bio text NOT NULL DEFAULT '',
      categorias text NOT NULL DEFAULT '',
      disponivel boolean NOT NULL DEFAULT true,
      localizacao_descricao text,
      latitude double precision,
      longitude double precision,
      criado_em timestamptz NOT NULL DEFAULT now(),
      atualizado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique ON usuarios (email) WHERE email IS NOT NULL`;
    await sql`CREATE TABLE IF NOT EXISTS portfolio (
      id text PRIMARY KEY,
      usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      descricao text NOT NULL,
      imagem_url text,
      criado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS publicacoes (
      id text PRIMARY KEY,
      usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      tipo text NOT NULL CHECK (tipo IN ('contratar','disponivel')),
      categoria text NOT NULL,
      titulo text NOT NULL,
      descricao text NOT NULL DEFAULT '',
      valor numeric(12,2),
      urgente boolean NOT NULL DEFAULT false,
      localizacao_descricao text,
      latitude double precision,
      longitude double precision,
      raio_km integer NOT NULL DEFAULT 10,
      status text NOT NULL DEFAULT 'aberta',
      criado_em timestamptz NOT NULL DEFAULT now(),
      atualizado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS publicacoes_feed_idx ON publicacoes (status, criado_em DESC)`;
    await sql`CREATE TABLE IF NOT EXISTS conversas (
      id text PRIMARY KEY,
      publicacao_id text REFERENCES publicacoes(id) ON DELETE SET NULL,
      contratante_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      profissional_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      criado_em timestamptz NOT NULL DEFAULT now(),
      atualizado_em timestamptz NOT NULL DEFAULT now(),
      UNIQUE(publicacao_id, contratante_id, profissional_id)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS mensagens (
      id text PRIMARY KEY,
      conversa_id text NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
      usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      texto text NOT NULL,
      criado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS mensagens_conversa_idx ON mensagens (conversa_id, criado_em)`;
    await sql`CREATE TABLE IF NOT EXISTS propostas (
      id text PRIMARY KEY,
      publicacao_id text NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
      profissional_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      valor numeric(12,2) NOT NULL,
      mensagem text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'pendente',
      criado_em timestamptz NOT NULL DEFAULT now(),
      UNIQUE(publicacao_id, profissional_id)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS ordens_servico (
      id text PRIMARY KEY,
      publicacao_id text NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
      proposta_id text REFERENCES propostas(id) ON DELETE SET NULL,
      contratante_id text NOT NULL REFERENCES usuarios(id),
      profissional_id text NOT NULL REFERENCES usuarios(id),
      status text NOT NULL DEFAULT 'confirmado',
      valor numeric(12,2) NOT NULL,
      pagamento_status text NOT NULL DEFAULT 'pendente_integracao',
      criado_em timestamptz NOT NULL DEFAULT now(),
      concluido_em timestamptz
    )`;
    await sql`CREATE TABLE IF NOT EXISTS avaliacoes (
      id text PRIMARY KEY,
      ordem_id text NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
      avaliador_id text NOT NULL REFERENCES usuarios(id),
      avaliado_id text NOT NULL REFERENCES usuarios(id),
      nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
      comentario text NOT NULL DEFAULT '',
      criado_em timestamptz NOT NULL DEFAULT now(),
      UNIQUE(ordem_id, avaliador_id)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS denuncias (
      id text PRIMARY KEY,
      denunciante_id text NOT NULL REFERENCES usuarios(id),
      usuario_alvo_id text REFERENCES usuarios(id),
      publicacao_id text REFERENCES publicacoes(id),
      motivo text NOT NULL,
      status text NOT NULL DEFAULT 'aberta',
      criado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS bloqueios (
      bloqueador_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      bloqueado_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      criado_em timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (bloqueador_id, bloqueado_id)
    )`;
    schemaPronto = true;
  }
  return sql;
}

export async function garantirUsuario(sessao: Sessao) {
  const sql = await sqlMvp();
  const id = idDaSessao(sessao);
  await sql`INSERT INTO usuarios (id,nome,email,papel)
    VALUES (${id}, ${sessao.nome}, ${sessao.email || null}, ${sessao.papel || "ambos"})
    ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, email=COALESCE(EXCLUDED.email, usuarios.email), atualizado_em=now()`;
  return id;
}
