'use client'

import { useState, useRef } from "react"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LogOut, Upload, HardDrive, Menu, X, Folder, Plus, Trash2, Loader2, CheckCircle2, XCircle, Minus, ChevronUp, FileImage } from "lucide-react"

// 🚀 IMPORT THE ASK ERA COMPONENT
import AskEra from "@/components/dashboard/ask-era"

// --- ENTERPRISE UPLOAD TYPES ---
type UploadTask = {
  id: string
  file: File
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  speed: number 
  eta: number 
  totalBytes: number
  uploadedBytes: number
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  
  // Folder creation engine
  const [folderName, setFolderName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()

  // --- ENTERPRISE UPLOAD & TOAST STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([])
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false)
  const [isUploadPanelMinimized, setIsUploadPanelMinimized] = useState(false)
  const uploadMetrics = useRef<Record<string, { lastUpdate: number, lastLoaded: number, speed: number }>>({})
  
  // 🚀 CUSTOM PREMIUM TOAST STATE
  const [toast, setToast] = useState<string | null>(null)

  const BrandLogo = () => (
    <div className="flex items-center gap-3 group cursor-pointer z-50 relative">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/[0.08] transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeOpacity="0.4" />
          <circle cx="8.5" cy="8.5" r="2" fill="currentColor" stroke="none" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-widest text-white uppercase font-sans">
        ERA<span className="text-neutral-500 font-normal">Vault</span>
      </span>
    </div>
  )

  const clerkAppearance = {
    baseTheme: dark,
    variables: { colorBackground: '#050505', colorText: 'white', colorPrimary: 'white', colorInputBackground: '#000000', colorInputText: 'white' },
    elements: {
      avatarBox: "rounded-md w-8 h-8 border border-white/20",
      userButtonPopoverCard: "bg-[#050505] border border-white/10 shadow-2xl rounded-md",
      card: "bg-[#050505] border border-white/10 rounded-md shadow-2xl",
      cardBox: "bg-[#050505]",
      modalContent: "bg-[#050505]",
      modalBackdrop: "bg-black/90 backdrop-blur-md", 
      userProfileCard: "bg-[#050505]",
      navbar: "bg-[#020202] border-r border-white/10",
      formFieldInput: "bg-[#000000] border-white/20 text-white focus:border-white/50",
    }
  }

  const isActive = (path: string) => pathname === path

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return
    try {
      setIsCreating(true)
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName.trim() }),
      })

      if (response.ok) {
        const newFolder = await response.json()
        setFolderName("") 
        setIsNewFolderModalOpen(false) 
        router.push(`/dashboard/collections/${newFolder.id}`) 
      }
    } catch (error) {
      console.error("Failed to create folder", error)
    } finally {
      setIsCreating(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const formatETA = (seconds: number) => {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return 'Calculating...'
    if (seconds < 60) return `${Math.ceil(seconds)}s left`
    return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s left`
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // 🛡️ THE FRONTEND BOUNCER (Now using Custom Toast instead of Alert)
    const validFiles: File[] = []
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        setToast(`Upload Rejected: "${file.name}" is an unsupported format.`)
        setTimeout(() => setToast(null), 4000)
        continue 
      }
      if (file.size > 32 * 1024 * 1024) {
        setToast(`Upload Rejected: "${file.name}" exceeds the 32MB limit.`)
        setTimeout(() => setToast(null), 4000)
        continue 
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const newTasks: UploadTask[] = validFiles.map(file => {
      const id = Math.random().toString(36).substring(7)
      uploadMetrics.current[id] = { lastUpdate: Date.now(), lastLoaded: 0, speed: 0 } 
      return { id, file, filename: file.name, progress: 0, status: 'pending', speed: 0, eta: 0, totalBytes: file.size, uploadedBytes: 0 }
    })

    setUploadTasks(prev => [...prev, ...newTasks])
    setIsUploadPanelOpen(true)
    setIsUploadPanelMinimized(false)

    if (pathname !== '/dashboard/collections') {
      router.push('/dashboard/collections')
    }

    newTasks.forEach(task => uploadFileXHR(task))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFileXHR = (task: UploadTask) => {
    const formData = new FormData()
    formData.append('file', task.file) 

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
      } else {
        setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t))
      }
    }

    xhr.onerror = () => setUploadTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t))
    xhr.send(formData)
  }

  const activeUploads = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'pending').length
  const totalCompleted = uploadTasks.filter(t => t.status === 'success').length
  const isComplete = uploadTasks.length > 0 && activeUploads === 0

  return (
    <div className="relative h-screen bg-[#000000] text-white font-sans flex w-full overflow-hidden selection:bg-white/20">
      
      {/* 🚀 PREMIUM CUSTOM ERROR TOAST */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[99999] bg-[#050505] border border-red-500/30 text-white px-6 py-3 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.25)] flex items-center gap-3 animate-in slide-in-from-top-5 fade-in font-medium text-sm">
          <XCircle className="w-4 h-4 text-red-500" /> {toast}
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none -z-10 flex justify-center overflow-hidden">
        <div className="absolute -top-[20%] w-[800px] h-[600px] bg-white/[0.04] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#020202]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}><BrandLogo /></Link>
            <button className="md:hidden text-neutral-500 p-2" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            <nav className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-3 mb-2">Library</span>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive('/dashboard') ? 'bg-white/10 text-white border border-white/5' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}>
                <HardDrive className="w-4 h-4" /> My Vault
              </Link>
              <Link href="/dashboard/collections" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive('/dashboard/collections') ? 'bg-white/10 text-white border border-white/5' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}>
                <Folder className="w-4 h-4" /> Collections
              </Link>
              <Link href="/dashboard/trash" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive('/dashboard/trash') ? 'bg-white/10 text-white border border-white/5' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}>
                <Trash2 className="w-4 h-4" /> Trash
              </Link>
            </nav>

            <div className="flex flex-col gap-1 border border-white/10 bg-[#050505] p-2 rounded-lg">
              <button 
                onClick={() => { setIsNewFolderModalOpen(true); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-md w-full transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-neutral-400" /> New Folder
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); fileInputRef.current?.click(); }} 
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] rounded-md border border-white/5 transition-colors text-left"
              >
                <Upload className="w-4 h-4" /> Upload Image
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && processFiles(e.target.files)} className="hidden" multiple accept="image/*" />
            </div>
          </div>
          
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-white mt-auto">
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>

        <div className="p-6 border-t border-white/10 flex flex-col gap-6 bg-[#020202]/80">
          <div className="flex items-center gap-3"><UserButton appearance={clerkAppearance} /> <span className="text-sm">My Account</span></div>
          <SignOutButton><button className="flex items-center gap-3 px-4 py-3 w-full border border-white/10 bg-[#050505] text-sm text-neutral-400 hover:text-white rounded-md transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button></SignOutButton>
        </div>
      </aside>

      <main className="relative flex-1 w-full min-w-0 h-full overflow-y-auto">
        <div className="md:hidden p-4 border-b border-white/10 bg-[#020202]/50 flex justify-between items-center backdrop-blur-md sticky top-0 z-30">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-neutral-400"><Menu className="w-6 h-6" /></button>
           <UserButton appearance={clerkAppearance} />
        </div>
        {children}
      </main>

      {/* INTERACTIVE NEW FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => !isCreating && setIsNewFolderModalOpen(false)} 
          />
          <div className="relative bg-[#050505] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 transform animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-medium text-white">Create New Folder</h2>
              <p className="text-sm text-neutral-500 mt-1">Organize your high-resolution assets.</p>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="e.g., Master Brand Deliverables" 
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }}
                disabled={isCreating}
                className="w-full bg-[#000000] border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsNewFolderModalOpen(false)} 
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder} 
                disabled={!folderName.trim() || isCreating}
                className="px-5 py-2 text-sm font-medium bg-white text-black rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE UPLOAD QUEUE PANEL */}
      {isUploadPanelOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[340px] md:w-[400px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-[#111] border-b border-white/10 px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsUploadPanelMinimized(!isUploadPanelMinimized)}>
            <div className="flex items-center gap-3">
              {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Loader2 className="w-5 h-5 text-white animate-spin" />}
              <span className="text-sm font-medium text-white">
                {isComplete ? `${totalCompleted} uploads complete` : `Uploading ${activeUploads} item${activeUploads > 1 ? 's' : ''}...`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors touch-manipulation">
                {isUploadPanelMinimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsUploadPanelOpen(false); setUploadTasks([]); }} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors touch-manipulation">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {!isUploadPanelMinimized && (
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
              {uploadTasks.map(task => (
                <div key={task.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#151515] border border-white/10 flex items-center justify-center shrink-0">
                    <FileImage className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-medium text-white truncate pr-2">{task.filename}</p>
                      {task.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      {task.status === 'error' && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      {task.status === 'uploading' && <span className="text-[10px] text-neutral-400 font-mono shrink-0">{Math.round(task.progress)}%</span>}
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full transition-all duration-300 ${task.status === 'error' ? 'bg-red-500' : task.status === 'success' ? 'bg-green-500' : 'bg-white'}`} style={{ width: `${task.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500">{formatBytes(task.uploadedBytes)} / {formatBytes(task.totalBytes)}</span>
                      {task.status === 'uploading' && task.progress > 0 && <span className="text-[10px] text-neutral-400 font-mono">{formatETA(task.eta)} • {formatBytes(task.speed)}/s</span>}
                      {task.status === 'pending' && <span className="text-[10px] text-neutral-500">Queued...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🚀 THE ASK ERA FLOATING WIDGET */}
      <AskEra />

    </div>
  )
}