import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

// Visual styles / sources for the per-slide images.
export type ImageStyle = "photo" | "web" | "illustration" | "3d" | "sticker" | "minimal";

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  web: "Web images — best match (uses search quota)",
  photo: "Real photo (stock)",
  illustration: "Illustration (AI)",
  "3d": "3D render (AI)",
  sticker: "Sticker (AI)",
  minimal: "Minimal / flat (AI)",
};

export interface PresentationRequest {
  title: string;
  content: string;
  apiKey: string;
  slideBySlide?: boolean;
  withImages?: boolean;
  imageStyle?: ImageStyle;
  slideCount?: number;
}

export const SLIDE_COUNT_OPTIONS = [6, 8, 10, 12, 15];
export const DEFAULT_SLIDE_COUNT = 10;

export interface SlideContent {
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageStyle?: ImageStyle;
  style?: {
    backgroundColor?: string;
    gradient?: string;
    textColor?: string;
    fontSize?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface Presentation {
  id: string;
  title: string;
  createdAt: string;
  slides: SlideContent[];
  theme?: string;
}


// In production the backend is a same-origin Vercel function, so use a relative
// path (""). In dev, talk to the local Express server on :5000. An explicit
// VITE_API_BASE_URL always wins.
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.DEV ? "http://localhost:5000" : "");

interface GenerateResponse {
  result: string;
  source: string;
  title?: string;
}

// Extra prompt wording appended per style to steer the image generator.
const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  web: "", // web uses image search, not AI generation
  photo: "professional photography, high detail, natural lighting",
  illustration: "flat vector illustration, clean, modern, vibrant colors",
  "3d": "3d render, soft studio lighting, glossy, colorful",
  sticker: "die-cut sticker, thick white border, cartoon, bright, playful",
  minimal: "minimal flat design, simple shapes, lots of negative space, pastel palette",
};

// Build a free, no-API-key image URL (Pollinations.ai) from a text prompt.
// Swap this function if you prefer Unsplash/Pexels/OpenAI images later.
export const buildImageUrl = (prompt: string, style: ImageStyle = "illustration"): string => {
  const fullPrompt = `${prompt}, ${STYLE_MODIFIERS[style] || ""}`.trim();
  // A stable seed keeps the same slide's image consistent across re-renders.
  const seed = Math.abs(
    [...fullPrompt].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  );
  const encoded = encodeURIComponent(fullPrompt);
  // width/height: smaller = faster generation (still sharp on a slide).
  // model=flux: highest-quality model, best prompt adherence (more relevant).
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&model=flux&seed=${seed}`;
};

// Warm the image cache by requesting every slide's image in the background, so
// that by the time the user flips to a slide, the image is already loaded.
export const preloadSlideImages = (slides: SlideContent[]): void => {
  if (typeof window === "undefined") return;
  slides.forEach((slide) => {
    if (slide.imageUrl) {
      const img = new Image();
      img.src = slide.imageUrl;
    }
  });
};

// Grammatical + presentation-filler words that hurt image search relevance.
const QUERY_STOPWORDS = new Set([
  "a", "an", "the", "of", "for", "and", "or", "to", "in", "on", "with", "via", "by", "at", "as",
  "is", "are", "be", "your", "you", "our", "how", "what", "why", "this", "that", "these", "those",
  "guide", "beginner", "beginners", "introduction", "intro", "overview", "basics", "basic",
  "understanding", "use", "uses", "using", "future", "role", "impact", "key", "points", "slide",
]);

// Turn a title/description into a short, clean keyword query that image search
// engines handle well: strip punctuation and filler, keep the meaningful terms.
const toSearchQuery = (prompt: string): string => {
  const words = (prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !QUERY_STOPWORDS.has(w));
  const cleaned = words.slice(0, 5).join(" ").trim();
  // Fall back to the raw text if filtering removed everything.
  return cleaned || (prompt || "").trim();
};

// Resolve a slide image URL. For the "photo" style, use real Pexels stock
// photos (fast, always relevant); for creative styles, use AI generation.
// `variant` returns a different photo/image (used by "regenerate").
export const resolveImageUrl = async (
  prompt: string,
  style: ImageStyle = "illustration",
  variant = 0
): Promise<string> => {
  // Web: real Google Images (best for specific people/things, e.g. "Heisenberg").
  if (style === "web") {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/images?query=${encodeURIComponent(toSearchQuery(prompt))}&source=web`
      );
      if (res.ok) {
        const data = (await res.json()) as { images?: { url: string }[] };
        const list = data.images || [];
        const pick = list[Math.abs(variant) % Math.max(1, list.length)];
        if (pick?.url) return pick.url;
      }
    } catch {
      // fall through to stock, then AI
    }
    // Web unavailable (no key / quota) → fall back to stock.
    return resolveImageUrl(prompt, "photo", variant);
  }

  if (style === "photo") {
    try {
      const page = (Math.abs(variant) % 10) + 1;
      const res = await fetch(
        `${API_BASE_URL}/api/image?query=${encodeURIComponent(toSearchQuery(prompt))}&page=${page}`
      );
      if (res.ok) {
        const data = (await res.json()) as { url?: string | null };
        if (data.url) return data.url;
      }
    } catch {
      // fall through to AI generation
    }
  }
  // Non-photo styles, or Pexels unavailable → AI generation.
  const base = buildImageUrl(prompt, style);
  return variant ? `${base}&v=${variant}` : base;
};

export interface ImageCandidate {
  url: string;
  thumb?: string;
  source: "stock" | "web" | "ai";
  credit?: string;
}

// Candidate cache — so re-opening the same query's picker doesn't spend another
// SerpAPI search (the free tier is limited). Cached per query+source for 7 days.
const CAND_PREFIX = "imgcand_";
const CAND_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const candMemory = new Map<string, ImageCandidate[]>();

const readCandidates = (key: string): ImageCandidate[] | null => {
  if (candMemory.has(key)) return candMemory.get(key)!;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { images: ImageCandidate[]; cachedAt: number };
    if (Date.now() - parsed.cachedAt > CAND_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    candMemory.set(key, parsed.images);
    return parsed.images;
  } catch {
    return null;
  }
};

const writeCandidates = (key: string, images: ImageCandidate[]): void => {
  candMemory.set(key, images);
  try {
    localStorage.setItem(key, JSON.stringify({ images, cachedAt: Date.now() }));
  } catch {
    /* localStorage full — in-memory cache still applies */
  }
};

// Fetch a list of image candidates for the swap picker: stock (Pexels) + web
// (real Google Images via SerpAPI). Results are cached per query+source so the
// same slide's Web tab doesn't burn another SerpAPI search. Always appends a
// couple of AI-generated options so the picker is never empty.
// A couple of AI-generated options — always available, no network/quota.
export const aiImageOptions = (query: string, count = 4): ImageCandidate[] =>
  Array.from({ length: count }).map((_, v) => ({
    url: `${buildImageUrl(query, "illustration")}${v ? `&v=${v}` : ""}`,
    source: "ai",
    credit: "AI generated",
  }));

export const fetchImageCandidates = async (
  query: string,
  source: "all" | "stock" | "web" = "all"
): Promise<ImageCandidate[]> => {
  const q = toSearchQuery(query || "");
  const aiOptions = aiImageOptions(query, 2);

  const cacheKey = `${CAND_PREFIX}${source}_${hashKey(q)}`;
  const cached = readCandidates(cacheKey);
  if (cached) return [...cached, ...aiOptions];

  let results: ImageCandidate[] = [];
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/images?query=${encodeURIComponent(q)}&source=${source}`
    );
    if (res.ok) {
      const data = (await res.json()) as { images?: ImageCandidate[] };
      results = data.images || [];
    }
  } catch {
    // ignore — AI options below still returned
  }

  // Only cache real (network) results, so a transient failure isn't remembered.
  if (results.length) writeCandidates(cacheKey, results);

  return [...results, ...aiOptions];
};

const imageLineRegex = /^\s*image\s*[:\-]\s*(.+)$/i;

// Pull an "Image: <prompt>" line out of a content block, returning the cleaned
// content and the extracted image prompt (if any).
const extractImagePrompt = (content: string): { content: string; imagePrompt?: string } => {
  const lines = content.split(/\r?\n/);
  let imagePrompt: string | undefined;
  const kept = lines.filter((line) => {
    const m = line.match(imageLineRegex);
    if (m && !imagePrompt) {
      imagePrompt = m[1].trim();
      return false;
    }
    return true;
  });
  return { content: kept.join("\n").trim(), imagePrompt };
};

// Parse the raw text returned by the model into structured slides.
// Recognises "Slide N: Title" markers; falls back to splitting on blank lines.
// Also extracts an optional "Image: <prompt>" line per slide.
export const parseSlides = (rawText: string): SlideContent[] => {
  const text = (rawText || "").trim();
  if (!text) return [];

  const slideRegex = /^\s*slide\s*\d+\s*[:\-.]?\s*(.*)$/i;

  // If the model used explicit "Slide N:" markers, split on those.
  if (/^\s*slide\s*\d+\s*[:\-.]/im.test(text)) {
    const slides: SlideContent[] = [];
    let current: SlideContent | null = null;

    for (const line of text.split(/\r?\n/)) {
      const match = line.match(slideRegex);
      if (match) {
        if (current) slides.push(current);
        current = { title: match[1].trim() || `Slide ${slides.length + 1}`, content: "", imageUrl: "", style: {} };
      } else if (current) {
        current.content += (current.content ? "\n" : "") + line;
      }
    }
    if (current) slides.push(current);

    return slides
      .map((s) => {
        const { content, imagePrompt } = extractImagePrompt(s.content);
        return { ...s, content, imagePrompt };
      })
      .filter((s) => s.title || s.content);
  }

  // Fallback: treat blank-line-separated blocks as slides.
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const [firstLine, ...rest] = block.split(/\r?\n/);
      const hasBody = rest.length > 0;
      const rawContent = (hasBody ? rest.join("\n") : block).trim();
      const { content, imagePrompt } = extractImagePrompt(rawContent);
      return {
        title: hasBody ? firstLine.trim() : `Slide ${index + 1}`,
        content,
        imagePrompt,
        imageUrl: "",
        style: {},
      };
    });
};

// ---------------------------------------------------------------------------
// Generation cache
// Identical requests (same title/content/options) return instantly instead of
// re-hitting Gemini. Keyed by the request signature (the API key is excluded).
// Cached in-memory for the session and in localStorage across reloads.
// ---------------------------------------------------------------------------
// Bump the version suffix whenever the image pipeline changes, to invalidate
// cached decks that stored old image URLs (e.g. the switch to Pexels photos).
const CACHE_PREFIX = "pres_cache_v3_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CachedGeneration {
  title: string;
  slides: SlideContent[];
  cachedAt: number;
}

const memoryCache = new Map<string, CachedGeneration>();

// Small, stable string hash (djb2) for building cache keys.
const hashKey = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
};

const cacheKeyFor = (request: PresentationRequest): string =>
  CACHE_PREFIX +
  hashKey(
    JSON.stringify({
      title: request.title.trim().toLowerCase(),
      content: request.content.trim(),
      slideBySlide: request.slideBySlide ?? false,
      withImages: request.withImages ?? false,
      imageStyle: request.imageStyle ?? "illustration",
      slideCount: request.slideCount ?? DEFAULT_SLIDE_COUNT,
    })
  );

const readCache = (key: string): CachedGeneration | null => {
  const mem = memoryCache.get(key);
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedGeneration;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (key: string, value: CachedGeneration): void => {
  memoryCache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full; the in-memory cache still works.
  }
};

// Build a fresh Presentation (new id + timestamp) from cached slides so each
// generation is a distinct, saveable deck.
const presentationFromCache = (cached: CachedGeneration, fallbackTitle: string): Presentation => ({
  id: uuidv4(),
  title: cached.title || fallbackTitle,
  createdAt: new Date().toISOString(),
  slides: cached.slides.map((s) => ({ ...s, style: { ...s.style } })),
});

// Generate presentation using backend
export const generatePresentation = async (request: PresentationRequest): Promise<Presentation> => {
  const cacheKey = cacheKeyFor(request);
  const cached = readCache(cacheKey);
  if (cached) {
    return presentationFromCache(cached, request.title);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/presentation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: request.title,
        content: request.content,
        apiKey: request.apiKey,
        slideBySlide: request.slideBySlide ?? false,
        withImages: request.withImages ?? false,
        slideCount: request.slideCount ?? DEFAULT_SLIDE_COUNT,
      }),
    });

    if (!res.ok) {
      let message = "Failed to generate presentation.";
      try {
        const errJson = await res.json();
        if (errJson?.error) message = errJson.error;
      } catch {
        message = await res.text().catch(() => message);
      }
      console.error("Backend error response:", message);
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }

    const data = (await res.json()) as GenerateResponse;
    const slides = parseSlides(data.result);

    if (!slides.length) {
      throw new Error("The AI returned no usable slides. Try adding more detail to your topic.");
    }

    // Attach an image to each slide when images were requested.
    if (request.withImages) {
      const style = request.imageStyle ?? "photo";
      await Promise.all(
        slides.map(async (slide) => {
          // Prefer Gemini's concrete image line; otherwise use the slide title +
          // first bullet. Deliberately NOT the deck title — it's often generic or
          // misspelled and pollutes image search (e.g. returns unrelated photos).
          const firstLine = (slide.content || "").split("\n")[0]?.trim();
          const fallback = [slide.title, firstLine].filter(Boolean).join(", ");
          const prompt = slide.imagePrompt?.trim() || fallback || slide.title;
          slide.imagePrompt = prompt;
          slide.imageStyle = style;
          slide.imageUrl = await resolveImageUrl(prompt, style);
        })
      );
    }

    const resolvedTitle = data.title || request.title;

    // Cache the result so an identical request is instant next time.
    writeCache(cacheKey, { title: resolvedTitle, slides, cachedAt: Date.now() });

    // Warm the image cache so navigation between slides is instant.
    if (request.withImages) preloadSlideImages(slides);

    return {
      id: uuidv4(),
      title: resolvedTitle,
      createdAt: new Date().toISOString(),
      slides,
      theme: "light",
    };
  } catch (error: any) {
    console.error("Frontend Error:", error);
    toast({
      title: "Generation Failed",
      description: error?.message || "Something went wrong while generating your presentation.",
      variant: "destructive",
    });
    throw error instanceof Error ? error : new Error("Presentation generation failed.");
  }
};

// Utilities to save and load presentations from localStorage
export const getSavedPresentations = (): Presentation[] => {
  try {
    const savedPresentations = localStorage.getItem('saved_presentations');
    return savedPresentations ? JSON.parse(savedPresentations) : [];
  } catch (error) {
    console.error("Error retrieving saved presentations:", error);
    return [];
  }
};

export const savePresentation = (presentation: Presentation): void => {
  try {
    const presentations = getSavedPresentations();
    const existingIndex = presentations.findIndex(p => p.id === presentation.id);

    if (existingIndex >= 0) {
      presentations[existingIndex] = presentation; // Update existing presentation
    } else {
      presentations.push(presentation); // Add new presentation
    }

    localStorage.setItem('saved_presentations', JSON.stringify(presentations));
  } catch (error) {
    console.error("Error saving presentation:", error);
    toast({
      title: "Error",
      description: "Failed to save presentation",
      variant: "destructive",
    });
  }
};
