// Vercel serverless function: returns multiple image candidates for the swap
// picker, from Pexels (stock) and SerpAPI (real Google Images, the "web" tab).
//
// Web search is DORMANT until you add SERPAPI_KEY (no code change needed):
//   SERPAPI_KEY – https://serpapi.com → sign up (free tier) → copy Private API Key
// Without it, only stock (Pexels) results are returned.

async function pexels(query, key) {
  if (!key || !query) return [];
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: key } });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.photos || [])
      .map((p) => ({
        url: (p.src && (p.src.landscape || p.src.large)) || null,
        thumb: (p.src && (p.src.tiny || p.src.small)) || null,
        source: 'stock',
        credit: p.photographer || 'Pexels',
      }))
      .filter((x) => x.url);
  } catch {
    return [];
  }
}

async function serpWeb(query, key) {
  if (!key || !query) return [];
  try {
    const url = `https://serpapi.com/search.json?engine=google_images&num=12&safe=active&q=${encodeURIComponent(query)}&api_key=${key}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.images_results || [])
      .slice(0, 12)
      .map((it) => ({
        url: it.original,
        thumb: it.thumbnail || it.original,
        source: 'web',
        credit: it.source || 'Web',
      }))
      .filter((x) => x.url);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const query = (req.query.query || '').toString().trim();
  const source = (req.query.source || 'all').toString();

  if (!query) {
    res.status(200).json({ images: [] });
    return;
  }

  const wantStock = source === 'all' || source === 'stock';
  const wantWeb = source === 'all' || source === 'web';

  const [stock, web] = await Promise.all([
    wantStock ? pexels(query, process.env.PEXELS_API_KEY) : Promise.resolve([]),
    wantWeb ? serpWeb(query, process.env.SERPAPI_KEY) : Promise.resolve([]),
  ]);

  // Interleave a bit so the picker shows variety from both sources.
  res.status(200).json({ images: [...stock, ...web], stockCount: stock.length, webCount: web.length });
}
