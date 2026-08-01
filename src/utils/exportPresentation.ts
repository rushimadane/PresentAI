import PptxGenJS from "pptxgenjs";
import { jsPDF } from "jspdf";
import type { Presentation } from "@/services/presentationService";

// Fetch a remote image and return it as a base64 data URI so it can be embedded
// directly in the exported file. Returns null if the image can't be fetched
// (e.g. CORS or network error) — the slide is then exported text-only.
const fetchImageAsDataUri = async (
  url: string
): Promise<{ dataUri: string; format: "JPEG" | "PNG" } | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const format: "JPEG" | "PNG" = blob.type.includes("png") ? "PNG" : "JPEG";
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUri, format };
  } catch {
    return null;
  }
};

const safeFileName = (title: string): string =>
  (title || "presentation").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "presentation";

// Split a slide's content into clean bullet lines.
const contentLines = (content: string): string[] =>
  (content || "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);

// ---------------------------------------------------------------------------
// PowerPoint (.pptx)
// ---------------------------------------------------------------------------
export const exportToPptx = async (presentation: Presentation): Promise<void> => {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9"; // 10 x 5.625 inches

  for (const slide of presentation.slides) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };

    let img: Awaited<ReturnType<typeof fetchImageAsDataUri>> = null;
    if (slide.imageUrl) img = await fetchImageAsDataUri(slide.imageUrl);

    const hasImg = !!img;
    // Image on the left half, text on the right (mirrors the app).
    if (hasImg) {
      s.addImage({ data: img!.dataUri, x: 0, y: 0, w: 5, h: 5.63, sizing: { type: "cover", w: 5, h: 5.63 } });
    }

    const textX = hasImg ? 5.3 : 0.5;
    const textW = hasImg ? 4.4 : 9;

    s.addText(slide.title || "", {
      x: textX,
      y: 0.4,
      w: textW,
      h: 1,
      fontSize: 24,
      bold: true,
      color: "1A1A1A",
      fontFace: "Arial",
    });

    const bullets = contentLines(slide.content);
    if (bullets.length) {
      s.addText(
        bullets.map((text) => ({ text, options: { bullet: true, breakLine: true } })),
        {
          x: textX,
          y: 1.5,
          w: textW,
          h: 3.8,
          fontSize: 14,
          color: "404040",
          fontFace: "Arial",
          valign: "top",
          lineSpacingMultiple: 1.2,
        }
      );
    }
  }

  await pptx.writeFile({ fileName: `${safeFileName(presentation.title)}.pptx` });
};

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
export const exportToPdf = async (presentation: Presentation): Promise<void> => {
  // 960 x 540 pt = 16:9.
  const W = 960;
  const H = 540;
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [W, H] });

  for (let i = 0; i < presentation.slides.length; i++) {
    const slide = presentation.slides[i];
    if (i > 0) pdf.addPage([W, H], "landscape");

    let img: Awaited<ReturnType<typeof fetchImageAsDataUri>> = null;
    if (slide.imageUrl) img = await fetchImageAsDataUri(slide.imageUrl);
    const hasImg = !!img;

    if (hasImg) {
      try {
        pdf.addImage(img!.dataUri, img!.format, 0, 0, W / 2, H);
      } catch {
        // ignore a bad image, keep the text
      }
    }

    const textX = hasImg ? W / 2 + 30 : 40;
    const textW = hasImg ? W / 2 - 60 : W - 80;

    pdf.setTextColor(26, 26, 26);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    const titleLines = pdf.splitTextToSize(slide.title || "", textW);
    pdf.text(titleLines, textX, 60);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.setTextColor(64, 64, 64);
    let y = 60 + titleLines.length * 28 + 16;
    for (const line of contentLines(slide.content)) {
      const wrapped = pdf.splitTextToSize(`•  ${line}`, textW);
      pdf.text(wrapped, textX, y);
      y += wrapped.length * 18 + 6;
      if (y > H - 30) break; // avoid overflow off the page
    }
  }

  pdf.save(`${safeFileName(presentation.title)}.pdf`);
};
