'use client'

import React, { useState, useEffect } from 'react'
import { Folder as FolderIcon, MoreVertical, Edit2, Link as LinkIcon, Trash2, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Folder = {
  id: string
  name: string
  assetCount: number
}

export default function FolderGrid({ initialFolders }: { initialFolders: Folder[] }) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  useEffect(() => { setFolders(initialFolders) }, [initialFolders])

  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  
  // Menu State
  const [menu, setMenu] = useState<{ id: string, name: string, x: number, y: number } | null>(null)
  
  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [folderToRename, setFolderToRename] = useState<{ id: string, name: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  // 🚀 Premium Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<{ id: string, name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    const handleClick = () => setMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const copyFolderLink = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    navigator.clipboard.writeText(`${window.location.origin}/share/${slug}`)
    setToast("Collection link copied to clipboard")
    setTimeout(() => setToast(null), 3000)
  }

  const handleRename = async () => {
    if (!folderToRename || !newName.trim() || newName === folderToRename.name) {
      setIsRenameModalOpen(false)
      return
    }
    
    setIsRenaming(true)
    try {
      const res = await fetch(`/api/folders/${folderToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      })
      if (res.ok) {
        setFolders(current => current.map(f => f.id === folderToRename.id ? { ...f, name: newName.trim() } : f))
        setIsRenameModalOpen(false)
        setToast("Folder renamed successfully")
        setTimeout(() => setToast(null), 3000)
        router.refresh()
      }
    } catch (error) {
      console.error("Rename failed", error)
    } finally {
      setIsRenaming(false)
    }
  }

  // 🚀 The new Confirm Delete logic
  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return
    setIsDeleting(folderToDelete.id)
    try {
      const res = await fetch(`/api/folders/${folderToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setFolders(current => current.filter(f => f.id !== folderToDelete.id))
        setToast("Folder moved to trash")
        setTimeout(() => setToast(null), 3000)
        setIsDeleteModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Delete failed", error)
    } finally {
      setIsDeleting(null)
      setFolderToDelete(null)
    }
  }

  if (folders.length === 0) {
    return (
      <div className="w-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-[#050505]">
        <p className="text-neutral-500 text-sm">No folders created yet.</p>
      </div>
    )
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <Check className="w-4 h-4 text-green-600" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 relative">
        {folders.map(folder => (
          <div 
            key={folder.id} 
            onClick={() => router.push(`/dashboard/collections/${folder.id}`)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ id: folder.id, name: folder.name, x: e.clientX, y: e.clientY }) }}
            className="group p-3 md:p-5 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-white/10 hover:border-white/30 rounded-xl transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-2.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <FolderIcon className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" fillOpacity={0.1} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenu({ id: folder.id, name: folder.name, x: e.clientX, y: e.clientY }) }}
                className="p-1.5 -mr-2 -mt-1 text-neutral-500 hover:text-white rounded-md hover:bg-white/10 transition-all md:opacity-0 md:group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-medium text-white mb-0.5 md:mb-1 truncate text-sm md:text-base">{folder.name}</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">
              {folder.assetCount} {folder.assetCount === 1 ? 'Asset' : 'Assets'}
            </p>
          </div>
        ))}
      </div>

      {/* ENTERPRISE CONTEXT MENU */}
      {menu && (
        <div 
          className="fixed z-[9999] w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100" 
          style={{ top: Math.min(menu.y, window.innerHeight - 150), left: Math.min(menu.x, window.innerWidth - 200) }} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[9px] font-semibold text-neutral-500 uppercase tracking-widest border-b border-white/5 mb-1 truncate">{menu.name}</div>
          <button 
            onClick={() => { setFolderToRename(menu); setNewName(menu.name); setIsRenameModalOpen(true); setMenu(null); }} 
            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 flex items-center gap-3 touch-manipulation"
          >
            <Edit2 className="w-3.5 h-3.5" /> Rename
          </button>
          <button 
            onClick={() => { copyFolderLink(menu.name); setMenu(null); }} 
            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 flex items-center gap-3 touch-manipulation"
          >
            <LinkIcon className="w-3.5 h-3.5" /> Copy Link
          </button>
          <div className="h-px bg-white/10 my-1 w-full" />
          <button 
            onClick={() => { setFolderToDelete(menu); setIsDeleteModalOpen(true); setMenu(null); }} 
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" /> Move to Trash
          </button>
        </div>
      )}

      {/* RENAME MODAL */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isRenaming && setIsRenameModalOpen(false)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-medium text-white mb-4">Rename Folder</h2>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full bg-[#000000] border border-white/10 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsRenameModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleRename} disabled={isRenaming || !newName.trim()} className="px-5 py-2 text-sm bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isRenaming && <Loader2 className="w-3 h-3 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 PREMIUM DELETE MODAL */}
      {isDeleteModalOpen && folderToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-medium text-white">Delete Collection?</h2>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to move <strong className="text-white">"{folderToDelete.name}"</strong> and all of its high-resolution assets to the trash?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={confirmDeleteFolder} disabled={isDeleting === folderToDelete.id} className="px-5 py-2 text-sm bg-red-500/10 text-red-500 font-medium rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2 border border-red-500/20">
                {isDeleting === folderToDelete.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}