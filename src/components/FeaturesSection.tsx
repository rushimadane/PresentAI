import React from 'react';
import { FileText, Image, ListOrdered, Pencil, RefreshCw, LayoutTemplate } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: 'Topic to deck',
    description: 'Enter a title and a few notes. Gemini writes an intro, key-point slides, and a conclusion.',
  },
  {
    icon: <Image className="h-6 w-6 text-primary" />,
    title: 'An image on every slide',
    description: 'Each slide gets an AI image that matches its content. No stock-photo hunting.',
  },
  {
    icon: <ListOrdered className="h-6 w-6 text-primary" />,
    title: 'Outline mode',
    description: 'Already have an outline? Paste it in and the deck follows your exact structure.',
  },
  {
    icon: <Pencil className="h-6 w-6 text-primary" />,
    title: 'Edit any slide',
    description: 'Change titles, body text, and image prompts inline after the deck is generated.',
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
    title: 'Regenerate images',
    description: 'Not happy with an image? Regenerate it, or switch the style (photo, illustration, 3D, sticker).',
  },
  {
    icon: <LayoutTemplate className="h-6 w-6 text-primary" />,
    title: 'Starter templates',
    description: 'Begin from a business, education, marketing, or design template instead of a blank page.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-semibold mb-3">What it does</h2>
          <p className="text-lg text-gray-600">
            Everything here is a feature that exists in the app today — nothing more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="mb-3">{feature.icon}</div>
              <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
