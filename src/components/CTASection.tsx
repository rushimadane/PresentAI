import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-gray-50 py-14 px-6 text-center">
          <h2 className="text-3xl font-semibold mb-3">Make your first deck</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Enter a topic and get slides with images in about ten seconds. No sign-up cost, no card.
          </p>
          <Button size="lg" asChild>
            <Link to="/start-creating">
              Create a deck
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
