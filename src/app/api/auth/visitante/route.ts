import { NextResponse } from "next/server";
import { criarCookieSessao, nomeCookieSessao } from "@/lib/sessao-servidor";
import { garantirUsuario } from "@/lib/repositorio";

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) return NextResponse.json({ erro: "AUTH_SECRET não configurado" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const nome = typeof body.nome === "string" && body.nome.trim() ? body.nome.trim().slice(0, 80) : "Visitante de teste";
  const sessao = { id: `visitante-${crypto.randomUUID()}`, nome, papel: "ambos" as const, modo: "visitante" as const };
  try {
    await garantirUsuario(sessao);
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Banco indisponível" }, { status: 503 });
  }
  const token = await criarCookieSessao(sessao);
  const response = NextResponse.json({ sessao });
  response.cookies.set(nomeCookieSessao, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
