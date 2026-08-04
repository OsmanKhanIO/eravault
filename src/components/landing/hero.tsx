import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Hero() {
  const coreFeatures = [
    "Zero Compression", "Absolute Fidelity", "Global Edge Delivery", 
    "Agentic AI Sorting", "Studio-Grade Archival", "Native Resolution", 
    "Zero Latency", "End-to-End Encryption"
  ]

  return (
    <section className="relative z-10 w-full pt-8 md:pt-12 pb-0 text-center flex flex-col items-center">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white rounded-full blur-[150px] mix-blend-screen pointer-events-none opacity-0 animate-spotlight" />

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#050505] backdrop-blur-xl mb-4 opacity-0 animate-fadeUp z-10" style={{ animationDelay: '100ms' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] md:text-[11px] font-medium text-neutral-300 uppercase tracking-[0.2em]">Professional Image Hosting</span>
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-[84px] font-bold tracking-tighter mb-4 max-w-5xl mx-auto px-4 bg-gradient-to-b from-white via-neutral-200 to-neutral-600 bg-clip-text text-transparent opacity-0 animate-fadeUp z-10 leading-[1.1] pb-2 md:pb-4" style={{ animationDelay: '200ms' }}>
        Host high-res media. <br className="hidden md:block" /> Zero compression.
      </h1>
      
      {/* 🚀 ENTERPRISE PIVOT: Swapped out posters/backdrops for universal enterprise media formats */}
      <p className="text-base md:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto mb-6 font-light leading-relaxed px-6 opacity-0 animate-fadeUp z-10" style={{ animationDelay: '300ms' }}>
        Upload uncompressed RAW photography, multi-layered design assets, and heavy visual media. Generate permanent, direct web links instantly while preserving 100% of the original pixel depth.
      </p>

      <div className="flex flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-[340px] sm:max-w-none px-6 opacity-0 animate-fadeUp z-10" style={{ animationDelay: '400ms' }}>
        <SignedOut>
          <Link href="/sign-up" className="flex-1 sm:flex-none sm:w-auto px-0 sm:px-10 py-3.5 md:py-4 text-[13px] sm:text-sm font-semibold bg-white text-black rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] whitespace-nowrap text-center">
            Request Access
          </Link>
          <Link href="/sign-in" className="flex-1 sm:flex-none sm:w-auto px-0 sm:px-10 py-3.5 md:py-4 text-[13px] sm:text-sm font-medium text-white bg-transparent border border-white/15 rounded-lg hover:bg-white/5 active:scale-95 transition-all whitespace-nowrap text-center">
            Sign In
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="w-full sm:w-auto px-10 py-3.5 md:py-4 text-sm font-semibold bg-white text-black rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] text-center">
            Enter Vault
          </Link>
        </SignedIn>
      </div>

      <div className="w-full overflow-hidden mt-8 md:mt-12 border-y border-white/[0.04] bg-[#020202]/50 py-6 md:py-8 relative opacity-0 animate-fadeUp" style={{ animationDelay: '500ms' }}>
        
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 md:w-48 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 md:w-48 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />
        
        <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused] items-center">
          
          <div className="flex items-center">
            {coreFeatures.map((feature, i) => (
              <div key={`first-${i}`} className="flex items-center">
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] text-neutral-500 uppercase px-8 md:px-12 whitespace-nowrap">
                  {feature}
                </span>
                <span className="text-white/[0.08] text-sm font-light">/</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center">
            {coreFeatures.map((feature, i) => (
              <div key={`second-${i}`} className="flex items-center">
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] text-neutral-500 uppercase px-8 md:px-12 whitespace-nowrap">
                  {feature}
                </span>
                <span className="text-white/[0.08] text-sm font-light">/</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  )
}