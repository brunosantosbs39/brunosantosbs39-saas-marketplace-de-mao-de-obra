import sharp from "sharp";
export async function preparePortfolioImage(bytes: Buffer) {
  const image = sharp(bytes, { limitInputPixels: 20000000 });
  const metadata = await image.metadata();
  if (
    !metadata.format ||
    !["jpeg", "png", "webp"].includes(metadata.format) ||
    (metadata.pages && metadata.pages > 1)
  )
    throw new Error("Imagem inválida.");
  return image
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}
