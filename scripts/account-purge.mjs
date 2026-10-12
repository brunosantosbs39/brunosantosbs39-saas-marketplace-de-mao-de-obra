import { neon } from "@neondatabase/serverless";
const id = process.argv[2];
if (
  !process.env.DATABASE_URL ||
  !id ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
)
  throw new Error(
    "Uso: npm run account:purge -- <account_id>. Configure o ambiente correto.",
  );
const sql = neon(process.env.DATABASE_URL);
// Only a previously requested deletion can be finalized. Preserve pseudonymous participants for the other party's history.
await sql.transaction([
  sql`INSERT INTO ml_blob_deletions(url) SELECT m.url FROM ml_media m JOIN ml_accounts a ON a.id=m.owner_id WHERE a.id=${id} AND a.status='deletion_requested' ON CONFLICT DO NOTHING`,
  sql`DELETE FROM ml_profiles WHERE user_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
  sql`DELETE FROM ml_media WHERE owner_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
  sql`DELETE FROM ml_media_slots WHERE owner_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
  sql`UPDATE ml_messages SET body='[Mensagem retirada após solicitação de exclusão]',removed=true WHERE sender_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
  sql`UPDATE ml_publications SET status='removed',title='Anúncio retirado',description='Conteúdo retirado após solicitação de exclusão.',city='',neighborhood='',latitude=NULL,longitude=NULL,version=version+1 WHERE author_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
  sql`UPDATE ml_accounts SET name='Conta excluída',email='',google_sub='deleted:'||id::text,session_version=session_version+1 WHERE id=${id} AND status='deletion_requested'`,
  sql`UPDATE ml_deletion_requests SET completed_at=now() WHERE account_id=${id} AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='deletion_requested')`,
]);
console.log(
  "Retirada processada. Execute media:cleanup e examine dados incidentais em denúncias/auditoria conforme o procedimento de retenção.",
);
