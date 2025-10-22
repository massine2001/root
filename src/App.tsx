import { useEffect, useState } from 'react';
import { loadCsv } from './lib/loadCsv';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, LabelList } from 'recharts';


const CSV_URL = ((import.meta as any).env?.VITE_CSV_URL as string) || '/data/dataset.csv';
const API_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api/dataset';

function toNum(x: any) { const n = Number(x); return Number.isFinite(n) ? n : null; }

export default function App() {
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (res.ok) {
          const j = await res.json();
          setSummary(j.summary || null);
          setRows(j.rows || []);
          setLoading(false);
          return;
        }
      } catch (e) {
      }

      try {
        const data = await loadCsv(CSV_URL);
        setRows(data);
        setSummary(null);
      } catch (e:any) {
        setError(String(e?.message ?? e));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Chargement…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>Erreur: {error}</div>;

  const useSummary = !!summary;

  const count = useSummary ? summary.count : rows.length;
  const median = useSummary ? summary.median_price_per_m2 : (() => {
    const prices = rows.map(r=>toNum(r.price_per_m2)).filter((v:any): v is number => v !== null);
    return prices.length ? [...prices].sort((a,b)=>a-b)[Math.floor(prices.length/2)] : null;
  })();

  const priceData = useSummary ? summary.price_bins.map((b:any)=>({ bucket: `${b.bucket}-${b.bucket+100}`, count: b.count, bucketStart: b.bucket })) : (()=>{
    const prices = rows.map((r:any)=>toNum(r.price_per_m2)).filter((v:any): v is number => v !== null);
    const binSize = 100; const bins = new Map<number, number>();
    for (const p of prices) { const b = Math.floor(p/binSize)*binSize; bins.set(b,(bins.get(b)||0)+1); }
    return Array.from(bins.entries()).sort((a,b)=>a[0]-b[0]).map(([k,v])=>({ bucket:`${k}-${k+binSize}`, bucketStart: k, count:v }));
  })();

  const surfaceData = useSummary ? summary.surface_bins.map((b:any)=>({ bucket: `${b.bucket}-${b.bucket+5}`, count: b.count, bucketStart: b.bucket })) : (()=>{
    const s = rows.map((r:any)=>toNum(r.surface_m2)).filter((v:any): v is number => v !== null);
    const binSize = 5; const bins = new Map<number, number>();
    for (const v of s) { const b = Math.floor(v/binSize)*binSize; bins.set(b,(bins.get(b)||0)+1); }
    return Array.from(bins.entries()).sort((a,b)=>a[0]-b[0]).map(([k,v])=>({ bucket:`${k}-${k+binSize}`, bucketStart: k, count:v }));
  })();

  const timeSeries = useSummary ? summary.time_series.map((t:any)=>({ period: t.period, count: t.count })) : [];

  const formatEuro = (n:any) => typeof n === 'number' ? `${n.toLocaleString('fr-FR')} €/m²` : 'NA';
  const formatCount = (n:any) => typeof n === 'number' ? `${n}` : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
      <div style={{ background: 'white', border: '1px solid #ddd', padding: 8 }}>
        <div><strong>{label}</strong></div>
        <div>Nombre: {p.count}</div>
        {p.bucketStart !== undefined && <div>Début bucket: {p.bucketStart}</div>}
      </div>
    );
  };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1>Marché immobilier – Dashboard</h1>
      <p>Biens: {count} | Médiane €/m²: {median ? median.toFixed(2) + ' €/m²' : 'NA'}</p>

      <h2>Histogramme prix/m²</h2>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={priceData} margin={{ top: 20, right: 20, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" interval={0} angle={-45} textAnchor="end" height={80} label={{ value: 'Prix (€/m²)', position: 'bottom', offset: 60 }} />
            <YAxis label={{ value: 'Nombre d’annonces', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip/>} />
            <Bar dataKey="count" fill="#8884d8">
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Distribution des surfaces (m²)</h2>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={surfaceData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" interval={0} label={{ value: 'Surface (m²)', position: 'bottom', offset: 8 }} />
            <YAxis />
            <Tooltip formatter={(value:any,name:any,props:any) => [value, 'Nombre']} content={<CustomTooltip/>} />
            <Bar dataKey="count" fill="#82ca9d">
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Évolution temporelle</h2>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" label={{ value: 'Mois', position: 'bottom', offset: 10 }} />
            <YAxis />
            <Tooltip formatter={(value:any) => [value, 'Annonces']} />
            <Line type="monotone" dataKey="count" stroke="#8884d8" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2>Table (aperçu)</h2>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign:'left', borderBottom:'1px solid #ccc' }}>Titre</th>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ccc' }}>Prix (€)</th>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ccc' }}>Surf. (m²)</th>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ccc' }}>€/m²</th>
            <th style={{ textAlign:'left', borderBottom:'1px solid #ccc' }}>Ville</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((r:any) => (
            <tr key={r.id}>
              <td><a href={r.url} target="_blank" rel="noreferrer">{r.title || '\u2014'}</a></td>
              <td style={{ textAlign:'right' }}>{r.price_eur ?? ''}</td>
              <td style={{ textAlign:'right' }}>{r.surface_m2 ?? ''}</td>
              <td style={{ textAlign:'right' }}>{r.price_per_m2 ?? ''}</td>
              <td>{r.location || '\u2014'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
