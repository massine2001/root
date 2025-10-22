import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const startUrls = (process.env.LISTING_START_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
 
if (startUrls.length === 0) {
  console.warn('No LISTING_START_URLS provided in environment; skipping live scraping. See .env.example for examples.');
  process.exit(0);
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';


async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' },
    timeout: 15000
  });
  return res.data;
}

function extractListingLinksFromList(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    const abs = new URL(href, baseUrl).toString();
    if (/\/location\//.test(abs) && /\/\d{3,}-/.test(abs)) {
      links.add(abs);
    }
  });
  return Array.from(links);
}

function toNumber(str) {
  if (!str) return null;
  const s = String(str).replace(/\u00A0/g, ' ').replace(/[^\d.,-]/g, '').trim();
  if (!s) return null;
  const t = s.includes(',') && s.includes('.') ? s.replace(/\./g, '').replace(',', '.') :
            s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function parseDetail(html, url) {
  const $ = cheerio.load(html);
  const pageText = $('body').text().replace(/\s+/g, ' ').trim();

  const title = $('h1').first().text().trim() || null;
  let location = null;
  const breadcrumb = $('nav, .breadcrumb, .ariane, .fil-ariane').text();
  const mCity = breadcrumb.match(/Choisy-le-Roi|Orly|Thiais/i);
  if (mCity) location = mCity[0];

  const mSurf = pageText.match(/Surface habitable\s*\(m²\)\s*([\d.,]+)/i);
  const surface_m2 = mSurf ? toNumber(mSurf[1]) : null;

  const mRooms = pageText.match(/Nombre de pièces\s*([0-9]+)/i);
  const rooms = mRooms ? toNumber(mRooms[1]) : null;

  const mRent = pageText.match(/Loyer\s*CC\*?\s*\/\s*mois\s*([\d.,\s]+)€/i);
  const mPrice = pageText.match(/Prix\s*([\d.,\s]+)€/i);
  let price_eur = null;
  if (mRent) price_eur = toNumber(mRent[1]);
  else if (mPrice) price_eur = toNumber(mPrice[1]);

  return {
    id: url,
    url,
    title,
    location,
    price_eur,
    surface_m2,
    rooms,
    posted_at: null
  };
}

async function collectAllListingUrls() {
  const out = new Set();
  for (const start of startUrls) {
    const html = await fetchHtml(start);
    const links = extractListingLinksFromList(html, start);
    links.forEach(u => out.add(u));

    for (let p = 2; p <= 10; p++) {
      const next = new URL(start.replace(/\/(\d+)(\/)?$/, `/${p}$2`), start).toString();
      try {
        const h = await fetchHtml(next);
        const l2 = extractListingLinksFromList(h, next);
        if (l2.length === 0) break;
        l2.forEach(u => out.add(u));
      } catch {
        break;
      }
    }
  }
  return Array.from(out);
}

async function main() {
  const listingUrls = await collectAllListingUrls();

  const results = [];
  for (const url of listingUrls) {
    try {
      const html = await fetchHtml(url);
      const rec = parseDetail(html, url);
      results.push(rec);
    } catch (e) {
      console.log('Erreur sur', url, e.message);
    }
  }

  const seen = new Set();
  const deduped = results.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  await mkdir('data', { recursive: true });
  const outPath = join('data', 'raw.json');
  await writeFile(
    outPath,
    JSON.stringify({ scraped_at: new Date().toISOString(), count: deduped.length, items: deduped }, null, 2),
    'utf8'
  );

}

main().catch(e => {
  process.exit(1);
});
