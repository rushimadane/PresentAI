import React from 'react';

const steps = [
  {
    number: '1',
    title: 'Enter your topic',
    description: 'Give the deck a title and some notes, or paste a slide-by-slide outline. Pick an image style.',
  },
  {
    number: '2',
    title: 'Gemini writes the slides',
    description: 'The AI splits your topic into slides with titles and bullet points, and an image prompt for each.',
  },
  {
    number: '3',
    title: 'Review, edit, and export',
    description: 'Flip through the slides, edit any text or image, regenerate what you want, then download the deck.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-semibold mb-3">How it works</h2>
          <p className="text-lg text-gray-600">Three steps, about ten seconds of waiting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="border-t-2 border-primary pt-5">
              <div className="text-sm font-semibold text-primary mb-2">Step {step.number}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
