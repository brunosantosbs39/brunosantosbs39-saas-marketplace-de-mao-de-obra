import { neon } from "@neondatabase/serverless";
export const COLECOES=["publicacoes","profissionais","conversas","mensagens"] as const;
export async function banco(){if(!process.env.DATABASE_URL)return null;return neon(process.env.DATABASE_URL);}
