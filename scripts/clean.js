import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

function cleanRecord(r) {
  const id = String(r.id ?? "").trim();
  const url = String(r.url ?? "").trim();
  const title = r.title ? String(r.title).trim() : null;
  const location = r.location ? String(r.location).trim() : null;

  const price_eur =
    typeof r.price_eur === "number" && r.price_eur > 0 ? r.price_eur : null;
  const surface_m2 =
    typeof r.surface_m2 === "number" && r.surface_m2 > 0 ? r.surface_m2 : null;
  const rooms =
    typeof r.rooms === "number" && r.rooms > 0 ? r.rooms : null;

  const posted_at = r.posted_at ? new Date(r.posted_at).toISOString() : null;

  let price_per_m2 = null;
  if (price_eur && surface_m2 && surface_m2 > 0) {
    price_per_m2 = Math.round(price_eur / surface_m2);
  }

  return {
    id,
    url,
    title,
    location,
    price_eur,
    surface_m2,
    rooms,
    posted_at,
    price_per_m2
  };
}

async function main() {
  const inPath = join("data", "raw.json");
  const outPath = join("data", "clean.json");

  const rawText = await readFile(inPath, "utf8");
  const rawData = JSON.parse(rawText);

  const cleanedItems = (rawData.items || []).map(cleanRecord);

  await mkdir("data", { recursive: true });

  await writeFile(
    outPath,
    JSON.stringify(
      {
        cleaned_at: new Date().toISOString(),
        count: cleanedItems.length,
        items: cleanedItems
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Nettoyage terminé (${cleanedItems.length} annonces)`);
  console.log(`Fichier généré : ${outPath}`);
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});

