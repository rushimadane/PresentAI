const API_BASE_URL = "http://localhost:5000"; // or your backend URL

export const generateFromGemini = async (prompt: string) => {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate content");
  }

  const data = await response.json();
  return data.result;
};
