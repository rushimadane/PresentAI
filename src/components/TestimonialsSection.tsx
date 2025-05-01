
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "I used to spend hours on presentations. With PresentAI, I create stunning slides in minutes. It's like having a professional designer at my fingertips.",
    author: "Sarah Johnson",
    title: "Marketing Director",
    company: "TechCorp",
    avatar: "/placeholder.svg",
    rating: 5
  },
  {
    content: "The AI understands exactly what I need. I just type my content and it transforms it into a cohesive, professional presentation. Game changer for my team.",
    author: "Michael Chen",
    title: "Product Manager",
    company: "Innovate Inc",
    avatar: "/placeholder.svg",
    rating: 5
  },
  {
    content: "As a teacher, I need to create engaging presentations quickly. PresentAI has saved me countless hours and my students love the visually appealing slides.",
    author: "Emily Rodriguez",
    title: "High School Teacher",
    company: "Lincoln Academy",
    avatar: "/placeholder.svg",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-xl text-gray-600">
            See what our users have to say about PresentAI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <img src={testimonial.avatar} alt={testimonial.author} />
                </Avatar>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}, {testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                    <path d="M12 20H4.93a8 8 0 0 1 14.14 0H12Z"></path>
                    <path d="M21 5h-1a3 3 0 0 0-3 3v1"></path>
                    <path d="M8 5h1a3 3 0 0 1 3 3v1"></path>
                    <path d="M12 8v4"></path>
                    <path d="m15 11-3 3-3-3"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-lg">+25,000 users</p>
                  <p className="text-gray-600">across all industries</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-lg">500,000+</p>
                  <p className="text-gray-600">presentations created</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
