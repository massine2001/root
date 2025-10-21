import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

function toCSV(records) {
  if (records.length === 0) return "";

  const headers = Object.keys(records[0]);
  const rows = records.map((r) =>
    headers
      .map((h) => {
        const val = r[h] ?? "";
        if (typeof val === "string" && /[",\n]/.test(val)) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

async function main() {
  const inPath = join("data", "clean_normalized.json");
  const outPath = join("data", "clean_normalized.csv");

  const rawText = await readFile(inPath, "utf8");
  const jsonData = JSON.parse(rawText);
  const records = jsonData.items || [];

  await mkdir("data", { recursive: true });

  const csv = toCSV(records);
  await writeFile(outPath, csv, "utf8");

  console.log(`Conversion en CSV terminée (${records.length} annonces)`);
  console.log(`Fichier CSV généré : ${outPath}`);
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});

