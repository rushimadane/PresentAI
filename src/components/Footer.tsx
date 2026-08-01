import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-semibold">PresentAI</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
              An AI slide generator built on Gemini. Type a topic, get a deck with images.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="/#features" className="text-gray-600 hover:text-primary">Features</a>
            <a href="/#how-it-works" className="text-gray-600 hover:text-primary">How it works</a>
            <Link to="/templates" className="text-gray-600 hover:text-primary">Templates</Link>
            <a href="/#faq" className="text-gray-600 hover:text-primary">FAQ</a>
            <Link to="/start-creating" className="text-gray-600 hover:text-primary">Create a deck</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PresentAI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
