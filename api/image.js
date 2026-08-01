// Vercel serverless function: proxies Pexels stock-photo search so the API key
// stays server-side. Returns { url } (a CDN photo) or { url: null } to let the
// client fall back to AI-generated images.
export default async function handler(req, res) {
  const query = (req.query.query || '').toString().trim();
  const page = Math.max(1, parseInt((req.query.page || '1').toString(), 10) || 1);
  const key = process.env.PEXELS_API_KEY;

  if (!key || !query) {
    res.status(200).json({ url: null });
    return;
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: key } });
    if (!r.ok) {
      res.status(200).json({ url: null });
      return;
    }
    const data = await r.json();
    const photo = data.photos && data.photos[0];
    const src = photo && photo.src ? (photo.src.landscape || photo.src.large || photo.src.original) : null;
    res.status(200).json({ url: src || null, credit: photo ? photo.photographer : null });
  } catch (err) {
    console.error('Pexels error:', err && (err.message || err));
    res.status(200).json({ url: null });
  }
}
