import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '@/services/auth'; // Make sure you have these

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = getCurrentUser(setUser); // Auth listener
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/"); // Redirect to home or login
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold">PresentAI</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-sm font-medium text-gray-700 hover:text-primary">Features</a>
            <a href="/#how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary">How It Works</a>
            <Link to="/templates" className="text-sm font-medium text-gray-700 hover:text-primary">Templates</Link>
            <a href="/#pricing" className="text-sm font-medium text-gray-700 hover:text-primary">Pricing</a>
            <a href="/#faq" className="text-sm font-medium text-gray-700 hover:text-primary">FAQ</a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary">Log in</Link>
                <Link to="/register" className="text-sm font-medium text-gray-700 hover:text-primary">Register</Link>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
            <a href="/#features" className="block px-3 py-2 hover:text-primary">Features</a>
            <a href="/#how-it-works" className="block px-3 py-2 hover:text-primary">How It Works</a>
            <Link to="/templates" className="block px-3 py-2 hover:text-primary">Templates</Link>
            <a href="/#pricing" className="block px-3 py-2 hover:text-primary">Pricing</a>
            <a href="/#faq" className="block px-3 py-2 hover:text-primary">FAQ</a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                  <Link to="/register" className="block px-3 py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Register</Link>
                  <Link to="/login" className="block px-3 py-2 mt-2 bg-primary text-white text-center rounded-md hover:bg-primary/90" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
