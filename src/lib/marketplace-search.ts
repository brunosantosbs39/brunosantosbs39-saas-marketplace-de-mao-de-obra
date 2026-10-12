import { z } from "zod";
import { getDb, HttpError, requiredId } from "./marketplace-server";
const cursorSchema = z.object({
  id: z.uuid(),
  at: z.iso.datetime(),
  distance: z.number().nonnegative().nullable().optional(),
});
export function decodeCursor(raw: string | null) {
  if (!raw) return null;
  try {
    if (raw.length > 1024) throw new Error();
    return cursorSchema.parse(
      JSON.parse(Buffer.from(raw, "base64url").toString()),
    );
  } catch {
    throw new HttpError(400, "Cursor inválido.");
  }
}
export function encodeCursor(row: Record<string, unknown>) {
  return Buffer.from(
    JSON.stringify({
      id: row.id,
      at: String(row.cursor_stamp || row.cursor_at),
      distance: row.distancia == null ? null : Number(row.distancia),
    }),
  ).toString("base64url");
}
function geo(u: URL) {
  const lat = u.searchParams.get("lat"),
    lng = u.searchParams.get("lng");
  if ((lat == null) !== (lng == null))
    throw new HttpError(400, "Informe as duas coordenadas.");
  if (lat == null) return { lat: null, lng: null, radius: 100 };
  const data = z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radius: z.number().min(1).max(100),
    })
    .safeParse({
      lat: Number(lat),
      lng: Number(lng),
      radius: Number(u.searchParams.get("radius") || 10),
    });
  if (!data.success) throw new HttpError(400, "Localização ou raio inválido.");
  return data.data;
}
const distance = `6371.0088 * acos(least(1.0,greatest(-1.0,sin(radians($5::double precision))*sin(radians(latitude))+cos(radians($5::double precision))*cos(radians(latitude))*cos(radians(longitude-$6::double precision)))))`;
export async function search(
  u: URL,
  viewer: string | null,
  kind: "feed" | "professionals",
) {
  const g = geo(u),
    cursor = decodeCursor(u.searchParams.get("cursor"));
  const city = (u.searchParams.get("cidade") || "").slice(0, 100),
    bairro = (u.searchParams.get("bairro") || "").slice(0, 100),
    cat = (u.searchParams.get("categoria") || "").slice(0, 100);
  if (cursor && g.lat != null && cursor.distance == null)
    throw new HttpError(400, "Cursor incompatível com localização.");
  const params: unknown[] = [
    viewer,
    city,
    bairro,
    cat,
    g.lat,
    g.lng,
    g.radius,
    cursor?.at ?? null,
    cursor?.id ?? null,
    cursor?.distance ?? null,
  ];
  const blocked = `NOT EXISTS(SELECT 1 FROM ml_blocks b WHERE (b.blocker_id=$1::uuid AND b.blocked_id=author_id) OR (b.blocked_id=$1::uuid AND b.blocker_id=author_id))`;
  let from: string;
  if (kind === "professionals") {
    from = `SELECT a.id,a.id AS author_id,a.name AS nome,p.bio,p.category AS categoria,p.city AS cidade,p.neighborhood AS bairro,p.portfolio,p.latitude,p.longitude,p.images,p.service_radius_km AS "raioAtendimento",p.updated_at AS cursor_at FROM ml_profiles p JOIN ml_accounts a ON a.id=p.user_id WHERE a.status='active' AND NOT p.hidden`;
  } else {
    const type = u.searchParams.get("tipo") || "",
      unit = u.searchParams.get("unidade") || "";
    const min = u.searchParams.get("min"),
      max = u.searchParams.get("max"),
      start = u.searchParams.get("inicio"),
      end = u.searchParams.get("fim");
    for (const v of [min, max])
      if (v !== null && (!Number.isSafeInteger(Number(v)) || Number(v) < 0))
        throw new HttpError(400, "Preço inválido.");
    if (
      (min !== null || max !== null) &&
      !["hora", "diaria", "servico", "m2"].includes(unit)
    )
      throw new HttpError(400, "Escolha a unidade para filtrar preço.");
    if (min !== null && max !== null && Number(min) > Number(max))
      throw new HttpError(400, "Faixa de preço inválida.");
    for (const v of [start, end])
      if (v && !z.iso.datetime().safeParse(v).success)
        throw new HttpError(400, "Período inválido.");
    if (start && end && start > end)
      throw new HttpError(400, "Período inválido.");
    const author = u.searchParams.get("autor");
    if (author) requiredId(author);
    const publication = u.searchParams.get("publicacao");
    if (publication) requiredId(publication);
    params.push(
      type,
      unit,
      min === null ? null : Number(min),
      max === null ? null : Number(max),
      start,
      end,
      author,
      publication,
    );
    from = `SELECT p.id,p.author_id,a.name AS autor,p.type AS tipo,p.category AS categoria,p.title AS titulo,p.description AS descricao,p.city AS cidade,p.neighborhood AS bairro,p.price_minor AS preco,p.price_unit AS unidade,p.starts_at AS inicio,p.ends_at AS fim,p.status,p.version,p.created_at AS "criadoEm",p.created_at AS cursor_at,p.latitude,p.longitude,p.author_id AS "autorId" FROM ml_publications p JOIN ml_accounts a ON a.id=p.author_id WHERE a.status='active' AND p.status='active' AND p.ends_at>now() AND ($11='' OR p.type=$11) AND ($12='' OR p.price_unit=$12) AND ($13::integer IS NULL OR p.price_minor >= $13) AND ($14::integer IS NULL OR p.price_minor <= $14) AND ($15::timestamptz IS NULL OR p.ends_at >= $15) AND ($16::timestamptz IS NULL OR p.starts_at <= $16) AND ($17::uuid IS NULL OR p.author_id=$17) AND ($18::uuid IS NULL OR p.id=$18)`;
  }
  const statement = `WITH source AS (${from}), candidates AS (SELECT *,CASE WHEN $5::double precision IS NULL OR latitude IS NULL OR longitude IS NULL THEN NULL ELSE ${distance} END AS distancia FROM source WHERE ($2='' OR lower(cidade)=lower($2)) AND ($3='' OR lower(bairro)=lower($3)) AND ($4='' OR categoria=$4) AND ${blocked}) SELECT *,to_char(cursor_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_stamp FROM candidates WHERE ($5::double precision IS NULL OR distancia <= $7) AND ($8::timestamptz IS NULL OR ($5::double precision IS NULL AND (cursor_at,id)<($8::timestamptz,$9::uuid)) OR ($5::double precision IS NOT NULL AND (distancia>$10::double precision OR (distancia=$10::double precision AND (cursor_at,id)<($8::timestamptz,$9::uuid))))) ORDER BY ${g.lat === null ? "" : "distancia ASC,"}cursor_at DESC,id DESC LIMIT 21`;
  const rows = await getDb().query(statement, params),
    hasMore = rows.length > 20,
    items = rows.slice(0, 20);
  return {
    [kind === "feed" ? "publicacoes" : "profissionais"]: items,
    hasMore,
    nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null,
  };
}
