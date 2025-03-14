'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-orange-600 text-white px-10 py-4 rounded-md">
                Meal Match
            </span>
          </div>
          <div className="hidden md:flex ml-auto space-x-12">
            <NavLink href="/dashboard/grid" label="My Week" />
            <NavLink href="/dashboard/components" label="Components" />
            <NavLink href="/templates" label="Templates" />
            <NavLink href="/favorites" label="Favorites" />
            <div className="flex items-center space-x-4">
                <User className="w-6 h-6 cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <User className="md:hidden w-6 h-6 cursor-pointer" />
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <MobileNavLink href="/my-week" label="My Week" />
          <MobileNavLink href="/components" label="Components" />
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

function MobileNavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      {label}
    </Link>
  );
}