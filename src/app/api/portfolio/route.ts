import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { preparePortfolioImage } from "@/lib/portfolio-image";
import { readLimitedBody } from "@/lib/request-body";
import {
  account,
  sameOrigin,
  getDb,
  HttpError,
  rateLimit,
} from "@/lib/marketplace-server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  let url: string | undefined;
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    if (!process.env.BLOB_READ_WRITE_TOKEN)
      throw new HttpError(
        503,
        "O envio de fotos está em configuração. Você pode salvar seu perfil sem fotos.",
      );
    if (
      Number(req.headers.get("content-length") || 0) >
      5 * 1024 * 1024 + 10000
    )
      throw new HttpError(413, "A foto deve ter até 5 MB.");
    const count =
      await sql`SELECT count(*) AS total FROM ml_media WHERE owner_id=${id}`;
    if (Number(count[0].total) >= 10)
      throw new HttpError(400, "Limite de 10 fotos por perfil.");
    const limited = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: await readLimitedBody(req, 5 * 1024 * 1024 + 10000),
    });
    const file = (await limited.formData()).get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      throw new HttpError(400, "Envie JPG, PNG ou WebP de até 5 MB.");
    const bytes = await preparePortfolioImage(
      Buffer.from(await file.arrayBuffer()),
    );
    const blob = await put(
      `portfolio/${id}/${crypto.randomUUID()}.webp`,
      bytes,
      { access: "public", contentType: "image/webp" },
    );
    url = blob.url;
    await sql`INSERT INTO ml_media(owner_id,url) VALUES(${id},${url})`;
    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (url) await del(url).catch(() => {});
    return NextResponse.json(
      {
        error:
          e instanceof HttpError
            ? e.message
            : "Não foi possível enviar a imagem.",
      },
      { status: e instanceof HttpError ? e.status : 400 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const id = await account(req),
      sql = getDb();
    await rateLimit(id);
    const { url } = await req.json();
    if (typeof url !== "string" || url.length > 2048)
      throw new HttpError(400, "Foto inválida.");
    const rows =
      await sql`SELECT id FROM ml_media WHERE owner_id=${id} AND url=${url}`;
    if (!rows[0]) throw new HttpError(404, "Foto indisponível.");
    await del(url);
    await sql.transaction([
      sql`UPDATE ml_profiles SET images=coalesce((SELECT jsonb_agg(v) FROM jsonb_array_elements(images) v WHERE v<>to_jsonb(${url}::text)),'[]'::jsonb) WHERE user_id=${id}`,
      sql`DELETE FROM ml_media WHERE owner_id=${id} AND url=${url}`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof HttpError
            ? e.message
            : "Não foi possível remover a foto.",
      },
      { status: e instanceof HttpError ? e.status : 500 },
    );
  }
}
