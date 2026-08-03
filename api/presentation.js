// Vercel serverless function — production equivalent of backend/server.js.
// Deployed automatically at /api/presentation. The Express server in /backend
// is only used for local development.
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-flash-latest';

function buildPrompt({ title, content, slideBySlide, withImages, slideCount }) {
  const n = Math.max(3, Math.min(30, parseInt(slideCount, 10) || 10));
  const imageRule = withImages
    ? `\n- After the content of each slide, add one line "Image: <2-4 words naming a concrete, real-world, photographable subject that represents this slide>". Use a tangible object/place/scene that exists in stock photos (e.g. "circuit board closeup", "data center servers"), NOT abstract ideas, and never include text.`
    : '';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { title, content, slideBySlide, withImages, slideCount, apiKey } = req.body || {};
  const key = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY;

  if (!key) {
    res.status(400).json({
      error: 'No API key provided. Add your Gemini API key in the app, or set GEMINI_API_KEY in the Vercel project.',
    });
    return;
  }

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Content is required to generate a presentation.' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildPrompt({ title: title || 'Untitled', content, slideBySlide, withImages, slideCount });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.status(200).json({ result: text, source: 'gemini-api', title: title || 'Untitled' });
  } catch (err) {
    const message = (err && (err.message || String(err))) || 'Unknown error';
    console.error('Gemini API error:', message);
    res.status(502).json({ error: `Gemini request failed: ${message}` });
  }
}
