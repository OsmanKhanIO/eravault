'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white focus:outline-none z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="1.5">
            {isMobileMenuOpen ? (
              <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        {/* Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex-shrink-0 flex items-center z-50">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer touch-manipulation">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/[0.08] transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeOpacity="0.4" />
                <circle cx="8.5" cy="8.5" r="2" fill="currentColor" stroke="none" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-widest text-white uppercase font-sans">
              ERA<span className="text-neutral-500 font-normal">Vault</span>
            </span>
          </Link>
        </div>
        
        {/* Transparent, Honest Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="#specs" className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors tracking-wide">
            Storage Specs
          </Link>
          <Link href="#architecture" className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors tracking-wide">
            Architecture
          </Link>
          <Link href="#intelligence" className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors tracking-wide">
            AI Engine
          </Link>
          <a 
            href="https://github.com/OsmanKhanIO/eravault" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors tracking-wide flex items-center gap-1.5"
          >
            {/* Inline SVG for GitHub Logo - Completely eliminates icon library import errors */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Source Code
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0 z-50">
          <SignedOut>
            <Link href="/sign-in" className="px-4 py-2 text-[13px] font-medium text-neutral-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2 text-[13px] font-semibold bg-white text-black rounded-md hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
              Request Access
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-4 py-2 text-[13px] font-semibold bg-white text-black rounded-md hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
              Enter Vault
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-[#030303] border-b border-white/10 px-6 py-6 flex flex-col gap-5 z-40 shadow-2xl">
          <Link 
            href="#specs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-neutral-300 hover:text-white"
          >
            Storage Specs
          </Link>
          <Link 
            href="#architecture" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-neutral-300 hover:text-white"
          >
            Architecture
          </Link>
          <Link 
            href="#intelligence" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-neutral-300 hover:text-white"
          >
            AI Engine
          </Link>
          <a 
            href="https://github.com/OsmanKhanIO/eravault" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-neutral-300 hover:text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Source Code
          </a>
          
          <div className="h-[1px] w-full bg-white/10 my-1" />
          
          <SignedOut>
            <div className="flex flex-col gap-3">
              <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-sm font-medium text-white border border-white/15 rounded-lg">
                Sign In
              </Link>
              <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-sm font-semibold bg-white text-black rounded-lg">
                Request Access
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-sm font-semibold bg-white text-black rounded-lg">
              Enter Vault
            </Link>
          </SignedIn>
        </div>
      )}
    </header>
  )
}