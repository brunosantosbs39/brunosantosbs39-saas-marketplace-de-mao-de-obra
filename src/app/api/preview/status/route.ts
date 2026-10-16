import { NextResponse } from "next/server";
import { banco } from "@/lib/banco";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "development")
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  const config = {
    preview: true,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    sessionConfigured: Boolean(process.env.AUTH_SECRET),
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    previewUsesDatabase: false,
  };
  try {
    const sql = await banco();
    if (!sql) return NextResponse.json({ ...config, databaseConnected: false, schemaReady: false }, { headers: { "Cache-Control": "no-store" } });
    // Read-only connectivity and schema check: no business records or DDL.
    const rows = await sql`SELECT 1 AS ok,
      to_regclass('public.usuarios') IS NOT NULL
      AND to_regclass('public.portfolio') IS NOT NULL
      AND to_regclass('public.publicacoes') IS NOT NULL
      AND to_regclass('public.conversas') IS NOT NULL
      AND to_regclass('public.mensagens') IS NOT NULL
      AND to_regclass('public.propostas') IS NOT NULL
      AND to_regclass('public.ordens_servico') IS NOT NULL
      AND to_regclass('public.avaliacoes') IS NOT NULL
      AND to_regclass('public.denuncias') IS NOT NULL
      AND to_regclass('public.bloqueios') IS NOT NULL AS schema_ready`;
    return NextResponse.json({ ...config, databaseConnected: rows[0]?.ok === 1, schemaReady: rows[0]?.schema_ready === true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ...config, databaseConnected: false, schemaReady: false, error: "database_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
