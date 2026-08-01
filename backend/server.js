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

function buildPrompt({ title, content, slideBySlide, withImages }) {
  const imageRule = withImages
    ? `\n- After the content of each slide, add one line "Image: <a short, vivid visual description that best illustrates this slide>". Describe a concrete scene or subject (no text in the image).`
    : "";

  if (slideBySlide) {
    return `You are a presentation generator. Turn the outline below into a polished slide deck about "${title}".
Rules:
- Output plain text only (no markdown symbols like # or *).
- Start every slide with a line "Slide N: <slide title>".
- Follow each title line with concise bullet-style lines of content.${imageRule}
- Separate slides with a blank line.

Outline:
${content}`;
  }
  return `You are a presentation generator. Create a professional presentation about "${title}".
Rules:
- Output plain text only (no markdown symbols like # or *).
- Structure it as an introduction slide, 3-5 key-point slides, and a conclusion slide.
- Start every slide with a line "Slide N: <slide title>".
- Follow each title line with concise bullet-style lines of content.${imageRule}
- Separate slides with a blank line.

Topic details:
${content}`;
}

async function handleGenerate(req, res) {
  const { title, content, slideBySlide, withImages, apiKey } = req.body || {};

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
    const prompt = buildPrompt({ title: title || 'Untitled', content, slideBySlide, withImages });
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
