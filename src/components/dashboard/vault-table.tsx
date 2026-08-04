'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Copy, Check, Trash, FolderInput, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronUp, UploadCloud, Link as LinkIcon, Download, Loader2, Search, Import, MoreVertical, FileImage, CheckCircle2, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/ui/pagination'

type Asset = { 
  id: string, 
  filename: string, 
  url: string, 
  format: string, 
  bytes: number, 
  createdAt: Date, 
  folderId?: string | null,
  tags?: string[],
  colorHex?: string
}
type Folder = { id: string, name: string }

type UploadTask = { id: string, file: File, filename: string, progress: number, status: 'pending' | 'uploading' | 'success' | 'error', speed: number, eta: number, totalBytes: number, uploadedBytes: number }

export default function VaultTable({ initialAssets, folders = [], currentFolderId = null, folderId = null }: { initialAssets: Asset[], folders?: Folder[], currentFolderId?: string | null, folderId?: string | null }) {
  
  const activeFolderId = currentFolderId || folderId

  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  useEffect(() => { setAssets(initialAssets) }, [initialAssets])

  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredAssets = assets.filter(a => {
    const query = searchQuery.toLowerCase()
    const matchesName = a.filename.toLowerCase().includes(query)
    const matchesTags = a.tags ? a.tags.some(tag => tag.toLowerCase().includes(query)) : false
    return matchesName || matchesTags
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Menus & Modals
  const [imageMenu, setImageMenu] = useState<{ id: string, x: number, y: number } | null>(null)
  const [workspaceMenu, setWorkspaceMenu] = useState<{ x: number, y: number } | null>(null)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'bulk' } | null>(null)

  const [rootAssets, setRootAssets] = useState<Asset[]>([])
  const [importSelectedIds, setImportSelectedIds] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([])
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false)
  const [isUploadPanelMinimized, setIsUploadPanelMinimized] = useState(false)
  const uploadMetrics = useRef<Record<string, { lastUpdate: number, lastLoaded: number, speed: number }>>({})

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const formatETA = (seconds: number) => {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return 'Calculating...'
    if (seconds < 60) return `${Math.ceil(seconds)}s left`
    const minutes = Math.floor(seconds / 60)
    const sec = Math.ceil(seconds % 60)
    return `${minutes}m ${sec}s left`
  }

  // 🚀 HARDENED EVENT PREVENTION
  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    }
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.has(id) ? newSet.delete(id) : newSet.add(id)
      return newSet
    })
  }

  const handleAssetClick = (id: string) => {
    if (selectedIds.size > 0) {
      toggleSelection(id)
    } else {
      setSelectedIndex(filteredAssets.findIndex(a => a.id === id))
    }
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // 🛡️ THE FRONTEND BOUNCER
    const validFiles: File[] = []
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        setToast(`Rejected: "${file.name}" is a video/unsupported format.`)
        setTimeout(() => setToast(null), 4000)
        continue // Skip this file and check the next one
      }
      if (file.size > 32 * 1024 * 1024) {
        setToast(`Rejected: "${file.name}" is over the 32MB limit.`)
        setTimeout(() => setToast(null), 4000)
        continue // Skip this file
      }
      validFiles.push(file)
    }

    // If all files were rejected, stop the process completely
    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Process only the files that passed security
    const newTasks: UploadTask[] = validFiles.map(file => {
      const id = Math.random().toString(36).substring(7)
      uploadMetrics.current[id] = { lastUpdate: Date.now(), lastLoaded: 0, speed: 0 } 
      return { id, file, filename: file.name, progress: 0, status: 'pending', speed: 0, eta: 0, totalBytes: file.size, uploadedBytes: 0 }
    })
    
    setUploadTasks(prev => [...prev, ...newTasks])
    setIsUploadPanelOpen(true)
    setIsUploadPanelMinimized(false)
    newTasks.forEach(task => uploadFileXHR(task))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFileXHR = (task: UploadTask) => {
    const formData = new FormData()
    formData.append('file', task.file)
    if (activeFolderId) formData.append('folderId', activeFolderId)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload', true)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const now = Date.now()
        const metrics = uploadMetrics.current[task.id]
        const timeDiff = (now - metrics.lastUpdate) / 1000 
        if (timeDiff > 0.25 || e.loaded === e.total) {
          const bytesDiff = e.loaded - metrics.lastLoaded
          const currentSpeed = timeDiff > 0 ? bytesDiff / timeDiff : 0
          metrics.speed = metrics.speed === 0 ? currentSpeed : (metrics.speed * 0.8 + currentSpeed * 0.2)
          metrics.lastUpdate = now
          metrics.lastLoaded = e.loaded
          const eta = metrics.speed > 0 ? (e.total - e.loaded) / metrics.speed : 0
          setUploadTasks(prev => prev.map(t => t.id === task.id ? {
            ...t, progress: (e.loaded / e.total) * 100, status: 'uploading', speed: metrics.speed, eta: eta, uploadedBytes: e.loaded
          } : t))
        }
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 100, status: 'success', eta: 0 } : t))
        router.refresh() 
      } else { setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t)) }
    }
    xhr.onerror = () => setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t))
    xhr.send(formData)
  }

  const activeUploads = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'pending').length
  const totalCompleted = uploadTasks.filter(t => t.status === 'success').length
  const isComplete = uploadTasks.length > 0 && activeUploads === 0

  const copyAssetLink = (id: string, filename: string) => {
    const slug = filename.split('.')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-')
    navigator.clipboard.writeText(`${window.location.origin}/share/a/${id}/${slug}`)
    setToast("Premium link copied to clipboard")
    setTimeout(() => setToast(null), 3000)
  }

  const confirmDelete = async () => {
    if (!deleteTarget || isProcessing) return
    setIsProcessing(true)
    try {
      if (deleteTarget.type === 'single') {
        const res = await fetch(`/api/assets/${deleteTarget.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) })
        if (res.ok) {
          setAssets(current => current.filter(a => a.id !== deleteTarget.id))
          setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(deleteTarget.id); return newSet; })
          setToast("Asset moved to trash")
        }
      } else if (deleteTarget.type === 'bulk') {
        // 🚀 BULK ACTION FIX: Relies purely on mapping individual PATCH requests which guarantees it works
        await Promise.all(Array.from(selectedIds).map(id => 
          fetch(`/api/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) })
        ))
        setAssets(current => current.filter(a => !selectedIds.has(a.id)))
        setSelectedIds(new Set())
        setToast(`${selectedIds.size} items moved to trash`)
      }
      setTimeout(() => setToast(null), 3000)
      setDeleteTarget(null)
      router.refresh()
    } catch (error) { console.error("Trash failed", error) } finally { setIsProcessing(false) }
  }

  const handleBulkMove = async (targetFolderId: string | null) => {
    if (selectedIds.size === 0 || isProcessing) return
    setIsProcessing(true)
    try {
      // 🚀 BULK ACTION FIX: Relies purely on mapping individual PATCH requests without needing a bulk API route
      await Promise.all(Array.from(selectedIds).map(id => 
        fetch(`/api/assets/${id}`, { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ folderId: targetFolderId }) 
        })
      ))
      
      // If we move it out of the current view, filter it instantly from UI
      if (activeFolderId !== targetFolderId) {
        setAssets(current => current.filter(a => !selectedIds.has(a.id)))
      }
      
      setSelectedIds(new Set())
      setIsMoveModalOpen(false)
      setToast("Assets moved successfully")
      setTimeout(() => setToast(null), 3000)
      router.refresh()
    } catch (error) { console.error("Move failed", error) } finally { setIsProcessing(false) }
  }

  const openImportHub = async () => {
    setWorkspaceMenu(null); setIsImportModalOpen(true)
    const res = await fetch('/api/assets/root')
    if (res.ok) setRootAssets(await res.json())
  }

  const handleImport = async () => {
    if (importSelectedIds.size === 0 || !activeFolderId) return
    setIsProcessing(true)
    try {
      await Promise.all(Array.from(importSelectedIds).map(id => 
        fetch(`/api/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderId: activeFolderId }) })
      ))
      setIsImportModalOpen(false); setImportSelectedIds(new Set()); setToast(`Imported ${importSelectedIds.size} assets`); setTimeout(() => setToast(null), 3000); router.refresh()
    } catch (error) { console.error("Import failed", error) } finally { setIsProcessing(false) }
  }

  // 🚀 FIXED: Hardened context menu open logic
  const openImageMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation() // Stops global native click from instantly closing it
    
    const x = Math.min(e.clientX, window.innerWidth - 200)
    const y = Math.min(e.clientY, window.innerHeight - 250)
    setImageMenu({ id, x, y })
  }

  useEffect(() => {
    const handleClick = () => { setImageMenu(null); setWorkspaceMenu(null) }
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
    <div 
      className="relative min-h-[500px] w-full pb-32"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) processFiles(e.dataTransfer.files) }}
      onContextMenu={(e) => { e.preventDefault(); setImageMenu(null); setWorkspaceMenu({ x: e.clientX, y: e.clientY }) }}
    >
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <Check className="w-4 h-4 text-green-600" /> {toast}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessing && setDeleteTarget(null)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <Trash className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-medium text-white">
                {deleteTarget.type === 'bulk' ? `Delete ${selectedIds.size} items?` : 'Delete Asset?'}
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to move {deleteTarget.type === 'bulk' ? 'these items' : 'this asset'} to the trash?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(null); }} disabled={isProcessing} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={(e) => { e.stopPropagation(); confirmDelete(); }} disabled={isProcessing} className="px-5 py-2 text-sm bg-red-500/10 text-red-500 font-medium rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2 border border-red-500/20">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />} Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadPanelOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[340px] md:w-[400px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-[#111] border-b border-white/10 px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsUploadPanelMinimized(!isUploadPanelMinimized)}>
            <div className="flex items-center gap-3">
              {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Loader2 className="w-5 h-5 text-white animate-spin" />}
              <span className="text-sm font-medium text-white">{isComplete ? `${totalCompleted} uploads complete` : `Uploading ${activeUploads} item${activeUploads > 1 ? 's' : ''}...`}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors touch-manipulation"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setIsUploadPanelOpen(false); setUploadTasks([]); }} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors touch-manipulation"><X className="w-4 h-4" /></button>
            </div>
          </div>
          {!isUploadPanelMinimized && (
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
              {uploadTasks.map(task => (
                <div key={task.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#151515] border border-white/10 flex items-center justify-center shrink-0"><FileImage className="w-4 h-4 text-neutral-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-medium text-white truncate pr-2">{task.filename}</p>
                      {task.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      {task.status === 'uploading' && <span className="text-[10px] text-neutral-400 font-mono shrink-0">{Math.round(task.progress)}%</span>}
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5"><div className={`h-full transition-all duration-300 ${task.status === 'success' ? 'bg-green-500' : 'bg-white'}`} style={{ width: `${task.progress}%` }} /></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500">{formatBytes(task.uploadedBytes)} / {formatBytes(task.totalBytes)}</span>
                      {task.status === 'uploading' && task.progress > 0 && <span className="text-[10px] text-neutral-400 font-mono">{formatETA(task.eta)} • {formatBytes(task.speed)}/s</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && processFiles(e.target.files)} className="hidden" multiple accept="image/*" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-0 z-20 bg-[#000000]/90 backdrop-blur-xl py-3 border-b border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search filenames or AI tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors" />
        </div>
        
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium text-xs rounded-md hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 touch-manipulation">
              <UploadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Upload Files</span>
            </button>
            {activeFolderId && (
              <button onClick={openImportHub} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs rounded-md transition-colors active:scale-95 touch-manipulation">
                <Import className="w-4 h-4" /> <span className="hidden sm:inline">Import</span>
              </button>
            )}
          </div>
          <div className="w-px h-6 bg-white/10 hidden md:block mx-1" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs text-neutral-500 font-medium hidden sm:block">
              {paginatedAssets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
            </span>
            <div className="flex items-center bg-[#050505] border border-white/10 rounded-md p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition-colors touch-manipulation ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-colors touch-manipulation ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-16 border border-dashed border-white/10 rounded-xl bg-[#020202] mt-8 text-center">
          <div className="p-5 bg-white/5 rounded-full mb-5"><UploadCloud className="w-8 h-8 text-neutral-400" /></div>
          <h3 className="text-lg font-medium text-white mb-2">{searchQuery ? 'No results found' : 'This workspace is empty'}</h3>
          <p className="text-neutral-500 text-sm mb-6">{searchQuery ? 'Try searching a different tag or actor.' : 'Tap the Upload button or drag and drop your media here.'}</p>
          {!searchQuery && <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-black font-medium text-sm rounded-md hover:bg-neutral-200 transition-colors">Browse Files</button>}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {paginatedAssets.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div 
                    key={asset.id} 
                    onClick={() => handleAssetClick(asset.id)} 
                    onContextMenu={(e) => openImageMenu(e, asset.id)} 
                    className={`group relative aspect-square bg-[#050505] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform-gpu ${
                      isSelected 
                        ? 'ring-2 ring-white scale-[0.94] shadow-[0_0_40px_rgba(255,255,255,0.15)]' 
                        : 'border border-white/10 hover:border-white/30 hover:scale-[0.98]'
                    }`}
                  >
                    <img src={asset.url} alt={asset.filename} loading="lazy" decoding="async" className={`w-full h-full object-cover transition-transform duration-700 bg-[#0a0a0a] ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                    
                    <div 
                      onClick={(e) => toggleSelection(asset.id, e)}
                      className={`absolute top-2 left-2 md:top-3 md:left-3 z-50 flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 touch-manipulation ${
                        isSelected 
                          ? 'bg-white border-white text-black scale-100 opacity-100' 
                          : 'bg-black/40 border-white/40 text-transparent opacity-0 group-hover:opacity-100 backdrop-blur-md hover:bg-white/20'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-50'}`} strokeWidth={3} />
                    </div>

                    {/* 🚀 FIXED: z-50 overlay hierarchy guarantees this gets clicked over the image on mobile */}
                    <button 
                      onClick={(e) => openImageMenu(e, asset.id)} 
                      className="absolute top-2 right-2 z-50 p-1.5 md:opacity-0 md:group-hover:opacity-100 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-white/80 hover:text-white transition-all touch-manipulation shadow-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
                      <span className="text-xs text-white truncate font-medium drop-shadow-md mb-1">{asset.filename}</span>
                      {asset.tags && asset.tags.length > 0 && (
                        <span className="text-[9px] text-white/60 truncate font-mono">{asset.tags[0]}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-white/10 bg-[#050505] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0A0A0A] border-b border-white/10">
                    <tr>
                      <th className="w-12 px-4 py-3"></th>
                      <th className="px-4 py-3 text-neutral-500 font-medium">Name & Tags</th>
                      <th className="px-4 py-3 text-neutral-500 font-medium">Size</th>
                      <th className="px-4 py-3 text-neutral-500 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedAssets.map((asset) => {
                      const isSelected = selectedIds.has(asset.id);
                      return (
                        <tr 
                          key={asset.id} 
                          onClick={() => handleAssetClick(asset.id)} 
                          className={`cursor-pointer group transition-colors ${isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                        >
                          <td className="px-4 py-4" onClick={(e) => toggleSelection(asset.id, e)}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors z-50 ${isSelected ? 'bg-white border-white text-black' : 'border-white/30 bg-black/50 text-transparent group-hover:border-white/50'}`}>
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img src={asset.url} loading="lazy" decoding="async" className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-white/10 object-cover" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-white font-medium truncate">{asset.filename}</span>
                                {asset.tags && asset.tags.length > 0 && (
                                  <span className="text-[10px] text-neutral-500 truncate max-w-[200px] mt-0.5">{asset.tags.slice(0, 3).join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-neutral-400 font-mono text-xs">{formatBytes(asset.bytes)}</td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={(e) => openImageMenu(e, asset.id)} className="relative z-50 p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-md transition-colors touch-manipulation">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* 🚀 FIXED: Added z-[999] so the bulk action bar sits completely above all grid items */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-4 md:gap-6 animate-in slide-in-from-bottom-10 fade-in w-[90%] md:w-auto overflow-x-auto">
          <span className="text-xs md:text-sm font-medium text-white bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20 flex-shrink-0" />
          <button onClick={(e) => { e.stopPropagation(); setIsMoveModalOpen(true); }} className="text-xs md:text-sm text-neutral-300 hover:text-white flex items-center gap-2 transition-colors whitespace-nowrap touch-manipulation">
            <FolderInput className="w-4 h-4" /> <span className="hidden md:inline">Move</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'bulk' }); }} className="text-xs md:text-sm text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors whitespace-nowrap touch-manipulation">
            <Trash className="w-4 h-4" /> <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      )}

      {isMoveModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMoveModalOpen(false)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-t-xl md:rounded-xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-10 md:zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-medium text-white">Move {selectedIds.size > 0 ? selectedIds.size : 1} item(s) to...</h2>
              <button onClick={() => setIsMoveModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-md"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
              <button onClick={() => handleBulkMove(null)} disabled={isProcessing} className="w-full text-left p-3.5 rounded-lg border border-white/5 bg-[#0a0a0a] hover:bg-white/10 text-white text-sm transition-all flex items-center gap-3 touch-manipulation">
                <LayoutGrid className="w-4 h-4 text-neutral-400" /> Main Vault (Root)
              </button>
              {folders.map(folder => (
                <button key={folder.id} onClick={() => handleBulkMove(folder.id)} disabled={isProcessing || folder.id === activeFolderId} className="w-full text-left p-3.5 rounded-lg border border-white/5 bg-[#0a0a0a] hover:bg-white/10 text-white text-sm transition-all flex items-center justify-between touch-manipulation">
                  <div className="flex items-center gap-3">
                    <FolderInput className="w-4 h-4 text-neutral-400" /> {folder.name}
                  </div>
                  {folder.id === activeFolderId && <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SINGLE IMAGE CONTEXT MENU */}
      {imageMenu && (
        <div className="fixed z-[9999] w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 animate-in zoom-in-95 duration-100" style={{ top: imageMenu.y, left: imageMenu.x }} onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(filteredAssets.findIndex(a => a.id === imageMenu.id)); setImageMenu(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm text-white hover:bg-white/10 flex items-center gap-3"><LayoutGrid className="w-4 h-4 md:w-3.5 md:h-3.5" /> Preview</button>
          <button onClick={(e) => { e.stopPropagation(); const asset = filteredAssets.find(a => a.id === imageMenu.id); if(asset) copyAssetLink(asset.id, asset.filename); setImageMenu(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm text-white hover:bg-white/10 flex items-center gap-3"><LinkIcon className="w-4 h-4 md:w-3.5 md:h-3.5" /> Copy Link</button>
          
          <button onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([imageMenu.id])); setIsMoveModalOpen(true); setImageMenu(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm text-white hover:bg-white/10 flex items-center gap-3"><FolderInput className="w-4 h-4 md:w-3.5 md:h-3.5" /> Move...</button>
          <div className="h-px bg-white/10 my-1 w-full" />
          
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'single', id: imageMenu.id }); setImageMenu(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3">
            <Trash className="w-4 h-4 md:w-3.5 md:h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* IMPORT FROM ROOT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] bg-[#050505] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-[#020202]">
              <div>
                <h2 className="text-lg md:text-xl font-medium text-white">Import from Vault</h2>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">Select assets to pull into this collection.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-neutral-500 hover:text-white touch-manipulation"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {rootAssets.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-sm">Your main vault is empty.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                  {rootAssets.map(asset => (
                    <div key={asset.id} onClick={() => { const newSet = new Set(importSelectedIds); newSet.has(asset.id) ? newSet.delete(asset.id) : newSet.add(asset.id); setImportSelectedIds(newSet); }} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all touch-manipulation ${importSelectedIds.has(asset.id) ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={asset.url} loading="lazy" decoding="async" className="w-full h-full object-cover bg-[#0a0a0a]" />
                      {importSelectedIds.has(asset.id) && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Check className="w-8 h-8 text-white drop-shadow-md" /></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 border-t border-white/10 bg-[#020202] flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-400">{importSelectedIds.size} selected</span>
              <button onClick={handleImport} disabled={importSelectedIds.size === 0 || isProcessing} className="px-6 py-3 bg-white text-black font-medium text-sm rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2 touch-manipulation shadow-lg">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Import className="w-4 h-4" />} Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE LIGHTBOX */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[120] flex bg-black/98 backdrop-blur-xl animate-in fade-in duration-200 touch-none">
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            
            <div className="flex flex-col gap-2 pointer-events-auto max-w-[60%]">
              <div className="text-white font-medium flex items-center gap-3 font-sans">
                <span className="text-white/70 text-xs md:text-sm font-mono bg-white/10 px-2 py-1 rounded-md border border-white/10 shadow-inner">
                  {selectedIndex + 1} / {filteredAssets.length}
                </span>
                <span className="truncate text-sm md:text-lg tracking-wide drop-shadow-md">
                  {filteredAssets[selectedIndex].filename}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1">
                <span className="text-[10px] md:text-xs text-neutral-400 font-mono bg-[#111] px-2 py-0.5 rounded border border-white/5">{formatBytes(filteredAssets[selectedIndex].bytes)}</span>
                <span className="text-[10px] md:text-xs text-neutral-400 font-mono bg-[#111] px-2 py-0.5 rounded border border-white/5 uppercase">{filteredAssets[selectedIndex].format.split('/')[1] || 'IMAGE'}</span>
                
                {filteredAssets[selectedIndex].tags?.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] md:text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl">
              <button onClick={() => { copyAssetLink(filteredAssets[selectedIndex].id, filteredAssets[selectedIndex].filename); setSelectedIndex(null); }} className="p-2 md:p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Copy Premium Link">
                <LinkIcon className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <a href={filteredAssets[selectedIndex].url} target="_blank" download className="p-2 md:p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Download Master Asset">
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button onClick={() => setSelectedIndex(null)} className="p-2 md:p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative p-2 md:p-12 w-full h-full">
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev! > 0 ? prev! - 1 : prev) }} className={`absolute left-2 md:left-8 p-3 md:p-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all z-50 touch-manipulation hover:scale-110 ${selectedIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
            <img src={filteredAssets[selectedIndex].url} loading="eager" decoding="async" className="max-w-full max-h-full object-contain pointer-events-none select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev! < filteredAssets.length - 1 ? prev! + 1 : prev) }} className={`absolute right-2 md:right-8 p-3 md:p-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all z-50 touch-manipulation hover:scale-110 ${selectedIndex === filteredAssets.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
          </div>
        </div>
      )}
    </div>
  )
}