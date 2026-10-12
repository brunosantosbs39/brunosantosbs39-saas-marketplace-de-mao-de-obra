import { neon } from "@neondatabase/serverless";
import { del, list } from "@vercel/blob";
if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN)
  throw new Error(
    "Configure DATABASE_URL e BLOB_READ_WRITE_TOKEN no ambiente correto.",
  );
const sql = neon(process.env.DATABASE_URL);
// Detach abandoned uploads and all media of accounts requesting deletion. Retain failed Blob deletions in the queue.
await sql`WITH obsolete AS (DELETE FROM ml_media m WHERE EXISTS(SELECT 1 FROM ml_accounts a WHERE a.id=m.owner_id AND a.status='deletion_requested') OR (m.created_at<now()-interval '1 day' AND NOT EXISTS(SELECT 1 FROM ml_profiles p WHERE p.user_id=m.owner_id AND p.images @> jsonb_build_array(m.url))) RETURNING url), queued AS (INSERT INTO ml_blob_deletions(url) SELECT url FROM obsolete ON CONFLICT DO NOTHING) DELETE FROM ml_media_slots WHERE reserved_at<now()-interval '1 day' AND (url IS NULL OR url IN(SELECT url FROM obsolete))`;
// Recover uploads whose process ended between Blob creation and database registration.
let cursor;
do {
  const page = await list({ prefix: "portfolio/", cursor, limit: 100 });
  for (const blob of page.blobs) {
    if (new Date(blob.uploadedAt).getTime() > Date.now() - 86400000) continue;
    const owned = await sql`SELECT id FROM ml_media WHERE url=${blob.url}`;
    if (!owned.length)
      await sql`INSERT INTO ml_blob_deletions(url) VALUES(${blob.url}) ON CONFLICT DO NOTHING`;
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);
const queue =
  await sql`SELECT url FROM ml_blob_deletions ORDER BY queued_at LIMIT 100`;
let completed = 0;
for (const { url } of queue) {
  try {
    await del(url);
    await sql`DELETE FROM ml_blob_deletions WHERE url=${url}`;
    completed++;
  } catch {
    await sql`UPDATE ml_blob_deletions SET attempts=attempts+1 WHERE url=${url}`;
  }
}
console.log(
  JSON.stringify({
    queued: queue.length,
    completed,
    remaining: queue.length - completed,
  }),
);
