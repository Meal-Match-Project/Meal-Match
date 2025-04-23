"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function LoggedInNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Guard against no session
  if (!userId) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navLinks = [
    { name: 'Dashboard', href: `/dashboard/grid/${userId}`, active: pathname.includes('/dashboard/grid') },
    { name: 'Components', href: `/dashboard/components/${userId}`, active: pathname.includes('/dashboard/components') },
    { name: 'Ingredients', href: `/dashboard/ingredients/${userId}`, active: pathname.includes('/dashboard/ingredients') },
    { name: 'Templates', href: `/templates/${userId}`, active: pathname.includes('/templates') },
    { name: 'Favorites', href: `/favorites/${userId}`, active: pathname.includes('/favorites') },
    { name: 'Profile', href: `/profile/${userId}`, active: pathname.includes('/profile') },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={`/dashboard/grid/${userId}`} className="flex-shrink-0">
              <span className="text-orange-500 font-bold text-xl">Meal Match</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    link.active 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-100 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-orange-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  link.active 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-100 hover:text-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
