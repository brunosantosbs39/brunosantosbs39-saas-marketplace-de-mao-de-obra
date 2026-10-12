import { z } from "zod";
import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { lerCookieSessao, nomeCookieSessao } from "./sessao-servidor";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
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
export function sessionToken(req: Request) {
  return (req.headers.get("cookie") || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(nomeCookieSessao + "="))
    ?.slice(nomeCookieSessao.length + 1);
}
export async function viewer(req: Request): Promise<string | null> {
  if (!sessionToken(req)) return null;
  return account(req);
}
export async function account(req: Request) {
  const session = await lerCookieSessao(sessionToken(req));
  if (!session?.id)
    throw new HttpError(401, "Entre com Google para continuar.");
  const rows =
    await getDb()`SELECT id,status,session_version FROM ml_accounts WHERE id=${session.id}`;
  if (!rows[0]) throw new HttpError(401, "Entre novamente.");
  if (rows[0].status !== "active")
    throw new HttpError(
      403,
      "Conta indisponível. Consulte o suporte nas configurações.",
    );
  if (Number(rows[0].session_version) !== (session.sessionVersion ?? 0))
    throw new HttpError(401, "Sua sessão expirou. Entre novamente.");
  return session.id;
}
export function sameOrigin(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    throw new HttpError(403, "Origem da solicitação inválida.");
}
export function requiredId(value: unknown) {
  const r = z.uuid().safeParse(value);
  if (!r.success) throw new HttpError(400, "Identificador inválido.");
  return r.data;
}
export function canParticipate(
  c: { author_id: string; initiator_id: string },
  id: string,
) {
  return c.author_id === id || c.initiator_id === id;
}
export async function rateLimit(id: string) {
  const rows =
    await getDb()`WITH cleanup AS (DELETE FROM ml_rate_limits WHERE minute<now()-interval '1 day') INSERT INTO ml_rate_limits(account_id,minute,count) VALUES(${id},date_trunc('minute',now()),1) ON CONFLICT(account_id,minute) DO UPDATE SET count=ml_rate_limits.count+1 RETURNING count`;
  if (Number(rows[0].count) > 120)
    throw new HttpError(429, "Muitas solicitações. Aguarde um minuto.", 60);
}
export async function limit(
  subject: string,
  scope: string,
  max: number,
  seconds = 60,
) {
  const rows =
    await getDb()`WITH cleanup AS (DELETE FROM ml_request_limits WHERE expires_at<now()) INSERT INTO ml_request_limits(subject,scope,window_start,count,expires_at) VALUES(${subject},${scope},to_timestamp(floor(extract(epoch FROM now())/${seconds})*${seconds}),1,now()+(${seconds}*interval '1 second')) ON CONFLICT(subject,scope,window_start) DO UPDATE SET count=ml_request_limits.count+1 RETURNING count`;
  if (Number(rows[0].count) > max)
    throw new HttpError(
      429,
      "Limite desta operação atingido. Tente mais tarde.",
      seconds,
    );
}
export async function readLimit(req: Request) {
  // Vercel replaces this header with the actual client address; never trust a client-provided X-Forwarded-For.
  const ip = process.env.VERCEL
    ? req.headers.get("x-vercel-forwarded-for") || "unknown"
    : "local";
  const subject = createHmac("sha256", process.env.AUTH_SECRET || "local-limit")
    .update(ip.split(",")[0].trim())
    .digest("hex");
  await limit("ip:" + subject, "read", 240);
}
export async function moderator(id: string) {
  const allowed = (process.env.MODERATOR_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const r =
    await getDb()`SELECT email FROM ml_accounts WHERE id=${id} AND status='active'`;
  if (!allowed.includes(String(r[0]?.email).toLowerCase()))
    throw new HttpError(403, "Acesso restrito à moderação.");
}
export function failure(e: unknown, req?: Request) {
  const requestId = randomUUID();
  const status =
    e instanceof HttpError ? e.status : e instanceof z.ZodError ? 400 : 500;
  console.error(
    JSON.stringify({
      event: "marketplace_error",
      requestId,
      status,
      path: req ? new URL(req.url).pathname : undefined,
      type: e instanceof Error ? e.name : "unknown",
    }),
  );
  return NextResponse.json(
    {
      error:
        e instanceof HttpError
          ? e.message
          : e instanceof z.ZodError
            ? "Confira os campos informados."
            : "Não foi possível concluir. Tente novamente.",
      requestId,
      ...(e instanceof z.ZodError ? { fields: e.flatten().fieldErrors } : {}),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        ...(e instanceof HttpError && e.retryAfter
          ? { "Retry-After": String(e.retryAfter) }
          : {}),
      },
    },
  );
}
