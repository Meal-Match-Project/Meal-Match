'use client';
import { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import CustomButton from "./ui/CustomButton";
import { Menu, X, Info, BookOpen, DollarSign } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);
    
    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-10xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-xl font-bold bg-orange-600 text-white px-10 py-4 rounded-md hover:bg-orange-700 transition-colors">
                                Meal Match
                            </span>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex ml-auto space-x-12 items-center">
                        <NavLink href="/about" label="ABOUT" icon={<Info className="w-4 h-4 mr-1" />} />
                        <NavLink href="#templates" label="TEMPLATES" icon={<BookOpen className="w-4 h-4 mr-1" />} />
                        <NavLink href="#pricing" label="PRICING" icon={<DollarSign className="w-4 h-4 mr-1" />} />
                        
                        <div className="flex space-x-4">
                            <Link href="/login">
                                <CustomButton className="bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md px-6 py-2">
                                    LOGIN
                                </CustomButton>
                            </Link>
                            
                            <Link href="/register">
                                <CustomButton className="border border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors shadow-sm px-6 py-2">
                                    SIGN UP
                                </CustomButton>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-orange-600 focus:outline-none"
                        >
                            {isMenuOpen ? 
                                <X className="h-6 w-6" /> : 
                                <Menu className="h-6 w-6" />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t" ref={mobileMenuRef}>
                    <MobileNavLink href="#about" label="ABOUT" />
                    <MobileNavLink href="#templates" label="TEMPLATES" />
                    <MobileNavLink href="#pricing" label="PRICING" />
                    
                    <div className="flex flex-col space-y-2 p-4">
                        <Link href="/login">
                            <CustomButton className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md py-2">
                                LOGIN
                            </CustomButton>
                        </Link>
                        
                        <Link href="/register">
                            <CustomButton className="w-full border border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors shadow-sm py-2">
                                SIGN UP
                            </CustomButton>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

// Components for Links
function NavLink({ href, label, icon }) {
    return (
        <Link href={href} className="text-gray-700 hover:text-orange-600 transition-colors flex items-center">
            {icon && icon}
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label }) {
    return (
        <Link href={href} className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100">
            {label}
        </Link>
    );
}

export default Navbar;