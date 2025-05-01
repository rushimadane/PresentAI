import { toast } from "@/components/ui/use-toast";

export interface PresentationRequest {
  title: string;
  content: string;
  apiKey: string;
  slideBySlide?: boolean;
}

export interface SlideContent {
  title: string;
  content: string;
  imageUrl?: string;
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


const API_BASE_URL = "http://localhost:5000"; // Replace with your backend URL

// Generate presentation using backend
export const generatePresentation = async (request: PresentationRequest): Promise<Presentation> => {
  try {
    
    const res = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        title: request.title,
        content: request.content,
        slideBySlide: request.slideBySlide ?? false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend error response:", errText);
      toast({
        title: "Generation Failed",
        description: "Failed to generate the presentation. Please try again later.",
        variant: "destructive",
      });
      throw new Error("Failed to generate presentation");
    }

    const data = await res.json();
    return data as Presentation;

  } catch (error: any) {
    console.error("Frontend Error:", error);
    toast({
      title: "Generation Failed",
      description: error?.message || "Something went wrong while generating your presentation.",
      variant: "destructive",
    });
    throw new Error("Presentation generation failed.");
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
