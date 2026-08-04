'use client'

import React, { useState, useEffect } from 'react'
import { Folder as FolderIcon, Check, Copy, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/ui/pagination'

export default function FolderClient({ folder, assets }: { folder: any, assets: any[] }) {
  const [toast, setToast] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24
  const totalPages = Math.ceil(assets.length / itemsPerPage)
  
  const paginatedAssets = assets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentUrl(window.location.href) }, [])

  const copyFolderLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setToast("Collection link copied to clipboard!")
    setTimeout(() => setToast(null), 3000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }
  
  const totalBytes = assets.reduce((sum, asset) => sum + Number(asset.bytes), 0)

  const EraVaultLogo = () => (
    <Link href="/" className="flex items-center gap-3 group w-fit">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/[0.08] transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeOpacity="0.4" />
          <circle cx="8.5" cy="8.5" r="2" fill="currentColor" stroke="none" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-widest text-white uppercase font-sans transition-opacity group-hover:opacity-80">
        ERA<span className="text-neutral-500 font-normal">Vault</span>
      </span>
    </Link>
  )

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans flex flex-col relative selection:bg-white/20">
      
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <Check className="w-4 h-4 text-green-600" />
          {toast}
        </div>
      )}
      
      <header className="w-full border-b border-white/5 bg-[#000000]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <EraVaultLogo />
          <button 
            onClick={copyFolderLink} 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-md border border-white/10 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl shadow-2xl">
              <FolderIcon className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1} />
            </div>
            <div>
              <p className="text-neutral-500 font-medium tracking-widest uppercase text-[10px] md:text-xs mb-2">
                Shared Collection
              </p>
              <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-3">
                {folder.name}
              </h1>
              <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-400">
                <span>{assets.length} Master Assets</span>
                <span>•</span>
                <span>{formatBytes(totalBytes)} Total Size</span>
              </div>
            </div>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="w-full py-24 text-center border border-dashed border-white/10 rounded-2xl bg-[#050505]">
            <p className="text-neutral-500">This collection is currently empty.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {paginatedAssets.map((asset) => {
                const cleanName = asset.filename.split('.')[0]
                const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                const assetUrl = `/share/a/${asset.id}/${slug}`

                return (
                  <Link 
                    key={asset.id} 
                    href={assetUrl}
                    target="_blank"
                    className="group relative aspect-[3/4] bg-[#050505] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer"
                  >
                    <img 
                      src={asset.url} 
                      alt={asset.filename} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-[#0a0a0a]" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                      <div className="flex justify-end">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                          <ArrowRight className="w-4 h-4 -rotate-45" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium truncate drop-shadow-md">{asset.filename}</p>
                        <p className="text-[10px] text-neutral-300 uppercase tracking-widest mt-1">{formatBytes(Number(asset.bytes))}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {/* RENDER PUBLIC PAGINATION */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                // Scroll back to the top of the grid when page changes
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        )}
      </main>

      <footer className="w-full border-t border-white/5 bg-[#050505] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-3 text-center md:text-left items-center md:items-start">
            <EraVaultLogo />
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest">High-Fidelity Asset Archiving</p>
          </div>
          
          <Link href="/" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all group">
            Create your own vault
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
          </Link>
        </div>
      </footer>

    </div>
  )
}