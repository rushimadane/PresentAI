
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Presentation, SlideContent } from '@/services/presentationService';
import { usePresentations } from '@/contexts/PresentationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Clock, ThumbsUp, Star, Filter } from 'lucide-react';

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { addPresentation } = usePresentations();
  const navigate = useNavigate();

  // Template categories
  const categories = [
    'All',
    'Business',
    'Education',
    'Marketing',
    'Design',
    'Science',
    'Creative'
  ];

  // Template data
  const templates = [
    {
      id: 'template-1',
      title: 'Business Proposal',
      category: 'Business',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      popularity: 4.8,
      slides: [
        { 
          title: 'Executive Summary', 
          content: 'Overview of the business proposal',
          imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Market Analysis', 
          content: 'Analysis of the target market and competition',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Financial Projections', 
          content: 'Overview of expected costs and revenues',
          imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
        },
      ]
    },
    {
      id: 'template-2',
      title: 'Course Lecture',
      category: 'Education',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      popularity: 4.5,
      slides: [
        { 
          title: 'Introduction', 
          content: 'Course overview and objectives',
          imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Key Concepts', 
          content: 'The fundamental concepts covered in this lecture',
          imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Practical Applications', 
          content: 'Real-world applications of the concepts',
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
        },
      ]
    },
    {
      id: 'template-3',
      title: 'Marketing Campaign',
      category: 'Marketing',
      thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      popularity: 4.7,
      slides: [
        { 
          title: 'Campaign Overview', 
          content: 'Marketing campaign goals and strategy',
          imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Target Audience', 
          content: 'Detailed description of the target demographic',
          imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Performance Metrics', 
          content: 'KPIs and success measures for the campaign',
          imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80'
        },
      ]
    },
    {
      id: 'template-4',
      title: 'Product Design',
      category: 'Design',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
      popularity: 4.6,
      slides: [
        { 
          title: 'Design Brief', 
          content: 'Overview of the product design challenge',
          imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'User Research', 
          content: 'Insights from user interviews and testing',
          imageUrl: 'https://images.unsplash.com/photo-1576153192396-180ecef2a715?auto=format&fit=crop&w=800&q=80'
        },
        { 
          title: 'Final Concept', 
          content: 'Presentation of the final design solution',
          imageUrl: 'https://images.unsplash.com/photo-1508144753681-9986d4df99b3?auto=format&fit=crop&w=800&q=80'
        },
      ]
    },
  ];

  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    // Convert template to a Presentation format
    const presentation: Presentation = {
      id: template.id,
      title: template.title,
      createdAt: new Date().toISOString(),
      slides: template.slides as SlideContent[],
    };
    
    addPresentation(presentation);
    navigate('/start-creating');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore <span className="gradient-text">Presentation Templates</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our professionally designed templates and customize them with AI to create stunning presentations in minutes.
            </p>
          </div>
          
          <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-500" size={18} />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="w-fit">
                <TabsList className="grid grid-flow-col auto-cols-max gap-1">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="px-3 py-1.5 text-xs">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        {template.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm ml-1">{template.popularity}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600">{template.slides.length} slides</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleUseTemplate(template)} className="w-full">
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
