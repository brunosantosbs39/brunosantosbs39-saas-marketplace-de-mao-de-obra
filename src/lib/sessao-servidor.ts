import type { Sessao } from "./types";

export const nomeCookieSessao = "mao-de-obra-sessao";
export const nomeCookieOAuthState = "mao-de-obra-oauth-state";

function base64Url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

async function assinar(valor: string) {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) throw new Error("AUTH_SECRET não configurado");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const assinatura = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(valor));
  return base64Url(new Uint8Array(assinatura));
}

export async function criarCookieSessao(sessao: Sessao) {
  const payload = base64Url(JSON.stringify({
    ...sessao,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }));
  return `${payload}.${await assinar(payload)}`;
}

export async function lerCookieSessao(token?: string | null): Promise<Sessao | null> {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;
  const esperado = await assinar(payload);
  if (esperado !== assinatura) return null;

  try {
    const dados = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!dados.exp || dados.exp < Date.now()) return null;
    return { nome: dados.nome, email: dados.email };
  } catch {
    return null;
  }
}
