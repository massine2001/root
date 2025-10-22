import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

function toNumber(x) {
  if (x === null || x === undefined) return null;
  const s = String(x).replace(/\u00A0/g, ' ').replace(/[^\d.,-]/g, '').trim();
  if (!s) return null;
  const t = s.includes(',') && s.includes('.') ? s.replace(/\./g, '').replace(',', '.') :
            s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function normalize(rec) {
  const id = String(rec.id || rec.url || '').trim();
  const url = String(rec.url || '').trim();
  const title = rec.title ? String(rec.title).trim() : null;
  const location = rec.location ? String(rec.location).trim() : null;
  const price_eur = toNumber(rec.price_eur);
  const surface_m2 = toNumber(rec.surface_m2);
  const rooms = toNumber(rec.rooms) ? Number.parseInt(toNumber(rec.rooms)) : null;
  const posted_at = rec.posted_at && String(rec.posted_at).trim() ? String(rec.posted_at).trim() : null;

  const price_per_m2 = price_eur && surface_m2 && surface_m2 > 0 ? Number((price_eur / surface_m2).toFixed(2)) : null;

  return { id, url, title, location, price_eur, surface_m2, rooms, posted_at, price_per_m2 };
}

function toCsv(rows) {
  const headers = ['id','url','title','location','price_eur','surface_m2','rooms','posted_at','price_per_m2'];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => esc(r[h])).join(','));
  return lines.join('\n');
}

async function main() {
  const rawPath = join('data', 'raw.json');
  const buf = await readFile(rawPath, 'utf8');
  const raw = JSON.parse(buf);

  const seen = new Set();
  const cleaned = [];
  for (const it of raw.items || []) {
    const n = normalize(it);
    if (!n.id || !n.url) continue;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    cleaned.push(n);
  }

  await mkdir('data', { recursive: true });
  const outCsv = join('data', 'dataset.csv');
  await writeFile(outCsv, toCsv(cleaned), 'utf8');

  console.log(`OK -> ${outCsv} (${cleaned.length} lignes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
