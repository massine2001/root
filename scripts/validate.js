import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const csvPath = path.join('data', 'dataset.csv');
if (!fs.existsSync(csvPath)) {
  console.error(`Missing ${csvPath}`);
  process.exit(2);
}

const raw = fs.readFileSync(csvPath, 'utf8');
const res = Papa.parse(raw, { header: true, skipEmptyLines: true });
const rows = res.data || [];

const required = ['id','url','title','location','price_eur','surface_m2','rooms','posted_at','price_per_m2'];

function checkHeader(hdr) {
  for (const r of required) if (!hdr.includes(r)) return false;
  return true;
}

if (!checkHeader(res.meta.fields || [])) {
  console.error('CSV missing required columns:', required.join(','));
  process.exit(3);
}

if (rows.length === 0) {
  console.error('CSV has zero rows');
  process.exit(4);
}

console.log(`CSV OK: ${rows.length} rows`);
process.exit(0);
