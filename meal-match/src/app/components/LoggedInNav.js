'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { userId: urlUserId } = useParams(); // Get userId from URL
  const [userId, setUserId] = useState(null);
  const [isMyWeekOpen, setIsMyWeekOpen] = useState(false);
  const [isMyWeekDropdownOpen, setIsMyWeekDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Refs for dropdowns
  const myWeekDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  // Load userId from URL or localStorage
  useEffect(() => {
    setHasMounted(true);
    const storedUserId = localStorage.getItem("userId");

    if (urlUserId) {
      setUserId(urlUserId);
      localStorage.setItem("userId", urlUserId);
    } else if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [urlUserId]);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (myWeekDropdownRef.current && !myWeekDropdownRef.current.contains(event.target)) {
        setIsMyWeekDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setIsMyWeekOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!hasMounted || !userId) return null; // Prevent hydration issues

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-10xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-orange-600 text-white px-10 py-4 rounded-md">
              Meal Match
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-auto space-x-12 items-center">
            <div className="relative" ref={myWeekDropdownRef}>
              {/* My Week Button */}
              <button 
                className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                onClick={() => setIsMyWeekDropdownOpen(!isMyWeekDropdownOpen)}
              >
                My Week <ChevronDown className={`w-4 h-4 transition-transform ${isMyWeekDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown for Desktop */}
              {isMyWeekDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
                  <DropdownLink href={`/dashboard/grid/${userId}`} label="Meal Planner" />
                  <DropdownLink href={`/dashboard/ingredients/${userId}`} label="Ingredients" />
                </div>
              )}
            </div>
            
            <NavLink href={`/dashboard/components/${userId}`} label="Components" />
            <NavLink href={`/templates/${userId}`} label="Templates" />
            <NavLink href={`/favorites/${userId}`} label="Favorites" />
            
            <div className="relative" ref={profileDropdownRef}>
              {/* Profile Button */}
              <button 
                className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <User className="w-6 h-6 cursor-pointer" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
                  <DropdownLink href={`/profile/${userId}`} label="Profile" />
                  <DropdownLink color="text-red-500" href="/" label="Log Out" />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-4">
            <User className="md:hidden w-6 h-6 cursor-pointer" />
            <button className="md:hidden" onClick={() => setIsMyWeekOpen(!isMyWeekOpen)}>
              {isMyWeekOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMyWeekOpen && (
        <div className="md:hidden bg-white border-t" ref={mobileDropdownRef}>
          <div>
            <button 
              onClick={() => setIsMyWeekDropdownOpen(!isMyWeekDropdownOpen)} 
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              My Week <ChevronDown className={`w-4 h-4 transition-transform ${isMyWeekDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isMyWeekDropdownOpen && (
              <div className="pl-4 border-l border-gray-300">
                <MobileNavLink href={`/dashboard/grid/${userId}`} label="Meal Planner" />
                <MobileNavLink href={`/dashboard/ingredients/${userId}`} label="Ingredients" />
              </div>
            )}
          </div>
          <MobileNavLink href={`/dashboard/components/${userId}`} label="Components" />
          <MobileNavLink href={`/templates/${userId}`} label="Templates" />
          <MobileNavLink href={`/favorites/${userId}`} label="Favorites" />
          <MobileNavLink href="/" label="Log Out" color="text-red-500" />
        </div>
      )}
    </nav>
  );
}

// Components for Links
function NavLink({ href, label }) {
  return (
    <Link href={href} className="text-gray-700 hover:text-gray-900">
      {label}
    </Link>
  );
}

function DropdownLink({ href, label, color }) {
  return (
    <Link href={href} className={`block px-4 py-2 ${color ? color : 'text-gray-700'} hover:bg-gray-100`}>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, color }) {
  return (
    <Link href={href} className={`block px-4 py-2 ${color ? color : 'text-gray-700'} hover:bg-gray-100`}>
      {label}
    </Link>
  );
}
