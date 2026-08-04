import Header from '@/components/landing/header'
import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import Footer from '@/components/landing/footer'

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#000000] text-neutral-200 overflow-hidden selection:bg-white/20 selection:text-white">
      
      {/* Premium Enterprise Background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <Header />
      
      <main className="flex-grow relative z-10">
        <Hero />
        <Features />
      </main>

      <Footer />
    </div>
  )
}