import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Edit, Plus, Image, ImageOff, Save, Presentation as PresentationIcon, RefreshCw } from 'lucide-react';
import { Presentation, SlideContent, buildImageUrl, ImageStyle, IMAGE_STYLE_LABELS, preloadSlideImages } from '@/services/presentationService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface PresentationViewProps {
  presentation: Presentation;
  title: string;
  onEdit?: () => void;
  onCreateNew?: () => void;
  onSave?: (presentation: Presentation) => void;
}

// Slide image with a skeleton placeholder, automatic retries (Pollinations
// occasionally returns transient 5xx on first request), and a fallback on error.
const MAX_RETRIES = 2;

const SlideImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  // Reset when the source changes (e.g. after regeneration).
  useEffect(() => {
    setLoaded(false);
    setAttempt(0);
    setFailed(false);
  }, [src]);

  // Add a cache-buster on retries so the browser actually re-requests.
  const effectiveSrc = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`;

  const handleError = () => {
    if (attempt < MAX_RETRIES) {
      setTimeout(() => setAttempt((a) => a + 1), 800 * (attempt + 1));
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 text-xs">
        <ImageOff className="h-6 w-6" />
        Couldn't load image
      </div>
    );
  }

  return (
    <>
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <img
        key={effectiveSrc}
        src={effectiveSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
};


const PresentationView: React.FC<PresentationViewProps> = ({
  title,
  presentation,
  onEdit,
  onCreateNew,
  onSave
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [processedPresentation, setProcessedPresentation] = useState<Presentation>({
    id: presentation?.id || uuidv4(),
    createdAt: presentation?.createdAt || new Date().toISOString(),
    title: presentation?.title || title,
    slides: presentation?.slides || []
  });

  // Sync local editing state whenever a new presentation is passed in.
  useEffect(() => {
    if (!presentation) return;
    setProcessedPresentation({
      id: presentation.id || uuidv4(),
      createdAt: presentation.createdAt || new Date().toISOString(),
      title: presentation.title || title,
      slides: presentation.slides || []
    });
    setCurrentSlideIndex(0);
    // Warm every slide's image so flipping between slides is instant.
    preloadSlideImages(presentation.slides || []);
  }, [presentation, title]);

  const currentSlide = processedPresentation.slides[currentSlideIndex];

  const goToPreviousSlide = () => {
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => (
      prev < processedPresentation.slides.length - 1 ? prev + 1 : prev
    ));
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(processedPresentation));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download",
      `${processedPresentation.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (onSave) {
        onSave(processedPresentation);
        toast({
          title: "Changes saved",
          description: "Your presentation has been updated successfully",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const updateSlideContent = (field: keyof SlideContent, value: string) => {
    const updatedSlides = [...processedPresentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      [field]: value
    };

    setProcessedPresentation({
      ...processedPresentation,
      slides: updatedSlides
    });
  };

  // Build a fresh image for a single slide. `fresh` adds a cache-buster so the
  // generator returns a new variant even for the same prompt+style.
  const imageForSlide = (slide: SlideContent, style: ImageStyle, fresh = false): SlideContent => {
    const prompt = (slide.imagePrompt || slide.title || processedPresentation.title || 'presentation slide').trim();
    const base = buildImageUrl(prompt, style);
    return {
      ...slide,
      imagePrompt: prompt,
      imageStyle: style,
      imageUrl: fresh ? `${base}&t=${Date.now()}` : base,
    };
  };

  // Regenerate the current slide's image (keeps its own style).
  const regenerateImage = () => {
    const slide = processedPresentation.slides[currentSlideIndex];
    const style = slide.imageStyle || 'illustration';
    const updatedSlides = [...processedPresentation.slides];
    updatedSlides[currentSlideIndex] = imageForSlide(slide, style, true);
    setProcessedPresentation({ ...processedPresentation, slides: updatedSlides });
    toast({ title: 'Regenerating image', description: 'A new image is being generated for this slide.' });
  };

  // Change the current slide's image style and regenerate it.
  const changeSlideStyle = (style: ImageStyle) => {
    const slide = processedPresentation.slides[currentSlideIndex];
    const updatedSlides = [...processedPresentation.slides];
    updatedSlides[currentSlideIndex] = imageForSlide(slide, style, true);
    setProcessedPresentation({ ...processedPresentation, slides: updatedSlides });
  };

  // Regenerate images for every slide at once (each keeps its own style).
  const regenerateAllImages = () => {
    const updatedSlides = processedPresentation.slides.map((slide) =>
      imageForSlide(slide, slide.imageStyle || 'illustration', true)
    );
    setProcessedPresentation({ ...processedPresentation, slides: updatedSlides });
    toast({ title: 'Regenerating all images', description: 'Fresh images are being generated for every slide.' });
  };

  const hasImages = processedPresentation.slides.some((s) => s.imageUrl);

  const getSlideStyles = () => {
    const style = currentSlide.style || {};
    const inlineStyle: React.CSSProperties = {
      textAlign: style.alignment as any || 'left',
      color: style.textColor || '#333333',
    };

    if (style.gradient) {
      inlineStyle.background = style.gradient;
    } else if (style.backgroundColor) {
      inlineStyle.backgroundColor = style.backgroundColor;
    }

    if (style.fontSize === 'large') {
      inlineStyle.fontSize = '1.125rem';
    }

    return inlineStyle;
  };

  if (!processedPresentation.slides.length) {
    return <div>Loading presentation...</div>;
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PresentationIcon className="h-5 w-5 text-primary" />
            {isEditing ? (
              <Input
                value={processedPresentation.title}
                onChange={(e) => setProcessedPresentation(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                className="font-bold"
              />
            ) : (
              <span>{processedPresentation.title}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasImages && (
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateAllImages}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate all images
              </Button>
            )}
            <span className="text-sm text-gray-500">
              {currentSlideIndex + 1} / {processedPresentation.slides.length}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="aspect-video rounded-lg border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2"
          style={getSlideStyles()}
        >
          {/* Image panel */}
          {currentSlide.imageUrl && (
            <div className="relative bg-muted min-h-[160px] group">
              <SlideImage
                src={currentSlide.imageUrl}
                alt={currentSlide.imagePrompt || currentSlide.title}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
                <Image className="h-3 w-3" />
                AI image
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={regenerateImage}
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow hover:bg-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
              )}
            </div>
          )}

          {/* Text panel */}
          <div
            className={`flex flex-col justify-center p-6 ${currentSlide.imageUrl ? '' : 'md:col-span-2 items-center text-center'}`}
          >
            {isEditing ? (
              <div className="space-y-3 w-full">
                <Input
                  value={currentSlide.title}
                  onChange={(e) => updateSlideContent('title', e.target.value)}
                  className="text-lg font-bold border-dashed"
                  placeholder="Slide title"
                />
                <Textarea
                  value={currentSlide.content}
                  onChange={(e) => updateSlideContent('content', e.target.value)}
                  className="min-h-[120px] border-dashed"
                  placeholder="Slide content"
                />
                <Input
                  value={currentSlide.imagePrompt || ''}
                  onChange={(e) => updateSlideContent('imagePrompt', e.target.value)}
                  className="text-xs border-dashed"
                  placeholder="Image prompt (what the AI should draw)"
                />
                {currentSlide.imageUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Image style</span>
                    <Select
                      value={currentSlide.imageStyle || 'illustration'}
                      onValueChange={(v) => changeSlideStyle(v as ImageStyle)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(IMAGE_STYLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold mb-3">{currentSlide.title}</h3>
                <div className="whitespace-pre-line text-sm md:text-base">
                  {currentSlide.content.split('\n').map((line, i) => (
                    <p key={i} className="my-1.5">{line}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous slide</TooltipContent>
          </Tooltip>

          <div className="flex gap-1.5">
            {processedPresentation.slides.map((_, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-2.5 h-2.5 p-0 rounded-full transition-colors ${index === currentSlideIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'}`}
                    onClick={() => setCurrentSlideIndex(index)}
                  />
                </TooltipTrigger>
                <TooltipContent>Slide {index + 1}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === processedPresentation.slides.length - 1}
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next slide</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button
          variant={isEditing ? "default" : "outline"}
          className="flex-1"
          onClick={handleEditToggle}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>

        <Button
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

        {onCreateNew && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PresentationView;
