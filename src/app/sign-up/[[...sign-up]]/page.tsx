import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#000000] font-sans selection:bg-white/20">
      
      {/* LEFT PANEL: Spacious, Professional Scrollable Auth */}
      <div className="w-full lg:w-1/2 flex flex-col relative items-center py-16 px-6 md:px-16 z-10 bg-[#020202] min-h-screen">
        
        {/* Subtle Architectural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Top-Left Brand Logo */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 bg-white/[0.03] border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/[0.08] transition-colors rounded-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeOpacity="0.4" />
                <circle cx="8.5" cy="8.5" r="2" fill="currentColor" stroke="none" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-widest text-white uppercase font-sans hidden sm:block">
              ERA<span className="text-neutral-500 font-normal">Vault</span>
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-[360px] mt-12 md:mt-20">
          
          <div className="mb-8 w-full">
            <h1 className="text-2xl font-light text-white tracking-tight mb-1 flex items-center">
              Join 
              <span className="font-semibold tracking-widest uppercase text-white font-sans text-xl ml-2">
                ERA<span className="text-neutral-500 font-normal">Vault</span>
              </span>
            </h1>
            <p className="text-neutral-500 text-sm font-normal">Create your secure workspace.</p>
          </div>

          <div className="w-full">
            <SignUp 
              routing="path"
              path="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorBackground: 'transparent',
                  colorText: 'white',
                  colorTextOnPrimaryBackground: 'black',
                  // FIX: Forces all inputs to have a solid background immediately upon render
                  colorInputBackground: '#050505',
                  colorInputText: 'white',
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full bg-transparent shadow-none border-none m-0 p-0",
                  card: "bg-transparent shadow-none border-none p-0 w-full m-0",
                  header: "hidden", 
                  
                  socialButtonsBlockButton: "bg-[#050505] border border-white/20 hover:bg-white/[0.08] text-white rounded-none h-11 transition-all mt-1",
                  socialButtonsBlockButtonText: "text-white font-medium text-sm",
                  
                  dividerRow: "my-6",
                  dividerLine: "bg-white/20",
                  dividerText: "text-neutral-500 font-mono text-[10px] uppercase tracking-widest bg-[#020202] px-3",
                  
                  formFieldRow: "mb-4",
                  formFieldLabel: "text-neutral-400 font-medium text-[11px] mb-2 uppercase tracking-widest",
                  formFieldInput: "bg-[#050505] border border-white/20 text-white focus:border-white/60 focus:bg-black focus:ring-0 outline-none shadow-none rounded-none h-11 px-3 transition-all text-sm placeholder:text-neutral-600 box-border w-full",
                  
                  // FIX: Added !important tags to force Tailwind styles over Clerk's dynamic mounting
                  otpCodeFieldInput: "!bg-[#050505] !border-white/20 border border-solid text-white focus:!border-white/60 focus:!bg-black focus:ring-0 outline-none shadow-none rounded-none transition-all text-lg",
                  formResendCodeLink: "text-neutral-400 hover:text-white font-medium transition-colors",
                  
                  formButtonPrimary: "bg-white text-black hover:bg-neutral-200 rounded-none font-semibold tracking-widest uppercase h-11 mt-2 transition-colors shadow-none text-xs",
                  
                  footerAction: "mt-6",
                  footerActionText: "text-neutral-500 text-sm",
                  footerActionLink: "text-white hover:text-neutral-300 font-medium text-sm ml-2 transition-colors",
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Static Image */}
      <div className="hidden lg:flex w-1/2 relative border-l border-white/[0.08] bg-[#020202] overflow-hidden items-center justify-center sticky top-0 h-screen">
        <Image 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Dark architectural geometry"
          fill
          className="object-cover opacity-50 mix-blend-lighten"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/80 via-[#020202]/40 to-transparent" />

        <div className="relative z-10 max-w-lg px-12 border-l-2 border-white pl-8 py-2">
          <h2 className="text-2xl leading-[1.3] font-light text-white tracking-tight mb-6">
            Create your workspace to upload and manage high-resolution assets.
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md border border-white/20 rounded-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeOpacity="0.4" />
                <circle cx="8.5" cy="8.5" r="2" fill="currentColor" stroke="none" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium tracking-wide">Account Provisioning</p>
              <p className="text-neutral-400 text-[11px] font-mono uppercase tracking-widest mt-0.5">Secure Environment</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}