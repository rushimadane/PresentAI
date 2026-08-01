import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-5">
              Type a topic. Get a full slide deck.
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              PresentAI writes your slides with Gemini and puts a matching AI image on
              every one. A five-slide deck takes about ten seconds. You can then edit
              any slide and change or regenerate its image.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link to="/start-creating">
                  Create a deck
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Free to use. Works with the built-in key, or bring your own Gemini key.
            </p>
          </div>

          {/* Real product preview: a slide as the app actually renders it. */}
          <div className="w-full">
            <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-gray-50">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="ml-3 text-xs text-gray-500">The Future of Solar Energy — Slide 3 / 5</span>
              </div>
              <div className="grid grid-cols-2 aspect-[16/10]">
                <div className="bg-primary/5 flex items-center justify-center relative">
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                    <ImageIcon className="h-3 w-3" /> AI image
                  </div>
                  <div className="text-primary/40">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-center">
                  <h3 className="text-base font-semibold mb-2">Economic viability</h3>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li>Solar PV costs fell over 80% in a decade</li>
                    <li>Cheapest new electricity in many regions</li>
                    <li>Storage pairing now competitive</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
