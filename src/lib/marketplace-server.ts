import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { lerCookieSessao, nomeCookieSessao } from "./sessao-servidor";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new HttpError(
      503,
      "O serviço está em configuração. Tente novamente mais tarde.",
    );
  return neon(process.env.DATABASE_URL);
}
export async function account(req: Request) {
  const token = (req.headers.get("cookie") || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(nomeCookieSessao + "="))
    ?.slice(nomeCookieSessao.length + 1);
  const session = await lerCookieSessao(token);
  if (!session?.id)
    throw new HttpError(401, "Entre com Google para continuar.");
  const rows = await getDb()`SELECT id FROM ml_accounts WHERE id=${session.id}`;
  if (!rows[0]) throw new HttpError(401, "Entre novamente.");
  return session.id;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin !== new URL(req.url).origin)
    throw new HttpError(403, "Origem da solicitação inválida.");
}
export function requiredId(value: unknown) {
  const result = z.uuid().safeParse(value);
  if (!result.success) throw new HttpError(400, "Identificador inválido.");
  return result.data;
}
export function canParticipate(
  c: { author_id: string; initiator_id: string },
  id: string,
) {
  return c.author_id === id || c.initiator_id === id;
}

export async function rateLimit(id: string) {
  const rows =
    await getDb()`INSERT INTO ml_rate_limits(account_id,minute,count) VALUES(${id},date_trunc('minute',now()),1) ON CONFLICT(account_id,minute) DO UPDATE SET count=ml_rate_limits.count+1 RETURNING count`;
  if (Number(rows[0].count) > 120)
    throw new HttpError(429, "Muitas solicitações. Aguarde um minuto.");
}
export async function moderator(id: string) {
  const allowed = (process.env.MODERATOR_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const rows = await getDb()`SELECT email FROM ml_accounts WHERE id=${id}`;
  if (!allowed.includes(String(rows[0]?.email).toLowerCase()))
    throw new HttpError(403, "Acesso restrito à moderação.");
}
