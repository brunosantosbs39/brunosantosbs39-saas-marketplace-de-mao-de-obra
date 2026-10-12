import { NextResponse } from "next/server";
import { blobStorage } from "@/lib/media-storage";
import { preparePortfolioImage } from "@/lib/portfolio-image";
import { readLimitedBody } from "@/lib/request-body";
import { MAX_PHOTO_BYTES, MAX_PHOTO_REQUEST_BYTES } from "@/lib/media-limits";
import {
  account,
  sameOrigin,
  getDb,
  HttpError,
  rateLimit,
  limit,
  failure,
} from "@/lib/marketplace-server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  let url: string | undefined, reservation: string | undefined;
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    await limit(id, "upload", 20, 3600);
    if (!process.env.BLOB_READ_WRITE_TOKEN)
      throw new HttpError(
        503,
        "O envio de fotos está em configuração. Você pode salvar seu perfil sem fotos.",
      );
    const limited = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: await readLimitedBody(req, MAX_PHOTO_REQUEST_BYTES),
    });
    const file = (await limited.formData()).get("file");
    if (
      !(file instanceof File) ||
      file.size > MAX_PHOTO_BYTES ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      throw new HttpError(400, "Envie JPG, PNG ou WebP de até 4 MB.");
    const bytes = await preparePortfolioImage(
      Buffer.from(await file.arrayBuffer()),
    );
    reservation = crypto.randomUUID();
    const rows =
      await sql`INSERT INTO ml_media_slots(owner_id,slot,reservation_id) SELECT ${id},s,${reservation} FROM generate_series(1,10) s WHERE NOT EXISTS(SELECT 1 FROM ml_media_slots WHERE owner_id=${id} AND slot=s) AND EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='active') AND (SELECT count(*) FROM ml_media WHERE owner_id=${id})<10 ORDER BY s LIMIT 1 ON CONFLICT(owner_id,slot) DO NOTHING RETURNING reservation_id`;
    if (!rows.length)
      throw new HttpError(
        409,
        "Limite de 10 fotos ou outro envio em andamento. Remova uma foto ou tente novamente.",
      );
    const blob = await blobStorage.put(
      `portfolio/${id}/${reservation}.webp`,
      bytes,
      {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
      },
    );
    url = blob.url;
    const results = await sql.transaction([
      sql`UPDATE ml_media_slots SET url=${url} WHERE reservation_id=${reservation} AND owner_id=${id} RETURNING slot`,
      sql`INSERT INTO ml_media(owner_id,url) SELECT ${id},${url} WHERE EXISTS(SELECT 1 FROM ml_accounts WHERE id=${id} AND status='active') AND EXISTS(SELECT 1 FROM ml_media_slots WHERE reservation_id=${reservation} AND owner_id=${id}) RETURNING id`,
    ]);
    if (!results[1].length) throw new HttpError(403, "Conta indisponível.");
    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (url) {
      await getDb()`INSERT INTO ml_blob_deletions(url) VALUES(${url}) ON CONFLICT DO NOTHING`.catch(
        () => {},
      );
      await blobStorage.del(url).catch(() => {});
    }
    if (reservation)
      await getDb()`DELETE FROM ml_media_slots WHERE reservation_id=${reservation}`.catch(
        () => {},
      );
    return failure(e, req);
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    let data;
    try {
      data = JSON.parse(
        new TextDecoder().decode(await readLimitedBody(req, 4000)),
      );
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, "Solicitação inválida.");
    }
    const url = data?.url;
    if (typeof url !== "string" || url.length > 2048)
      throw new HttpError(400, "Foto inválida.");
    const rows =
      await sql`WITH owned AS (DELETE FROM ml_media WHERE owner_id=${id} AND url=${url} RETURNING url), queued AS (INSERT INTO ml_blob_deletions(url) SELECT url FROM owned ON CONFLICT DO NOTHING RETURNING url), detached AS (UPDATE ml_profiles SET images=coalesce((SELECT jsonb_agg(v) FROM jsonb_array_elements(images) v WHERE v<>to_jsonb(${url}::text)),'[]'::jsonb) WHERE user_id=${id} AND EXISTS(SELECT 1 FROM owned)), freed AS (DELETE FROM ml_media_slots WHERE owner_id=${id} AND url=${url} AND EXISTS(SELECT 1 FROM owned)) SELECT url FROM owned`;
    if (!rows[0]) throw new HttpError(404, "Foto indisponível.");
    // The persistent queue retains failed storage deletions for the cleanup command.
    try {
      await blobStorage.del(url);
      await sql`DELETE FROM ml_blob_deletions WHERE url=${url}`;
    } catch {}
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e, req);
  }
}
