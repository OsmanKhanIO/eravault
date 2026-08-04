'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Check, Trash2, RotateCcw, LayoutGrid, List, ChevronLeft, ChevronRight, Loader2, Search, MoreVertical, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/ui/pagination'

type Asset = { id: string, filename: string, url: string, format: string, bytes: number, createdAt: Date }

export default function TrashClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  useEffect(() => { setAssets(initialAssets) }, [initialAssets])

  const [searchQuery, setSearchQuery] = useState("")
  const filteredAssets = assets.filter(a => a.filename.toLowerCase().includes(searchQuery.toLowerCase()))

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  // 🚀 Premium UI States
  const [imageMenu, setImageMenu] = useState<{ id: string, x: number, y: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'bulk' } | null>(null)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  // --- UNIFIED RESTORE LOGIC ---
  const handleRestore = async (target: { type: 'single', id: string } | { type: 'bulk' }) => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      if (target.type === 'single') {
        await fetch(`/api/assets/${target.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: false }) })
        setAssets(current => current.filter(a => a.id !== target.id))
        setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(target.id); return newSet; })
        setToast("Asset restored to vault")
      } else {
        if (selectedIds.size === 0) return
        await Promise.all(Array.from(selectedIds).map(id => 
          fetch(`/api/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: false }) })
        ))
        setAssets(current => current.filter(a => !selectedIds.has(a.id)))
        setSelectedIds(new Set())
        setToast(`${selectedIds.size} assets restored`)
      }
      setTimeout(() => setToast(null), 3000)
      router.refresh()
    } catch (error) { console.error("Restore failed", error) } finally { setIsProcessing(false) }
  }

  // --- 🚀 UNIFIED PERMANENT DELETE LOGIC ---
  const confirmPermanentDelete = async () => {
    if (!deleteTarget || isProcessing) return
    setIsProcessing(true)
    
    try {
      if (deleteTarget.type === 'single') {
        await fetch(`/api/assets/${deleteTarget.id}`, { method: 'DELETE' })
        setAssets(current => current.filter(a => a.id !== deleteTarget.id))
        setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(deleteTarget.id); return newSet; })
        setToast("Asset permanently deleted")
      } else {
        await Promise.all(Array.from(selectedIds).map(id => 
          fetch(`/api/assets/${id}`, { method: 'DELETE' })
        ))
        setAssets(current => current.filter(a => !selectedIds.has(a.id)))
        setSelectedIds(new Set())
        setToast(`${selectedIds.size} items permanently deleted`)
      }
      setTimeout(() => setToast(null), 3000)
      setDeleteTarget(null)
      router.refresh()
    } catch (error) { console.error("Delete failed", error) } finally { setIsProcessing(false) }
  }

  const openImageMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const x = Math.min(e.clientX, window.innerWidth - 200)
    setImageMenu({ id, x, y: e.clientY })
  }

  useEffect(() => {
    const handleClick = () => setImageMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return
    if (e.key === 'ArrowRight') setSelectedIndex(prev => (prev !== null && prev < filteredAssets.length - 1 ? prev + 1 : prev))
    if (e.key === 'ArrowLeft') setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))
    if (e.key === 'Escape') setSelectedIndex(null)
  }, [selectedIndex, filteredAssets.length])
  
  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown) }, [handleKeyDown])

  return (
    <div className="relative min-h-[500px] w-full pb-32" onContextMenu={(e) => { e.preventDefault(); setImageMenu(null); }}>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <Check className="w-4 h-4 text-green-600" /> {toast}
        </div>
      )}

      {/* 🚀 PREMIUM PERMANENT DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessing && setDeleteTarget(null)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-medium text-white">
                {deleteTarget.type === 'bulk' ? `Permanently delete ${selectedIds.size} items?` : 'Permanently delete asset?'}
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              This action cannot be undone. {deleteTarget.type === 'bulk' ? 'These items' : 'This asset'} will be wiped from our servers completely.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isProcessing} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={confirmPermanentDelete} disabled={isProcessing} className="px-5 py-2 text-sm bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-0 z-20 bg-[#000000]/90 backdrop-blur-xl py-3 border-b border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search deleted files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/30 transition-colors" />
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-xs text-neutral-500 font-medium">
            {paginatedAssets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
          </span>
          <div className="flex items-center bg-[#050505] border border-white/10 rounded-md p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition-colors touch-manipulation ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-colors touch-manipulation ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-16 border border-dashed border-white/10 rounded-xl bg-[#020202] mt-8 text-center">
          <div className="p-5 bg-white/5 rounded-full mb-5"><Trash2 className="w-8 h-8 text-neutral-500" /></div>
          <h3 className="text-lg font-medium text-white mb-2">Trash is empty</h3>
          <p className="text-neutral-500 text-sm">Deleted files will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {paginatedAssets.map((asset) => (
                <div key={asset.id} onClick={() => setSelectedIndex(filteredAssets.findIndex(a => a.id === asset.id))} onContextMenu={(e) => openImageMenu(e, asset.id)} className="group relative aspect-square bg-[#050505] border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-red-500/30 transition-colors">
                  <img src={asset.url} alt={asset.filename} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500 bg-[#0a0a0a]" />
                  
                  {/* 🚀 SAAS Context Menu Trigger */}
                  <button 
                    onClick={(e) => openImageMenu(e, asset.id)} 
                    className="absolute top-2 right-2 p-1.5 md:opacity-0 md:group-hover:opacity-100 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-white/80 hover:text-white transition-all z-10 touch-manipulation shadow-lg"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                    <div className="pointer-events-auto w-fit">
                      <input type="checkbox" checked={selectedIds.has(asset.id)} onChange={(e) => { e.stopPropagation(); const newSet = new Set(selectedIds); newSet.has(asset.id) ? newSet.delete(asset.id) : newSet.add(asset.id); setSelectedIds(newSet); }} onClick={(e) => e.stopPropagation()} className="w-5 h-5 rounded border-white/30 bg-black/50 text-red-500 focus:ring-0 cursor-pointer" />
                    </div>
                    <span className="text-xs text-white truncate font-medium">{asset.filename}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-[#050505] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0A0A0A]">
                    <tr>
                      <th className="w-12 px-4 py-3"></th>
                      <th className="px-4 py-3 text-neutral-500 font-medium">Name</th>
                      <th className="px-4 py-3 text-neutral-500 font-medium">Size</th>
                      <th className="px-4 py-3 text-neutral-500 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedAssets.map((asset) => (
                      <tr key={asset.id} onClick={() => setSelectedIndex(filteredAssets.findIndex(a => a.id === asset.id))} className="hover:bg-red-500/10 cursor-pointer transition-colors group">
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(asset.id)} onChange={(e) => { e.stopPropagation(); const newSet = new Set(selectedIds); newSet.has(asset.id) ? newSet.delete(asset.id) : newSet.add(asset.id); setSelectedIds(newSet) }} className="w-5 h-5 rounded border-white/20 bg-black focus:ring-0 cursor-pointer touch-manipulation" /></td>
                        <td className="px-4 py-4 flex items-center gap-3"><img src={asset.url} loading="lazy" decoding="async" className="w-8 h-8 rounded bg-[#0A0A0A] border border-white/10 object-cover opacity-60" /><span className="text-neutral-300 font-medium">{asset.filename}</span></td>
                        <td className="px-4 py-4 text-neutral-500">{formatBytes(asset.bytes)}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={(e) => openImageMenu(e, asset.id)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* SINGLE IMAGE CONTEXT MENU */}
      {imageMenu && (
        <div className="fixed z-[9999] w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 animate-in zoom-in-95 duration-100" style={{ top: Math.min(imageMenu.y, window.innerHeight - 150), left: imageMenu.x }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setSelectedIndex(filteredAssets.findIndex(a => a.id === imageMenu.id)); setImageMenu(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm text-white hover:bg-white/10 flex items-center gap-3"><LayoutGrid className="w-4 h-4 md:w-3.5 md:h-3.5" /> Preview</button>
          <div className="h-px bg-white/10 my-1 w-full" />
          
          <button 
            onClick={() => { handleRestore({ type: 'single', id: imageMenu.id }); setImageMenu(null); }} 
            className="w-full text-left px-4 py-3 md:py-2 text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-3"
          >
            <RotateCcw className="w-4 h-4 md:w-3.5 md:h-3.5" /> Restore
          </button>
          
          <button 
            onClick={() => { setDeleteTarget({ type: 'single', id: imageMenu.id }); setImageMenu(null); }} 
            className="w-full text-left px-4 py-3 md:py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3"
          >
            <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> Delete Forever
          </button>
        </div>
      )}

      {/* ACTION POPUP FOR BULK TRASH */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-4 md:gap-6 animate-in slide-in-from-bottom-10 fade-in w-[90%] md:w-auto overflow-x-auto">
          <span className="text-xs md:text-sm font-medium text-white bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20 flex-shrink-0" />
          <button onClick={() => handleRestore({ type: 'bulk' })} disabled={isProcessing} className="text-xs md:text-sm text-green-400 hover:text-green-300 flex items-center gap-2 transition-colors whitespace-nowrap touch-manipulation">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} <span className="hidden md:inline">Restore</span>
          </button>
          <button onClick={() => setDeleteTarget({ type: 'bulk' })} disabled={isProcessing} className="text-xs md:text-sm text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors whitespace-nowrap touch-manipulation">
            <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Delete Permanently</span>
          </button>
        </div>
      )}

      {/* TRASH LIGHTBOX (Read-Only) */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[120] flex bg-black/98 backdrop-blur-xl animate-in fade-in touch-none">
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            <div className="flex flex-col gap-1.5 pointer-events-auto">
              <div className="text-white font-medium flex items-center gap-3 font-sans">
                <span className="text-red-400 text-xs md:text-sm font-mono bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20 shadow-inner">TRASHED</span>
                <span className="truncate text-sm md:text-lg tracking-wide max-w-[200px] md:max-w-md drop-shadow-md line-through text-white/50">{filteredAssets[selectedIndex].filename}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl">
              <button onClick={() => setSelectedIndex(null)} className="p-2 md:p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative p-2 md:p-12 w-full h-full">
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev! > 0 ? prev! - 1 : prev) }} className={`absolute left-2 md:left-8 p-3 md:p-4 rounded-full bg-black/50 border border-white/10 text-white z-50 hover:scale-110 touch-manipulation ${selectedIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
            <img src={filteredAssets[selectedIndex].url} loading="eager" className="max-w-full max-h-full object-contain pointer-events-none select-none grayscale opacity-50" />
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev! < filteredAssets.length - 1 ? prev! + 1 : prev) }} className={`absolute right-2 md:right-8 p-3 md:p-4 rounded-full bg-black/50 border border-white/10 text-white z-50 hover:scale-110 touch-manipulation ${selectedIndex === filteredAssets.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
          </div>
        </div>
      )}
    </div>
  )
}