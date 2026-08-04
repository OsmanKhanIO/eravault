'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Folder as FolderIcon, Share2, MoreHorizontal, Trash2, Edit2, Download, Loader2, Check } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

type Asset = { id: string, url: string, filename: string }

type FolderHeaderProps = {
  folderId: string
  folderName: string
  itemCount: number
  totalBytes: number
  assets: Asset[] 
}

export default function FolderHeader({ folderId, folderName, itemCount, totalBytes, assets }: FolderHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [newName, setNewName] = useState(folderName)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isZipping, setIsZipping] = useState(false) // 🚀 ZIP State
  const [toast, setToast] = useState<string | null>(null)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const generateVanitySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const copyPublicLink = () => {
    const url = `${window.location.origin}/share/${generateVanitySlug(folderName)}`
    navigator.clipboard.writeText(url)
    setIsMenuOpen(false)
    setToast("Public link copied to clipboard")
    setTimeout(() => setToast(null), 3000)
  }

  // 🚀 ENTERPRISE ZIP ENGINE
  const handleDownloadAll = async () => {
    setIsMenuOpen(false)
    if (assets.length === 0) {
      setToast("No assets to download")
      setTimeout(() => setToast(null), 3000)
      return
    }
    
    setIsZipping(true)
    setToast(`Compressing ${assets.length} master assets...`)

    try {
      const zip = new JSZip()
      // Create a branded master folder inside the zip
      const folderZip = zip.folder(`${folderName} - ERAVAULT`)

      // Fetch all blobs in parallel
      await Promise.all(assets.map(async (asset) => {
        const response = await fetch(asset.url)
        const blob = await response.blob()
        folderZip?.file(asset.filename, blob)
      }))

      // Generate the ZIP file
      const zipContent = await zip.generateAsync({ type: "blob" })
      saveAs(zipContent, `${folderName} - ERAVAULT.zip`)

      setToast("Download complete!")
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error("Zip generation failed", error)
      setToast("Error packaging ZIP. Some links may block access.")
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsZipping(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim() || newName === folderName) return setIsRenameModalOpen(false)
    setIsRenaming(true)
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) })
      if (res.ok) {
        setIsRenameModalOpen(false)
        setToast("Folder renamed successfully")
        setTimeout(() => setToast(null), 3000)
        router.refresh()
      }
    } catch (error) { console.error(error) } finally { setIsRenaming(false) }
  }

  const handleDeleteFolder = async () => {
    if (!confirm("Are you sure you want to delete this folder? Items inside will be moved to Trash.")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' })
      if (res.ok) { router.push('/dashboard/collections'); router.refresh() }
    } catch (error) { console.error("Delete failed", error); setIsDeleting(false) }
  }

  return (
    <div className="relative mb-6 md:mb-8 z-50">
      
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          {isZipping ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
          {toast}
        </div>
      )}

      <nav className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3 md:mb-4">
        <Link href="/dashboard/collections" className="hover:text-white transition-colors">Collections</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate max-w-[150px] md:max-w-[200px]">{folderName}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/10 rounded-xl p-4 md:p-5 shadow-xl relative">
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_50%)]" />
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="p-2.5 md:p-3 bg-white/[0.03] border border-white/10 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex-shrink-0">
            <FolderIcon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-light tracking-tight text-white mb-1 truncate">{folderName}</h1>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-[11px] font-medium text-neutral-300 backdrop-blur-md whitespace-nowrap">
                {itemCount} {itemCount === 1 ? 'Asset' : 'Assets'}
              </span>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-[11px] font-medium text-neutral-300 backdrop-blur-md whitespace-nowrap">
                {formatBytes(totalBytes)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-20 w-full md:w-auto mt-1 md:mt-0">
          <button onClick={copyPublicLink} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-medium text-xs rounded-md hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95">
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
          
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white transition-all active:scale-95 flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[9px] font-semibold text-neutral-500 uppercase tracking-widest border-b border-white/5 mb-1">Options</div>
                <button onClick={() => { setIsMenuOpen(false); setIsRenameModalOpen(true); }} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2 transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-neutral-400" /> Rename Folder
                </button>
                <button onClick={handleDownloadAll} disabled={isZipping} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isZipping ? <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" /> : <Download className="w-3.5 h-3.5 text-neutral-400" />} 
                  {isZipping ? 'Zipping...' : 'Download as .ZIP'}
                </button>
                <div className="h-px bg-white/10 my-1 w-full" />
                <button onClick={handleDeleteFolder} disabled={isDeleting} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isRenaming && setIsRenameModalOpen(false)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-medium text-white mb-4">Rename Folder</h2>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              autoFocus
              className="w-full bg-[#000000] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsRenameModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleRename} disabled={isRenaming} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isRenaming && <Loader2 className="w-3 h-3 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}