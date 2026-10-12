import { account } from "@/lib/marketplace-server";
import { NextResponse } from "next/server";
import { lerCookieSessao, nomeCookieSessao } from "@/lib/sessao-servidor";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${nomeCookieSessao}=`))
    ?.slice(nomeCookieSessao.length + 1);

  let sessao = await lerCookieSessao(token);
  if (sessao) {
    try {
      await account(req);
    } catch {
      sessao = null;
    }
  }
  return NextResponse.json(
    { sessao },
    { headers: { "Cache-Control": "no-store" } },
  );
}
