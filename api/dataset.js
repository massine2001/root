import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import Papa from 'papaparse';

async function loadCsvText() {
  const remote = process.env.CSV_SOURCE_URL || process.env.VITE_CSV_URL;
  if (remote && /^https?:\/\//.test(remote)) {
    const res = await axios.get(remote, { responseType: 'text', timeout: 15000 });
    return res.data;
  }
  const local = path.join(process.cwd(), 'data', 'dataset.csv');
  return await fs.readFile(local, 'utf8');
}

function toNum(s) {
  if (s === null || s === undefined || s === '') return null;
  const n = Number(String(s).replace(/\s+/g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : null;
}

function median(arr) {
  if (!arr.length) return null;
  const a = [...arr].sort((x,y)=>x-y);
  const mid = Math.floor(a.length/2);
  return a.length % 2 ? a[mid] : (a[mid-1]+a[mid])/2;
}

function aggregate(rows) {
  const prices = rows.map(r => toNum(r.price_per_m2)).filter(v=>v!==null);
  const surfaces = rows.map(r => toNum(r.surface_m2)).filter(v=>v!==null);

  const binSize = 500;
  const priceBins = {};
  for (const p of prices) {
    const b = Math.floor(p/binSize)*binSize;
    priceBins[b] = (priceBins[b]||0)+1;
  }

  const surfaceBins = {};
  for (const s of surfaces) {
    const b = Math.floor(s/10)*10;
    surfaceBins[b] = (surfaceBins[b]||0)+1;
  }

  const times = {};
  for (const r of rows) {
    const d = r.posted_at ? new Date(r.posted_at) : null;
    if (d && !isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      times[key] = (times[key]||0)+1;
    }
  }

  return {
    count: rows.length,
    median_price_per_m2: median(prices),
    price_bins: Object.entries(priceBins).map(([k,v])=>({bucket: Number(k), count:v})).sort((a,b)=>a.bucket-b.bucket),
    surface_bins: Object.entries(surfaceBins).map(([k,v])=>({bucket: Number(k), count:v})).sort((a,b)=>a.bucket-b.bucket),
    time_series: Object.entries(times).map(([k,v])=>({period:k, count:v})).sort((a,b)=>a.period.localeCompare(b.period))
  };
}

function normalizeRow(r) {
  return {
    id: r.id,
    url: r.url,
    title: r.title || null,
    location: r.location || null,
    price_eur: toNum(r.price_eur),
    surface_m2: toNum(r.surface_m2),
    rooms: toNum(r.rooms),
    posted_at: r.posted_at || null,
    price_per_m2: toNum(r.price_per_m2)
  };
}

export default async function handler(req, res) {
  try {
    const txt = await loadCsvText();
    const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
    let rows = (parsed.data || []).map(normalizeRow);

    const q = { ...(req.query || {}) };
    if (q.min_price) rows = rows.filter(r=>r.price_per_m2 !== null && r.price_per_m2 >= Number(q.min_price));
    if (q.max_price) rows = rows.filter(r=>r.price_per_m2 !== null && r.price_per_m2 <= Number(q.max_price));
    if (q.city) {
      const city = String(q.city).toLowerCase();
      rows = rows.filter(r=>r.location && String(r.location).toLowerCase().includes(city));
    }
    if (q.min_surface) rows = rows.filter(r=>r.surface_m2 !== null && r.surface_m2 >= Number(q.min_surface));
    if (q.rooms) rows = rows.filter(r=>r.rooms !== null && r.rooms === Number(q.rooms));
    if (q.limit) rows = rows.slice(0, Number(q.limit));

    const summary = aggregate(rows);
    res.setHeader('Content-Type','application/json');
    res.status(200).send(JSON.stringify({ meta: { source: process.env.CSV_SOURCE_URL || 'local' }, summary, rows }, null, 2));
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
