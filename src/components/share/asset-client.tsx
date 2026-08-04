'use client'

import React, { useState, useEffect } from 'react'
import { Download, Image as ImageIcon, Copy, Check, X, Expand } from 'lucide-react'
import Link from 'next/link'

type Asset = { id: string, url: string, filename: string, format: string, bytes: number, createdAt: Date }

export default function AssetClient({ asset }: { asset: Asset }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')

  // FIX: Only access window.location after the component mounts on the client
  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const htmlCode = `<a href="${currentUrl}"><img src="${asset.url}" alt="${asset.filename}" /></a>`
  const markdownCode = `[![${asset.filename}](${asset.url})](${currentUrl})`

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const formatBytes = (bytes: number) => {
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const EmbedRow = ({ label, value }: { label: string, value: string }) => {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
      navigator.clipboard.writeText(value)
      setCopied(true)
      showToast(`${label} copied to clipboard`)
      setTimeout(() => setCopied(false), 2000)
    }
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{label}</label>
        <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden group hover:border-white/30 transition-colors">
          <input type="text" readOnly value={value} className="flex-1 bg-transparent px-3 py-2.5 text-xs text-neutral-300 focus:outline-none font-mono selection:bg-white/20" />
          <button onClick={handleCopy} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white transition-colors border-l border-white/10 flex items-center justify-center">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-white/20 flex flex-col relative">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <Check className="w-4 h-4 text-green-600" /> {toast}
        </div>
      )}

      {/* HEADER & FOOTER use the same EraVaultLogo component (defined inside or extracted) */}
      <header className="w-full border-b border-white/5 bg-[#000000]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase">ERA<span className="text-neutral-500 font-normal">Vault</span></Link>
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md border border-white/5">Public Asset</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
        <div onClick={() => setIsLightboxOpen(true)} className="flex-1 w-full bg-[#050505] border border-white/10 rounded-2xl p-4 flex items-center justify-center relative shadow-2xl min-h-[50vh] cursor-zoom-in">
          <img src={asset.url} alt={asset.filename} className="max-w-full max-h-[70vh] object-contain" />
        </div>
        <div className="w-full md:w-96 flex flex-col gap-6">
          <h1 className="text-xl font-light">{asset.filename}</h1>
          <EmbedRow label="Direct Link" value={asset.url} />
          <EmbedRow label="HTML Embed" value={htmlCode} />
          <EmbedRow label="Markdown" value={markdownCode} />
          <a href={asset.url} download className="w-full py-3 bg-white text-black font-semibold rounded-lg text-center text-sm">Download Master File</a>
        </div>
      </main>
    </div>
  )
}