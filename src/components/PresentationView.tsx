import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, Download, Edit, Plus, Image, ImageOff, Save,
  Presentation as PresentationIcon, RefreshCw, FileText, FileDown, Images, Check,
} from 'lucide-react';
import {
  Presentation, SlideContent, resolveImageUrl, ImageStyle, IMAGE_STYLE_LABELS,
  preloadSlideImages, fetchImageCandidates, aiImageOptions, ImageCandidate,
} from '@/services/presentationService';
import { exportToPptx, exportToPdf } from '@/utils/exportPresentation';
import { DECK_THEMES, THEME_LIST, DEFAULT_THEME, ThemeId, DeckTheme, layoutForSlide } from '@/lib/deckThemes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface PresentationViewProps {
  presentation: Presentation;
  title: string;
  onEdit?: () => void;
  onCreateNew?: () => void;
  onSave?: (presentation: Presentation) => void;
}

// ---- Slide image with skeleton + retry + error fallback -------------------
const MAX_RETRIES = 2;
const SlideImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setLoaded(false); setAttempt(0); setFailed(false); }, [src]);

  const effectiveSrc = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`;
  const handleError = () => {
    if (attempt < MAX_RETRIES) setTimeout(() => setAttempt((a) => a + 1), 700 * (attempt + 1));
    else setFailed(true);
  };

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 text-xs bg-gray-100">
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
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
};

// ---- Typewriter reveal -----------------------------------------------------
const useTypewriter = (text: string, active: boolean, restartKey: string): string => {
  const [shown, setShown] = useState(active ? '' : text);
  useEffect(() => {
    if (!active) { setShown(text); return; }
    setShown('');
    let i = 0;
    const step = Math.max(2, Math.round(text.length / 90)); // finish in ~90 ticks
    const id = setInterval(() => {
      i += step;
      setShown(text.slice(0, i));
      if (i >= text.length) { setShown(text); clearInterval(id); }
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey, active]);
  return shown;
};

const bulletLines = (content: string): string[] =>
  (content || '').split(/\r?\n/).map((l) => l.replace(/^[-•\s]+/, '').trim()).filter(Boolean);

const PresentationView: React.FC<PresentationViewProps> = ({ title, presentation, onCreateNew, onSave }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deck, setDeck] = useState<Presentation>({
    id: presentation?.id || uuidv4(),
    createdAt: presentation?.createdAt || new Date().toISOString(),
    title: presentation?.title || title,
    slides: presentation?.slides || [],
    theme: presentation?.theme || DEFAULT_THEME,
  });

  // Image picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [candidates, setCandidates] = useState<ImageCandidate[]>([]);
  const [pickerTab, setPickerTab] = useState<'stock' | 'web' | 'ai'>('stock');

  useEffect(() => {
    if (!presentation) return;
    setDeck({
      id: presentation.id || uuidv4(),
      createdAt: presentation.createdAt || new Date().toISOString(),
      title: presentation.title || title,
      slides: presentation.slides || [],
      theme: presentation.theme || DEFAULT_THEME,
    });
    setCurrentSlideIndex(0);
    preloadSlideImages(presentation.slides || []);
  }, [presentation, title]);

  const slides = deck.slides;
  const currentSlide = slides[currentSlideIndex];
  const theme: DeckTheme = DECK_THEMES[(deck.theme as ThemeId)] || DECK_THEMES[DEFAULT_THEME];

  const goPrev = () => setCurrentSlideIndex((p) => (p > 0 ? p - 1 : p));
  const goNext = () => setCurrentSlideIndex((p) => (p < slides.length - 1 ? p + 1 : p));

  const setSlide = (index: number, updater: (s: SlideContent) => SlideContent) =>
    setDeck((prev) => {
      const next = [...prev.slides];
      next[index] = updater(next[index]);
      return { ...prev, slides: next };
    });

  const updateSlideContent = (field: keyof SlideContent, value: string) =>
    setSlide(currentSlideIndex, (s) => ({ ...s, [field]: value }));

  const setTheme = (id: ThemeId) => setDeck((prev) => ({ ...prev, theme: id }));

  const handleEditToggle = () => {
    if (isEditing && onSave) {
      onSave(deck);
      toast({ title: 'Changes saved', description: 'Your presentation has been updated.' });
    }
    setIsEditing(!isEditing);
  };

  const handleExport = async (format: 'pptx' | 'pdf') => {
    setIsExporting(true);
    toast({ title: `Preparing ${format.toUpperCase()}`, description: 'Embedding images and building your file…' });
    try {
      if (format === 'pptx') await exportToPptx(deck);
      else await exportToPdf(deck);
      toast({ title: 'Download ready', description: `Your ${format.toUpperCase()} downloaded.` });
    } catch (err) {
      console.error('Export failed:', err);
      toast({ title: 'Export failed', description: 'Something went wrong creating the file.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  // --- Images: regenerate + swap picker -------------------------------------
  const regenerateImage = async () => {
    const s = currentSlide;
    const style = (s.imageStyle as ImageStyle) || 'photo';
    toast({ title: 'Fetching a new image', description: 'One moment…' });
    const prompt = (s.imagePrompt || s.title || deck.title || 'presentation').trim();
    const url = await resolveImageUrl(prompt, style, Date.now());
    setSlide(currentSlideIndex, (x) => ({ ...x, imagePrompt: prompt, imageStyle: style, imageUrl: url }));
  };

  const regenerateAllImages = async () => {
    toast({ title: 'Refreshing all images', description: 'Fetching fresh images for every slide…' });
    const updated = await Promise.all(
      slides.map(async (s) => {
        const style = (s.imageStyle as ImageStyle) || 'photo';
        const prompt = (s.imagePrompt || s.title || deck.title || 'presentation').trim();
        return { ...s, imageStyle: style, imageUrl: await resolveImageUrl(prompt, style, Date.now()) };
      })
    );
    setDeck((prev) => ({ ...prev, slides: updated }));
  };

  const pickerQuery = () => currentSlide.imagePrompt || `${deck.title} ${currentSlide.title}`;

  // Load one tab's candidates. Web is fetched ONLY when its tab is opened, so a
  // SerpAPI search isn't spent just by opening the picker.
  const loadTab = async (tab: 'stock' | 'web' | 'ai') => {
    if (tab === 'ai') {
      setCandidates(aiImageOptions(pickerQuery(), 6));
      return;
    }
    setPickerLoading(true);
    setCandidates([]);
    const list = await fetchImageCandidates(pickerQuery(), tab);
    setCandidates(list);
    setPickerLoading(false);
  };

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerTab('stock');
    await loadTab('stock');
  };

  const selectTab = (tab: 'stock' | 'web' | 'ai') => {
    setPickerTab(tab);
    loadTab(tab);
  };

  const chooseCandidate = (c: ImageCandidate) => {
    setSlide(currentSlideIndex, (s) => ({ ...s, imageUrl: c.url }));
    setPickerOpen(false);
    toast({ title: 'Image updated', description: 'Slide image replaced.' });
  };

  const visibleCandidates = candidates.filter((c) => c.source === pickerTab);

  // Hooks must run unconditionally (before any early return).
  const revealKey = `${currentSlideIndex}-${isEditing}`;
  const shownTitle = useTypewriter(currentSlide?.title || '', !isEditing, `t-${revealKey}`);
  const shownBody = useTypewriter(currentSlide?.content || '', !isEditing, `b-${revealKey}`);

  if (!slides.length || !currentSlide) return <div className="text-gray-500">Loading presentation…</div>;

  const hasImage = !!currentSlide.imageUrl;
  const layout = layoutForSlide(currentSlideIndex, slides.length, hasImage);

  // ---- Reusable pieces (plain functions, NOT components, so the ~60fps
  // typewriter re-render doesn't remount the image each tick) ----------------
  const imageArea = () => (
    <div className="relative h-full w-full overflow-hidden group" style={{ background: theme.panelBg }}>
      {currentSlide.imageUrl && <SlideImage src={currentSlide.imageUrl} alt={currentSlide.imagePrompt || currentSlide.title} />}
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
        <Image className="h-3 w-3" />
        {currentSlide.imageUrl?.includes('pexels.com') ? 'Photo'
          : currentSlide.imageUrl?.includes('googleusercontent') || currentSlide.imageUrl?.includes('gstatic') ? 'Web'
          : currentSlide.imageUrl?.includes('pollinations') ? 'AI image' : 'Image'}
      </div>
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={openPicker}
          className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow hover:bg-white">
          <Images className="h-3.5 w-3.5" /> Change
        </button>
        <button type="button" onClick={regenerateImage}
          className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow hover:bg-white">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  const textArea = ({ center = false, overlay = false }: { center?: boolean; overlay?: boolean } = {}) => {
    const titleColor = overlay ? '#fff' : theme.text;
    const bodyColor = overlay ? 'rgba(255,255,255,0.9)' : theme.muted;
    if (isEditing) {
      return (
        <div className="space-y-3 w-full">
          <Input value={currentSlide.title} onChange={(e) => updateSlideContent('title', e.target.value)}
            className="text-lg font-bold border-dashed" placeholder="Slide title" />
          <Textarea value={currentSlide.content} onChange={(e) => updateSlideContent('content', e.target.value)}
            className="min-h-[120px] border-dashed" placeholder="Slide content" />
          <Input value={currentSlide.imagePrompt || ''} onChange={(e) => updateSlideContent('imagePrompt', e.target.value)}
            className="text-xs border-dashed" placeholder="Image prompt / search terms" />
          {currentSlide.imageUrl && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Image style</span>
              <Select value={(currentSlide.imageStyle as string) || 'photo'} onValueChange={(v) => { updateSlideContent('imageStyle', v); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(IMAGE_STYLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={`w-full ${center ? 'text-center' : ''}`}>
        <h3 className="font-bold mb-3" style={{ color: titleColor, fontSize: center ? '2rem' : '1.5rem', lineHeight: 1.15 }}>
          {shownTitle}
        </h3>
        <div className="space-y-1.5">
          {bulletLines(shownBody).map((line, i) => (
            <div key={i} className="flex gap-2 text-sm md:text-[15px]" style={{ color: bodyColor }}>
              {!center && <span style={{ color: theme.accent }} className="mt-[2px]">•</span>}
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCanvas = () => {
    const base = 'aspect-video rounded-xl overflow-hidden border';
    const borderColor = { borderColor: 'rgba(0,0,0,0.08)' };

    if (layout === 'cover') {
      return (
        <div className={`${base} relative flex items-center justify-center p-10`} style={{ background: theme.bg, ...borderColor }}>
          {currentSlide.imageUrl && (
            <div className="absolute inset-0">
              <SlideImage src={currentSlide.imageUrl} alt={currentSlide.title} />
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
            </div>
          )}
          <div className="relative z-10 max-w-2xl">
            {textArea({ center: true, overlay: !!currentSlide.imageUrl })}
          </div>
        </div>
      );
    }

    if (layout === 'text-only') {
      return (
        <div className={`${base} flex items-center justify-center p-10`} style={{ background: theme.bg, ...borderColor }}>
          <div className="max-w-2xl">{textArea()}</div>
        </div>
      );
    }

    if (layout === 'full-image') {
      return (
        <div className={`${base} relative`} style={{ background: theme.bg, ...borderColor }}>
          {imageArea()}
          <div className="absolute inset-x-0 bottom-0 p-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
            {textArea({ overlay: true })}
          </div>
        </div>
      );
    }

    // image-left / image-right
    const imgFirst = layout === 'image-left';
    return (
      <div className={`${base} grid grid-cols-1 md:grid-cols-2`} style={{ background: theme.bg, ...borderColor }}>
        {imgFirst && <div className="min-h-[180px]">{imageArea()}</div>}
        <div className="flex flex-col justify-center p-6 md:p-8" style={{ background: theme.panelBg }}>
          {textArea()}
        </div>
        {!imgFirst && <div className="min-h-[180px]">{imageArea()}</div>}
      </div>
    );
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <PresentationIcon className="h-5 w-5 text-primary shrink-0" />
            {isEditing ? (
              <Input value={deck.title} onChange={(e) => setDeck((p) => ({ ...p, title: e.target.value }))} className="font-bold" />
            ) : (
              <span className="font-semibold truncate">{deck.title}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Theme picker */}
            <div className="flex items-center gap-1">
              {THEME_LIST.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${t.name} theme`}
                      onClick={() => setTheme(t.id)}
                      className={`h-6 w-6 rounded-full border-2 ${deck.theme === t.id ? 'border-primary' : 'border-transparent'}`}
                      style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{t.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">{currentSlideIndex + 1} / {slides.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {renderCanvas()}

        <div className="flex items-center justify-between gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={goPrev} disabled={currentSlideIndex === 0} aria-label="Previous slide">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous slide</TooltipContent>
          </Tooltip>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {slides.map((_, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button type="button" aria-label={`Go to slide ${index + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlideIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'}`}
                    onClick={() => setCurrentSlideIndex(index)} />
                </TooltipTrigger>
                <TooltipContent>Slide {index + 1}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={regenerateAllImages} className="hidden sm:flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> All images
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerate every slide's image</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={goNext} disabled={currentSlideIndex === slides.length - 1} aria-label="Next slide">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next slide</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Button variant={isEditing ? 'default' : 'outline'} className="flex-1 min-w-[120px]" onClick={handleEditToggle}>
          {isEditing ? <><Save className="h-4 w-4 mr-2" /> Save changes</> : <><Edit className="h-4 w-4 mr-2" /> Edit</>}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex-1 min-w-[120px]" disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Preparing…' : 'Download'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => handleExport('pptx')}><FileText className="h-4 w-4 mr-2" /> PowerPoint (.pptx)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}><FileDown className="h-4 w-4 mr-2" /> PDF (.pdf)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onCreateNew && (
          <Button variant="outline" className="flex-1 min-w-[120px]" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create new
          </Button>
        )}
      </CardFooter>

      {/* Image swap picker */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Choose an image</SheetTitle>
            <SheetDescription>Pick a different image for this slide, from stock photos, the web, or AI.</SheetDescription>
          </SheetHeader>

          <div className="flex gap-1 mt-4">
            {(['stock', 'web', 'ai'] as const).map((tab) => (
              <button key={tab} onClick={() => selectTab(tab)}
                className={`px-3 py-1.5 text-xs rounded-md uppercase ${pickerTab === tab ? 'bg-primary text-white' : 'bg-muted text-gray-600'}`}>
                {tab === 'web' ? 'Web (Google)' : tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {pickerLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-video w-full" />)}
            {!pickerLoading && visibleCandidates.map((c, i) => (
              <button key={i} onClick={() => chooseCandidate(c)}
                className="relative aspect-video overflow-hidden rounded border border-border hover:ring-2 hover:ring-primary group">
                <img src={c.thumb || c.url} alt={c.credit || ''} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 capitalize">{c.source}</span>
                {currentSlide.imageUrl === c.url && (
                  <span className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5"><Check className="h-3 w-3" /></span>
                )}
              </button>
            ))}
            {!pickerLoading && visibleCandidates.length === 0 && (
              <p className="col-span-2 text-sm text-gray-500 py-8 text-center">
                No {pickerTab === 'web' ? 'web' : ''} images found.
                {pickerTab === 'web' && ' Add the SerpAPI key to enable web image search.'}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default PresentationView;
