import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { preparePortfolioImage } from "../src/lib/portfolio-image";
import { distanceKm } from "../src/lib/distance";
import { readLimitedBody } from "../src/lib/request-body";
test("portfolio reencodes photos and drops EXIF", async () => {
  const raw = await sharp({
    create: { width: 2400, height: 1200, channels: 3, background: "white" },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  assert.ok((await sharp(raw).metadata()).exif);
  const output = await preparePortfolioImage(raw),
    meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.exif, undefined);
  assert.ok(meta.width! <= 1600 && meta.height! <= 1600);
  await assert.rejects(preparePortfolioImage(Buffer.from("not an image")));
});
test("distance handles zero coordinates and identical points", () => {
  assert.equal(
    distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }),
    0,
  );
  assert.ok(
    Math.abs(
      distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) -
        111.195,
    ) < 0.01,
  );
});
test("request size enforced even without content-length", async () => {
  await assert.rejects(
    readLimitedBody(
      new Request("http://localhost", { method: "POST", body: "oversized" }),
      3,
    ),
  );
  const b = await readLimitedBody(
    new Request("http://localhost", { method: "POST", body: "ok" }),
    3,
  );
  assert.equal(new TextDecoder().decode(b), "ok");
});
