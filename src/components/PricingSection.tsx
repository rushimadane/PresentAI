import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const included = [
  'Unlimited decks',
  'An AI image on every slide',
  'Topic mode and outline mode',
  'Inline slide editing',
  'Image regeneration and style switching',
  'Starter templates',
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-semibold mb-3">Pricing</h2>
          <p className="text-lg text-gray-600">
            It's free. Decks use the app's built-in Gemini key, or you can add your own.
            Slide images are generated with Pollinations, which needs no key.
          </p>
        </div>

        <div className="max-w-md">
          <div className="rounded-lg border border-border p-8">
            <div className="text-sm font-medium text-gray-500 mb-1">Free</div>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-semibold">$0</span>
              <span className="text-gray-500 ml-2">/ forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {included.map((item, i) => (
                <li key={i} className="flex items-start text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" asChild>
              <Link to="/start-creating">Create a deck</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
