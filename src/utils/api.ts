const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000";

// Low-level helper to call the backend generator directly with raw content.
// Most callers should use generatePresentation() in services/presentationService.ts.
export const generateFromGemini = async (
  content: string,
  apiKey: string,
  title = "Untitled"
) => {
  const response = await fetch(`${API_BASE_URL}/api/presentation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content, apiKey }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate content");
  }

  const data = await response.json();
  return data.result as string;
};
