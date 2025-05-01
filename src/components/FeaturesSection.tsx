
import React from 'react';
import { Wand2, Clock, LayoutGrid, Image, Gift, Shapes, Globe, Layers } from 'lucide-react';

const features = [
  {
    icon: <Wand2 className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Design',
    description: 'Our AI automatically arranges your content with beautiful typography, colors, and layouts.'
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: 'Save Hours of Work',
    description: 'Create presentation-ready slides in minutes, not hours. Focus on your message, not the design.'
  },
  {
    icon: <LayoutGrid className="h-8 w-8 text-primary" />,
    title: 'Smart Templates',
    description: 'Choose from hundreds of templates, or let our AI suggest the best one for your content.'
  },
  {
    icon: <Image className="h-8 w-8 text-primary" />,
    title: 'Auto Image Suggestions',
    description: 'AI finds and suggests relevant, high-quality images to illustrate your points.'
  },
  {
    icon: <Gift className="h-8 w-8 text-primary" />,
    title: 'Presentation Mode',
    description: 'Present directly from your browser with notes, timer, and audience engagement tools.'
  },
  {
    icon: <Shapes className="h-8 w-8 text-primary" />,
    title: 'Smart Data Visualization',
    description: 'Turn numbers and statistics into beautiful charts and graphs automatically.'
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: 'Collaboration Tools',
    description: 'Work together in real-time with team members. Share and edit presentations collaboratively.'
  },
  {
    icon: <Layers className="h-8 w-8 text-primary" />,
    title: 'Export Options',
    description: 'Export to PowerPoint, PDF, or present online. Compatible with all major platforms.'
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features That Make Presentations <span className="gradient-text">Simple</span>
          </h2>
          <p className="text-xl text-gray-600">
            Our AI-powered platform handles the heavy lifting so you can focus on your message.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
