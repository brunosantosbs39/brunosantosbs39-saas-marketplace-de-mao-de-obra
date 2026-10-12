import { sameOrigin, failure } from "@/lib/marketplace-server";
import { NextResponse } from "next/server";
import { nomeCookieSessao } from "@/lib/sessao-servidor";

export async function POST(req: Request) {
  try {
    sameOrigin(req);
  } catch (e) {
    return failure(e, req);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(nomeCookieSessao, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
