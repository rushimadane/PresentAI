import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

// Visual styles for the per-slide generated images.
export type ImageStyle = "photo" | "illustration" | "3d" | "sticker" | "minimal";

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  photo: "Photorealistic",
  illustration: "Illustration",
  "3d": "3D render",
  sticker: "Sticker",
  minimal: "Minimal / flat",
};

export interface PresentationRequest {
  title: string;
  content: string;
  apiKey: string;
  slideBySlide?: boolean;
  withImages?: boolean;
  imageStyle?: ImageStyle;
}

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
}


const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000";

interface GenerateResponse {
  result: string;
  source: string;
  title?: string;
}

// Extra prompt wording appended per style to steer the image generator.
const STYLE_MODIFIERS: Record<ImageStyle, string> = {
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
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;
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
const CACHE_PREFIX = "pres_cache_";
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

    // Attach a generated image to each slide when images were requested.
    if (request.withImages) {
      const style = request.imageStyle ?? "illustration";
      slides.forEach((slide) => {
        const prompt = slide.imagePrompt?.trim() || `${request.title}: ${slide.title}`;
        slide.imagePrompt = prompt;
        slide.imageStyle = style;
        slide.imageUrl = buildImageUrl(prompt, style);
      });
    }

    const resolvedTitle = data.title || request.title;

    // Cache the result so an identical request is instant next time.
    writeCache(cacheKey, { title: resolvedTitle, slides, cachedAt: Date.now() });

    return {
      id: uuidv4(),
      title: resolvedTitle,
      createdAt: new Date().toISOString(),
      slides,
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
