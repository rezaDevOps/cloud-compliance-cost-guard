'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cloud, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">
              CloudGuard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              Preise
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
              So funktioniert's
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition">
              Dokumentation
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Kostenlos testen
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Preise
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                So funktioniert's
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Dokumentation
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-start">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Kostenlos testen
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}