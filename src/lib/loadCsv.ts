import Papa from 'papaparse';

export type Row = {
  id: string;
  url: string;
  title: string | null;
  location: string | null;
  price_eur: string;
  surface_m2: string;
  rooms: string;
  posted_at: string | null;
  price_per_m2: string;
};

const headerMap: Record<string, keyof Row> = {
  'id': 'id',
  'url': 'url',
  'title': 'title',
  'location': 'location',
  'price_eur': 'price_eur',
  'surface_m2': 'surface_m2',
  'rooms': 'rooms',
  'posted_at': 'posted_at',
  'price_per_m2': 'price_per_m2',
};

function normalizeHeader(h: string): keyof Row | null {
  const clean = h.replace(/\ufeff/g, '').trim().toLowerCase();
  const alias = clean
    .replace(/\s+/g, '_')
    .replace(/€/g, 'eur')
    .replace(/m2|m²|sqm/g, 'm2');
  return headerMap[alias] ?? null;
}

export async function loadCsv(csvUrl: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => {
        const k = normalizeHeader(h);
        return (k ?? `__unknown__${h}`) as string;
      },
      complete: (res) => {
        const rows: Row[] = (res.data as any[]).map((r) => {
          const out: any = {};
          for (const key of Object.values(headerMap)) {
            const v = r[key as string];
            out[key] = v === undefined || v === null ? '' : String(v).trim();
          }
          out.title = out.title || null;
          out.location = out.location || null;
          out.posted_at = out.posted_at || null;
          return out as Row;
        });
        resolve(rows);
      },
      error: reject,
    });
  });
}
