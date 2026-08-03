const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Model is configurable via env so it can be updated without code changes.
// gemini-flash-latest is an alias to the current Flash model; pinned versions
// (e.g. gemini-1.5-pro, gemini-2.5-flash) get retired for new keys over time.
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-flash-latest';

app.use(cors());
app.use(express.json());

// Build a Gemini client from a caller-supplied key, falling back to the
// server's own key. Returns null if no usable key is available.
function getModel(userKey) {
  const key = (userKey && userKey.trim()) || process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function buildPrompt({ title, content, slideBySlide, withImages, slideCount }) {
  const n = Math.max(3, Math.min(30, parseInt(slideCount, 10) || 10));
  const imageRule = withImages
    ? `\n- After the content of each slide, add one line "Image: <a short, vivid visual description that best illustrates this slide>". Describe a concrete scene or subject (no text in the image).`
    : "";

  if (slideBySlide) {
    return `You are a presentation generator. Turn the outline below into a polished slide deck about "${title}".
Rules:
- Output plain text only (no markdown symbols like # or *).
- Produce about ${n} slides.
- Start every slide with a line "Slide N: <slide title>".
- Follow each title line with concise bullet-style lines of content.${imageRule}
- Separate slides with a blank line.

Outline:
${content}`;
  }
  return `You are a presentation generator. Create a professional presentation about "${title}".
Rules:
- Output plain text only (no markdown symbols like # or *).
- Produce exactly ${n} slides: an intro/title slide, ${n - 2} content slides, and a conclusion slide.
- Start every slide with a line "Slide N: <slide title>".
- Follow each title line with concise bullet-style lines of content.${imageRule}
- Separate slides with a blank line.

Topic details:
${content}`;
}

async function handleGenerate(req, res) {
  const { title, content, slideBySlide, withImages, slideCount, apiKey } = req.body || {};

  // Also accept a bearer token as the user's key (frontend used to send it there).
  const headerKey = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const model = getModel(apiKey || headerKey);

  if (!model) {
    return res.status(400).json({
      error: 'No API key provided. Add your Gemini API key in the app (or set GEMINI_API_KEY on the server).',
    });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required to generate a presentation.' });
  }

  try {
    const prompt = buildPrompt({ title: title || 'Untitled', content, slideBySlide, withImages, slideCount });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ result: text, source: 'gemini-api', title: title || 'Untitled' });
  } catch (err) {
    const message = err && (err.message || String(err));
    console.error('Gemini API error:', message);
    // Surface the real reason (suspended key, bad key, quota, etc.) to the client.
    res.status(502).json({ error: `Gemini request failed: ${message}` });
  }
}

// Pexels stock-photo proxy (keeps the API key server-side). Mirrors api/image.js.
async function handleImage(req, res) {
  const query = (req.query.query || '').toString().trim();
  const page = Math.max(1, parseInt((req.query.page || '1').toString(), 10) || 1);
  const key = process.env.PEXELS_API_KEY;

  if (!key || !query) return res.json({ url: null });

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: key } });
    if (!r.ok) return res.json({ url: null });
    const data = await r.json();
    const photo = data.photos && data.photos[0];
    const src = photo && photo.src ? (photo.src.landscape || photo.src.large || photo.src.original) : null;
    res.json({ url: src || null, credit: photo ? photo.photographer : null });
  } catch (err) {
    console.error('Pexels error:', err && (err.message || err));
    res.json({ url: null });
  }
}

app.get('/api/image', handleImage);

// Multiple image candidates (stock + web) for the swap picker. Mirrors api/images.js.
async function pexelsList(query, key) {
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

async function serpWebList(query, key) {
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

app.get('/api/images', async (req, res) => {
  const query = (req.query.query || '').toString().trim();
  const source = (req.query.source || 'all').toString();
  if (!query) return res.json({ images: [] });

  const wantStock = source === 'all' || source === 'stock';
  const wantWeb = source === 'all' || source === 'web';
  const [stock, web] = await Promise.all([
    wantStock ? pexelsList(query, process.env.PEXELS_API_KEY) : Promise.resolve([]),
    wantWeb ? serpWebList(query, process.env.SERPAPI_KEY) : Promise.resolve([]),
  ]);
  res.json({ images: [...stock, ...web], stockCount: stock.length, webCount: web.length });
});

// Health check route
app.get('/', (req, res) => {
  res.send(`Smart Presenter Hub backend is running (model: ${MODEL_NAME}).`);
});

// Primary route used by the frontend.
app.post('/api/presentation', handleGenerate);

// Backwards-compatible alias.
app.post('/generate', handleGenerate);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (model: ${MODEL_NAME})`);
});
