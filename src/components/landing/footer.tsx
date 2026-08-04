import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#000000] pt-16 md:pt-20 pb-12 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Footer Grid - Spaced out cleanly for both Mobile & Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16 md:mb-20">
          
          {/* Brand Column (Spans 2 columns on desktop) */}
          <div className="col-span-1 md:col-span-2 flex flex-col pr-0 md:pr-12">
            <Link href="/" className="flex items-center gap-3 mb-5 group cursor-pointer w-max">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/[0.08] transition-colors">
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
            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm font-light">
              Professional digital asset management. Engineered for zero-compression media retention, clean direct web URLs, and automated computer vision tagging.
            </p>
          </div>

          {/* 🚀 System & Developer Wrapper (Side-by-side on Mobile & Desktop with vertical divider line) */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6 sm:gap-8 pt-2 md:pt-0 border-t border-white/[0.04] md:border-t-0">
            
            {/* System Column */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-xs font-semibold text-white tracking-widest uppercase">System</h4>
              <Link href="#specs" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Storage Specs
              </Link>
              <Link href="#architecture" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Architecture
              </Link>
              <Link href="#intelligence" className="text-sm text-neutral-400 hover:text-white transition-colors">
                AI Engine
              </Link>
            </div>

            {/* Developer Column - Separated by a crisp vertical line (border-l) */}
            <div className="flex flex-col gap-3.5 border-l border-white/10 pl-6 sm:pl-8">
              <h4 className="text-xs font-semibold text-white tracking-widest uppercase">Developer</h4>
              
              {/* Direct GitHub Source Code Link */}
              <a 
                href="https://github.com/OsmanKhanIO/eravault" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 fill-current text-neutral-500 group-hover:text-white transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Source Code</span>
              </a>

              {/* Creator Portfolio Link */}
              <a 
                href="https://github.com/OsmanKhan276" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 stroke-current text-neutral-500 group-hover:text-white transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span>Creator Portfolio</span>
              </a>
            </div>

          </div>

        </div>

        {/* Bottom Bar - Clean, honest copyright & operational badge */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-neutral-600 font-mono tracking-wider uppercase text-center sm:text-left">
            © {new Date().getFullYear()} ERA Vault. Engineered by Osman Ahmed Khan.
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-400 font-medium tracking-wide">
              All Systems Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}