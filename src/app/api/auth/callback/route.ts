import { NextResponse } from "next/server";
import {
  criarCookieSessao,
  nomeCookieOAuthState,
  nomeCookieSessao,
} from "@/lib/sessao-servidor";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const erroGoogle = url.searchParams.get("error");
  const cookies = req.headers.get("cookie") || "";
  const stateCookie = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${nomeCookieOAuthState}=`))
    ?.slice(nomeCookieOAuthState.length + 1);

  if (erroGoogle || !code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(new URL("/entrar?erro=google-cancelado", url.origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/entrar?erro=google-nao-configurado", url.origin));
  }

  try {
    const redirectUri = `${url.origin}/api/auth/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) throw new Error("Falha ao trocar código OAuth");
    const tokens = await tokenResponse.json();

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!userResponse.ok) throw new Error("Falha ao carregar perfil Google");

    const user = await userResponse.json();
    const tokenSessao = await criarCookieSessao({
      nome: user.name || user.email || "Usuário Google",
      email: user.email,
    });

    const response = NextResponse.redirect(new URL("/entrar?google=sucesso", url.origin));
    response.cookies.set(nomeCookieSessao, tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete(nomeCookieOAuthState);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/entrar?erro=google-falhou", url.origin));
  }
}
