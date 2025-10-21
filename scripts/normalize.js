import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

function normalizeRecord(r) {
  return {
    id: String(r.id ?? "").trim(),
    url: String(r.url ?? "").trim(),
    title: r.title ? String(r.title).trim() : null,
    location: r.location ? String(r.location).trim() : null,
    price_eur: r.price_eur && !isNaN(r.price_eur) ? Number(r.price_eur) : null,
    surface_m2: r.surface_m2 && !isNaN(r.surface_m2) ? Number(r.surface_m2) : null,
    rooms: r.rooms && !isNaN(r.rooms) ? Number(r.rooms) : null,
    posted_at: r.posted_at ? new Date(r.posted_at).toISOString() : null,
    price_per_m2:
      r.price_eur && r.surface_m2 && r.surface_m2 > 0
        ? Math.round(r.price_eur / r.surface_m2)
        : null,
  };
}

function removeDuplicates(records) {
  const seen = new Set();
  return records.filter((r) => {
    const key = r.url || r.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const inPath = join("data", "clean.json");
  const outPath = join("data", "clean_normalized.json");

  const rawText = await readFile(inPath, "utf8");
  const rawData = JSON.parse(rawText);

  const normalized = (rawData.items || []).map(normalizeRecord);
  const uniqueRecords = removeDuplicates(normalized);

  await mkdir("data", { recursive: true });

  await writeFile(
    outPath,
    JSON.stringify(
      {
        normalized_at: new Date().toISOString(),
        count: uniqueRecords.length,
        items: uniqueRecords,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Normalization terminé (${uniqueRecords.length} annonces)`);
  console.log(`Fichier généré : ${outPath}`);
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});

