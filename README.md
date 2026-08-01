# PresentAI

An AI presentation maker. You describe a topic (or provide a slide outline) and the
app uses Google's Gemini API to generate a slide deck you can view, edit, and download.

## Tech stack

- **Frontend:** Vite + React + TypeScript, shadcn-ui, Tailwind CSS
- **Backend:** Node.js + Express (proxies requests to the Gemini API)
- **AI:** Google Gemini (`@google/generative-ai`), model `gemini-2.5-flash`
- **Auth/data:** Firebase (Auth + Firestore)

## Prerequisites

- Node.js 18+
- A Gemini API key — get a free one at https://aistudio.google.com/app/apikey

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit .env and add your GEMINI_API_KEY
npm run dev            # starts http://localhost:5000
```

The server key in `.env` is a fallback. Users can also paste their own key in the
app UI ("Add API Key"), which is sent per-request.

### 2. Frontend

```bash
npm install
npm run dev
```

Optionally set `VITE_API_BASE_URL` in a root `.env` if the backend isn't on
`http://localhost:5000`.

## How generation works

1. The user enters a title + topic/outline and their Gemini key.
2. The frontend POSTs to `POST /api/presentation` on the backend.
3. The backend calls Gemini and returns the raw text.
4. The frontend parses the text into structured slides (`parseSlides`) and renders them.

## Per-slide images (Gamma-style)

When "Generate an AI image for each slide" is enabled, Gemini also writes a short
`Image: <description>` line for each slide. The frontend turns that into an image
using **Pollinations.ai** — a free, no-API-key AI image generator. Users can pick an
image style (photo, illustration, 3D, sticker, minimal), edit the image prompt, and
regenerate any slide's image in edit mode.

To use a different image source (Unsplash, Pexels, OpenAI Images, etc.), swap the
`buildImageUrl()` function in `src/services/presentationService.ts`.

## Security note

Never commit real API keys. `.env` files are gitignored. If a key is committed to a
repo, Google will auto-suspend it — get a new one and keep it out of version control.
