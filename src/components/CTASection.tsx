
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
          <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Transform your ideas into stunning presentations today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of professionals creating beautiful presentations in minutes, not hours.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg group" asChild>
              <Link to="/start-creating">
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-white/80">
              No credit card required. Free plan available forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
