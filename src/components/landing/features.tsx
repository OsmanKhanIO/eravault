import { Focus, Zap, Cpu, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-0">
      
      {/* --- THE THREE PILLARS (Anchored to #specs) --- */}
      <div id="specs" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-24 md:mb-32 scroll-mt-24">
        
        {/* Feature 01: Storage & Quality */}
        <div className="relative p-6 md:p-8 rounded-2xl border border-white/10 bg-[#050505] overflow-hidden group hover:border-white/30 transition-all duration-500 opacity-0 animate-fadeUp" style={{ animationDelay: '600ms' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                <Focus className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <div className="text-[10px] font-medium text-neutral-600 uppercase tracking-[0.2em] text-right">Image Quality</div>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-3 leading-tight">Zero Automatic Compression</h3>
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              We never downscale or compress your uploads. High-resolution design files, RAW photography, and heavy marketing assets are stored and served at their exact original pixel depth.
            </p>
          </div>
        </div>

        {/* Feature 02: Delivery & Links */}
        <div className="relative p-6 md:p-8 rounded-2xl border border-white/10 bg-[#050505] overflow-hidden group hover:border-white/30 transition-all duration-500 opacity-0 animate-fadeUp" style={{ animationDelay: '700ms' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                <Zap className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <div className="text-[10px] font-medium text-neutral-600 uppercase tracking-[0.2em] text-right">Asset Delivery</div>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-3 leading-tight">Direct Web URLs</h3>
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              Generate permanent, CDN-backed direct links instantly. Bypass proxy servers and forced redirects with clean, uncompressed URLs ready for immediate embedding in production environments.
            </p>
          </div>
        </div>

        {/* Feature 03: Organization & AI */}
        <div className="relative p-6 md:p-8 rounded-2xl border border-white/10 bg-[#050505] overflow-hidden group hover:border-white/30 transition-all duration-500 opacity-0 animate-fadeUp" style={{ animationDelay: '800ms' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                <Cpu className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <div className="text-[10px] font-medium text-neutral-600 uppercase tracking-[0.2em]">Organization</div>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-3 leading-tight">Computer Vision Tagging</h3>
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              Upload an asset and our intelligence layer instantly scans, identifies, and tags the content. Locate specific subjects, visual themes, or brand assets across your entire workspace in milliseconds.
            </p>
          </div>
        </div>

      </div>

      {/* --- ENTERPRISE ARCHITECTURE (Anchored to #architecture) --- */}
      <div id="architecture" className="w-full mb-16 md:mb-24 opacity-0 animate-fadeUp scroll-mt-24" style={{ animationDelay: '900ms' }}>
        <div className="relative w-full rounded-3xl bg-[#050505] border border-white/10 overflow-hidden flex flex-col lg:flex-row items-stretch shadow-2xl">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />

          <div className="flex-1 p-8 md:p-16 flex flex-col items-start text-left z-10 justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 w-max mb-6">
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-[0.2em]">Enterprise Architecture</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent pb-2 leading-[1.1]">
              Engineered for scale. <br /> Secured by design.
            </h2>
            
            <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed mb-8 max-w-lg">
              EraVault replaces fragmented storage drives and lossy cloud folders with a singular, immutable vault. Every asset is encrypted at rest, globally distributed, and served with uncompromising mathematical precision.
            </p>

            <Link href="/sign-up" className="flex items-center gap-2 text-sm font-medium text-white hover:text-neutral-300 transition-colors w-max group">
              Explore Infrastructure 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 w-full border-t lg:border-t-0 lg:border-l border-white/5 bg-[#020202] relative flex flex-col justify-center p-8 md:p-16 gap-8">
            <div className="flex flex-col">
              <h4 className="text-white text-sm font-medium tracking-wide mb-2">Mathematical Immutability</h4>
              <p className="text-neutral-500 text-sm font-light leading-relaxed">
                Files are strictly verified upon upload, ensuring bit-for-bit identical retention. Your digital assets remain in their exact, original state forever.
              </p>
            </div>

            <div className="h-[1px] w-full bg-white/5" />

            <div className="flex flex-col">
              <h4 className="text-white text-sm font-medium tracking-wide mb-2">Global Edge Network</h4>
              <p className="text-neutral-500 text-sm font-light leading-relaxed">
                Media is dynamically cached across a high-performance Content Delivery Network, routing assets to your end-users with single-digit millisecond latency.
              </p>
            </div>

            <div className="h-[1px] w-full bg-white/5" />

            <div className="flex flex-col">
              <h4 className="text-white text-sm font-medium tracking-wide mb-2">Zero-Trust Security</h4>
              <p className="text-neutral-500 text-sm font-light leading-relaxed">
                Built on enterprise-grade infrastructure utilizing AES-256 encryption at rest, secure environment variables, and strict authenticated access controls.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* --- ERAVAULT INTELLIGENCE (AI - Anchored to #intelligence) --- */}
      <div id="intelligence" className="w-full opacity-0 animate-fadeUp scroll-mt-24" style={{ animationDelay: '1000ms' }}>
        <div className="relative w-full rounded-3xl bg-[#050505] border border-white/10 overflow-hidden flex flex-col lg:flex-row items-stretch shadow-2xl">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />

          <div className="flex-1 p-8 md:p-16 flex flex-col items-start text-left z-10 justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 w-max mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-[0.2em]">EraVault Intelligence</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-4 text-white pb-2 leading-tight">
              Your archive, fully autonomous.
            </h2>
            
            <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed mb-8 max-w-lg">
              Stop manual data entry. Our proprietary computer vision models analyze every pixel of your uploads, instantly generating accurate metadata and localized tags—making massive libraries instantly searchable.
            </p>

            <Link href="/sign-up" className="flex items-center gap-2 text-sm font-medium text-white hover:text-neutral-300 transition-colors w-max group">
              See AI in action 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 w-full min-h-[300px] lg:min-h-[400px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#020202] relative flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-[#080808] p-5 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02]">
              
              <div className="w-full aspect-video rounded-lg bg-[#000000] border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
                <div className="w-full h-[1px] bg-emerald-500/50 absolute top-1/2 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                <Focus className="w-8 h-8 text-white/10" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-mono tracking-wide">8192×5464</span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono tracking-wide">KEY_ART</span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono tracking-wide">CINEMATIC</span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-mono tracking-wide">RAW_FORMAT</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- FINAL BOTTOM CTA --- */}
      <div className="w-full mt-8 md:mt-12 mb-0 flex flex-col items-center text-center opacity-0 animate-fadeUp" style={{ animationDelay: '1100ms' }}>
        
        <div className="w-full rounded-3xl bg-[#030303] border border-white/10 p-12 md:p-20 relative overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.05)]">
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-white leading-tight">
              Ready to scale your visual archive?
            </h2>
            
            <p className="text-neutral-400 text-base md:text-lg font-light mb-10 max-w-xl mx-auto">
              Deploy your uncompressed, globally distributed media vault in minutes. Engineered for creative professionals and enterprise scale.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto px-10 py-4 text-sm font-semibold bg-white text-black rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                Request Access
              </Link>
              <Link href="#" className="w-full sm:w-auto px-10 py-4 text-sm font-medium text-white bg-transparent border border-white/15 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 active:scale-95 transition-all">
                Contact Enterprise
              </Link>
            </div>
          </div>
          
        </div>
      </div>

    </section>
  )
}