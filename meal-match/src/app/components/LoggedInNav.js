'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Prevents hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // Avoid rendering before mount

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-orange-600 text-white px-10 py-4 rounded-md">
              Meal Match
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-auto space-x-12 items-center">
            <div className="relative">
              {/* My Week Button (Click to Open) */}
              <button 
                className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                My Week <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown for Desktop (Click to Toggle) */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
                  <DropdownLink href="/dashboard/grid" label="Meal Planner" />
                  <DropdownLink href="/dashboard/ingredients" label="Ingredients" />
                </div>
              )}
            </div>
            
            <NavLink href="/dashboard/components" label="Components" />
            <NavLink href="/templates" label="Templates" />
            <NavLink href="/favorites" label="Favorites" />
            <User className="w-6 h-6 cursor-pointer" />
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-4">
            <User className="md:hidden w-6 h-6 cursor-pointer" />
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              My Week <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="pl-4 border-l border-gray-300">
                <MobileNavLink href="/dashboard/grid" label="Meal Planner" />
                <MobileNavLink href="/dashboard/ingredients" label="Ingredients" />
              </div>
            )}
          </div>
          <MobileNavLink href="/dashboard/components" label="Components" />
          <MobileNavLink href="/templates" label="Templates" />
          <MobileNavLink href="/favorites" label="Favorites" />
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }) {
  return (
    <Link href={href} className="text-gray-700 hover:text-gray-900">
      {label}
    </Link>
  );
}

function DropdownLink({ href, label }) {
  return (
    <Link href={href} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }) {
  return (
    <Link href={href} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {label}
    </Link>
  );
}
