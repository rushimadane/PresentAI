
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Presentation, getSavedPresentations, savePresentation } from '@/services/presentationService';
import { toast } from '@/components/ui/use-toast';

interface PresentationContextType {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  setCurrentPresentation: (presentation: Presentation | null) => void;
  addPresentation: (presentation: Presentation) => void;
  deletePresentation: (id: string) => void;
  loading: boolean;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved presentations on mount
  useEffect(() => {
    try {
      const savedPresentations = getSavedPresentations();
      setPresentations(savedPresentations);
    } catch (error) {
      console.error('Error loading presentations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved presentations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addPresentation = (presentation: Presentation) => {
    setPresentations(prev => {
      // Check if presentation already exists
      const exists = prev.some(p => p.id === presentation.id);
      if (exists) {
        // Update existing presentation
        return prev.map(p => p.id === presentation.id ? presentation : p);
      }
      // Add new presentation
      return [...prev, presentation];
    });
    setCurrentPresentation(presentation);
    savePresentation(presentation);
  };

  const deletePresentation = (id: string) => {
    setPresentations(prev => prev.filter(p => p.id !== id));
    
    if (currentPresentation?.id === id) {
      setCurrentPresentation(null);
    }
    
    // Remove from local storage
    try {
      const savedPresentations = getSavedPresentations().filter(p => p.id !== id);
      localStorage.setItem('saved_presentations', JSON.stringify(savedPresentations));
      
      toast({
        title: 'Presentation deleted',
        description: 'Your presentation has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting presentation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete presentation',
        variant: 'destructive',
      });
    }
  };

  return (
    <PresentationContext.Provider
      value={{
        presentations,
        currentPresentation,
        setCurrentPresentation,
        addPresentation,
        deletePresentation,
        loading
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentations = () => {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error('usePresentations must be used within a PresentationProvider');
  }
  return context;
};
