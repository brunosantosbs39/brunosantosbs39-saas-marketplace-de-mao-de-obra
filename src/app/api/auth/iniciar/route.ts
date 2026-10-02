import { NextResponse } from "next/server";
import { nomeCookieOAuthState } from "@/lib/sessao-servidor";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const authSecret = process.env.AUTH_SECRET;
  const url = new URL(req.url);

  if (!clientId || !authSecret) {
    return NextResponse.redirect(new URL("/entrar?erro=google-nao-configurado", url.origin));
  }

  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/auth/callback`;

  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", clientId);
  google.searchParams.set("redirect_uri", redirectUri);
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("access_type", "online");
  google.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(google);
  response.cookies.set(nomeCookieOAuthState, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
