import { NextResponse } from "next/server";
import { lerCookieSessao, nomeCookieSessao } from "@/lib/sessao-servidor";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${nomeCookieSessao}=`))
    ?.slice(nomeCookieSessao.length + 1);

  const sessao = await lerCookieSessao(token);
  return NextResponse.json({ sessao });
}
