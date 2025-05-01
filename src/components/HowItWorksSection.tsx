
import React from 'react';
import { FileText, Palette, PresentationIcon, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: <FileText className="h-10 w-10 text-white" />,
    title: 'Add Your Content',
    description: 'Type your content, upload your notes, or import from Google Docs, Word, or Notion.'
  },
  {
    icon: <Palette className="h-10 w-10 text-white" />,
    title: 'AI Designs Your Slides',
    description: 'Our AI automatically creates beautiful slides with the perfect layout, typography, and visuals.'
  },
  {
    icon: <PresentationIcon className="h-10 w-10 text-white" />,
    title: 'Present & Share',
    description: 'Present directly from our platform, export to PowerPoint or PDF, or share a link with your audience.'
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">PresentAI</span> Works
          </h2>
          <p className="text-xl text-gray-600">
            Creating professional presentations has never been easier.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute top-24 left-0 w-full h-2 bg-gray-200 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute top-8 right-0 transform translate-x-1/2 text-gray-400 h-8 w-8 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 flex justify-center">
          <div className="max-w-4xl w-full bg-gray-100 rounded-2xl overflow-hidden">
            <div className="aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80" 
                alt="PresentAI in action" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
