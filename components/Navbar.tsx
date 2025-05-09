// components/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-lg font-bold">
            🚀 SniperBot
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="hover:text-yellow-400">
              Home
            </Link>
            <Link href="/pumpfunData" className="hover:text-yellow-400">
              Pumpfun Data
            </Link>
            <Link href="/bot" className="hover:text-yellow-400">
              BOT
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block hover:text-yellow-400">
            Home
          </Link>
          <Link href="/pumpfunData" className="block hover:text-yellow-400">
            Pumpfun Data
          </Link>
        </div>
      )}
    </nav>
  );
}
