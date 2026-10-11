import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Sessao } from "./types";

export const nomeCookieSessao = "mao-de-obra-sessao";
export const nomeCookieOAuthState = "mao-de-obra-oauth-state";

function base64Url(input: Uint8Array | string) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

async function assinar(valor: string) {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) throw new Error("AUTH_SECRET não configurado");
  return createHmac("sha256", segredo).update(valor).digest("base64url");
}

export async function criarCookieSessao(sessao: Sessao) {
  const payload = base64Url(
    JSON.stringify({
      ...sessao,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  );
  return `${payload}.${await assinar(payload)}`;
}

export async function lerCookieSessao(
  token?: string | null,
): Promise<Sessao | null> {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;
  if (!process.env.AUTH_SECRET) return null;
  const esperado = await assinar(payload);
  const a = Buffer.from(esperado),
    b = Buffer.from(assinatura);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const dados = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!Number.isSafeInteger(dados.exp) || dados.exp < Date.now()) return null;
    if (!z.uuid().safeParse(dados.id).success || typeof dados.nome !== "string")
      return null;
    return { id: dados.id, nome: dados.nome, email: dados.email };
  } catch {
    return null;
  }
}
