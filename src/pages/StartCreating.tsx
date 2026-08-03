import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ArrowRight, Key, Eye, EyeOff, Sparkles, Layers, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generatePresentation, PresentationRequest, savePresentation, ImageStyle, IMAGE_STYLE_LABELS, SLIDE_COUNT_OPTIONS, DEFAULT_SLIDE_COUNT } from '@/services/presentationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon } from 'lucide-react';
import { usePresentations } from '@/contexts/PresentationContext';
import PresentationView from '@/components/PresentationView';
import PresentationSkeleton from '@/components/PresentationSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'API Key is required')
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const StartCreating = () => {
  const [step, setStep] = useState<number>(1);
  const [presentationTitle, setPresentationTitle] = useState<string>('');
  const [presentationContent, setPresentationContent] = useState<string>('');
  const [slideBySlide, setSlideBySlide] = useState<boolean>(false);
  const [contentType, setContentType] = useState<string>('topic');
  const [withImages, setWithImages] = useState<boolean>(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>('photo');
  const [slideCount, setSlideCount] = useState<number>(DEFAULT_SLIDE_COUNT);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  const { currentPresentation, addPresentation, setCurrentPresentation } = usePresentations();
  
  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
    },
  });

  const handleSaveApiKey = (values: ApiKeyFormValues) => {
    setApiKey(values.apiKey);
    localStorage.setItem('presentation_ai_key', values.apiKey);
    toast({
      title: "API Key saved",
      description: "Your API key has been saved successfully",
    });
    setSheetOpen(false);
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('presentation_ai_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleStartCreating = async () => {
    if (!presentationTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your presentation",
        variant: "destructive",
      });
      return;
    }

    if (!presentationContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your presentation",
        variant: "destructive",
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    // API key is optional: if the user hasn't supplied their own, the backend
    // falls back to the server's configured key. Only override when provided.
    setIsGenerating(true);
    // Optimistically move to the preview step so the skeleton deck shows
    // immediately instead of the user waiting on the form.
    setStep(2);

    try {
      const request: PresentationRequest = {
        title: presentationTitle,
        content: presentationContent,
        apiKey: apiKey,
        slideBySlide: contentType === 'outline',
        withImages,
        imageStyle,
        slideCount,
      };

      // Call the backend to generate the presentation
      const generatedPresentation = await generatePresentation(request);
      addPresentation(generatedPresentation);

      toast({
        title: "Presentation created",
        description: "Your slides are ready.",
      });
    } catch (error) {
      console.error("Error generating presentation:", error);
      // Roll back to the form on failure (the service already shows the reason).
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNew = () => {
    setPresentationTitle('');
    setPresentationContent('');
    setAgreeToTerms(false);
    setContentType('topic');
    setStep(1);
  };
  
  const handleSavePresentation = (updatedPresentation) => {
    savePresentation(updatedPresentation);
    setCurrentPresentation(updatedPresentation);
    toast({
      title: "Presentation updated",
      description: "Your presentation has been saved successfully",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Create Your <span className="gradient-text">AI-Powered</span> Presentation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us about your topic, and our AI will create a professional presentation with visuals in seconds.
            </p>
          </div>
          
          <div className="flex justify-end mb-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  {apiKey ? "Update API Key" : "Use your own API key (optional)"}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>API Key Configuration</SheetTitle>
                  <SheetDescription>
                    Optional. Presentations work out of the box using the app's built-in key.
                    Add your own Gemini API key here only if you'd rather use it instead.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <Form {...apiKeyForm}>
                    <form onSubmit={apiKeyForm.handleSubmit(handleSaveApiKey)} className="space-y-6">
                      <FormField
                        control={apiKeyForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  placeholder="Enter your API key" 
                                  type={showApiKey ? "text" : "password"} 
                                  {...field} 
                                  defaultValue={apiKey}
                                />
                              </FormControl>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                                  >
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{showApiKey ? "Hide API key" : "Show API key"}</TooltipContent>
                              </Tooltip>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">Save API Key</Button>
                    </form>
                  </Form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {step === 1 ? (
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Tell Us About Your Presentation
                </CardTitle>
                <CardDescription>
                  Provide information about your topic, and our AI will generate a tailored presentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Presentation Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your presentation"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="topic" onValueChange={setContentType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="topic" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Topic Description
                    </TabsTrigger>
                    <TabsTrigger value="outline" className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Slide Outline
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="topic" className="mt-4">
                    <div className="space-y-2">
                      <label htmlFor="content-topic" className="text-sm font-medium">
                        Tell us about your topic
                      </label>
                      <Textarea
                        id="content-topic"
                        placeholder="Share everything you know about your topic. Include key points, facts, important concepts, or anything else you want in your presentation."
                        value={presentationContent}
                        onChange={(e) => setPresentationContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        The more information you provide, the better your presentation will be.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="outline" className="mt-4">
                    <div className="space-y-2">
                      <label htmlFor="content-outline" className="text-sm font-medium">
                        Provide a slide-by-slide outline
                      </label>
                      <Textarea
                        id="content-outline"
                        placeholder="Format your outline with 'Slide 1: Title' followed by bullet points for each slide. For example:
Slide 1: Introduction
• First point
• Second point

Slide 2: Main Topic
• Detail 1
• Detail 2"
                        value={presentationContent}
                        onChange={(e) => setPresentationContent(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Our AI will create a professional presentation following your exact outline, enhancing each slide with visuals and formatted content.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium whitespace-nowrap">Number of slides</label>
                  <Select value={String(slideCount)} onValueChange={(v) => setSlideCount(Number(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLIDE_COUNT_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} slides</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="with-images"
                      checked={withImages}
                      onCheckedChange={(checked) => setWithImages(checked as boolean)}
                    />
                    <label htmlFor="with-images" className="text-sm font-medium leading-none flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Generate an AI image for each slide
                    </label>
                  </div>
                  {withImages && (
                    <div className="space-y-2 pl-6">
                      <label className="text-sm text-gray-600">Image style</label>
                      <Select value={imageStyle} onValueChange={(v) => setImageStyle(v as ImageStyle)}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Choose a style" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(IMAGE_STYLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        "Real photo" uses actual stock photography (fast &amp; relevant). The other styles are AI-generated.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the terms and conditions
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full text-lg group" 
                  onClick={handleStartCreating}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Start Creating"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-all" />
                </Button>
              </CardFooter>
            </Card>
          ) : isGenerating || !currentPresentation ? (
            <PresentationSkeleton />
          ) : (
            <PresentationView
              presentation={currentPresentation}
              title={currentPresentation.title}
              onSave={handleSavePresentation}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StartCreating;
