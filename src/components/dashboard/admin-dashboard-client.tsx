'use client'

import React, { useState, useMemo } from 'react'
import { Search, Loader2, Trash2, Eye, ShieldX, Clock, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, LayoutGrid } from 'lucide-react'

type SanitizedAsset = {
  id: string
  filename: string
  originalName: string
  url: string
  format: string
  bytes: number
  tags: string[]
  colorHex: string
  isDeleted: boolean
  createdAt: string
  user: { name: string; email: string; avatar?: string }
}

export default function AdminDashboardClient({ assets: initialAssets }: { assets: SanitizedAsset[] }) {
  const [assets, setAssets] = useState<SanitizedAsset[]>(initialAssets)
  const [search, setSearchQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  
  // Sorting Engine
  const [sortField, setSortField] = useState<'createdAt' | 'bytes'>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // 🚀 Premium UI States (Select, Modal, Processing)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'bulk' } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const formatAuditTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // 🚀 THE CUSTOM NUKE ENGINE (Replaces window.confirm)
  const confirmNuke = async () => {
    if (!deleteTarget || isProcessing) return
    setIsProcessing(true)
    
    try {
      if (deleteTarget.type === 'single') {
        const res = await fetch(`/api/assets/${deleteTarget.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) })
        if (res.ok) {
          setAssets(current => current.map(a => a.id === deleteTarget.id ? { ...a, isDeleted: true } : a))
          setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(deleteTarget.id); return newSet; })
          setToast("Asset forcibly trashed")
        }
      } else if (deleteTarget.type === 'bulk') {
        await Promise.all(Array.from(selectedIds).map(id => 
          fetch(`/api/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) })
        ))
        setAssets(current => current.map(a => selectedIds.has(a.id) ? { ...a, isDeleted: true } : a))
        setSelectedIds(new Set())
        setToast(`Forcibly trashed ${selectedIds.size} assets`)
      }
      setTimeout(() => setToast(null), 3000)
    } catch (err) { 
      console.error("Nuke sequence execution failed", err) 
    } finally {
      setIsProcessing(false)
      setDeleteTarget(null)
    }
  }

  const formatsPresent = useMemo(() => {
    const formats = new Set<string>()
    assets.forEach(a => formats.add(a.format.toUpperCase()))
    return Array.from(formats)
  }, [assets])

  const toggleSort = (field: 'createdAt' | 'bytes') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedAssets.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedAssets.map(a => a.id)))
    }
  }

  const processedAssets = useMemo(() => {
    let output = assets.filter(asset => {
      const targetQuery = search.toLowerCase()
      const matchesSearch = 
        asset.filename.toLowerCase().includes(targetQuery) ||
        asset.user.name.toLowerCase().includes(targetQuery) ||
        asset.user.email.toLowerCase().includes(targetQuery) ||
        asset.tags.some(t => t.toLowerCase().includes(targetQuery))
      
      const matchesFormat = formatFilter === 'ALL' || asset.format.toUpperCase() === formatFilter
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'TRASHED' && asset.isDeleted) || 
        (statusFilter === 'ACTIVE' && !asset.isDeleted)

      return matchesSearch && matchesFormat && matchesStatus
    })

    output.sort((x, y) => {
      let valX = sortField === 'createdAt' ? new Date(x.createdAt).getTime() : x.bytes
      let valY = sortField === 'createdAt' ? new Date(y.createdAt).getTime() : y.bytes
      return sortDirection === 'asc' ? valX - valY : valY - valX
    })

    return output
  }, [assets, search, formatFilter, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(processedAssets.length / itemsPerPage)
  const paginatedAssets = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return processedAssets.slice(startIdx, startIdx + itemsPerPage)
  }, [processedAssets, currentPage])

  return (
    <div className="space-y-6 relative pb-24">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in font-medium text-sm">
          <ShieldX className="w-4 h-4 text-red-600" /> {toast}
        </div>
      )}

      {/* 🚀 PREMIUM ADMIN NUKE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessing && setDeleteTarget(null)} />
          <div className="relative bg-[#050505] border border-red-500/30 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.15)] w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-medium text-white">
                {deleteTarget.type === 'bulk' ? `Nuke ${selectedIds.size} assets?` : 'Nuke Asset?'}
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              You are about to forcibly execute a soft-delete on {deleteTarget.type === 'bulk' ? 'these user assets' : 'this user asset'}. It will be moved to the Trash pipeline immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isProcessing} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={confirmNuke} disabled={isProcessing} className="px-5 py-2 text-sm bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />} Execute Nuke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 bg-[#020202] p-4 border border-white/10 rounded-xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search filenames, tags, emails..." 
            value={search}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#050505] border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-all font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={formatFilter} 
            onChange={(e) => { setFormatFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-neutral-300 font-medium focus:outline-none focus:border-white/30 uppercase tracking-wider"
          >
            <option value="ALL">All Formats</option>
            {formatsPresent.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-neutral-300 font-medium focus:outline-none focus:border-white/30 uppercase tracking-wider"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active in Vault</option>
            <option value="TRASHED">Flagged in Trash</option>
          </select>
        </div>
      </div>

      {/* Main Stream Table (Mobile Optimized via overflow-x-auto) */}
      <div className="border border-white/10 bg-[#050505] rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto touch-pan-x w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0A0A0A] border-b border-white/10">
              <tr>
                {/* Checkbox Header */}
                <th className="w-12 px-4 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={paginatedAssets.length > 0 && selectedIds.size === paginatedAssets.length} 
                    onChange={toggleSelectAll} 
                    className="w-4 h-4 rounded border-white/20 bg-black cursor-pointer focus:ring-0" 
                  />
                </th>
                <th className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Asset Identity</th>
                <th className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">AI Taxonomy</th>
                <th className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Tenant</th>
                
                <th 
                  className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white select-none transition-colors hidden sm:table-cell"
                  onClick={() => toggleSort('bytes')}
                >
                  <div className="flex items-center gap-1.5">
                    Size
                    {sortField === 'bytes' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-neutral-600" />}
                  </div>
                </th>

                <th 
                  className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white select-none transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <div className="flex items-center gap-1.5">
                    Date
                    {sortField === 'createdAt' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-neutral-600" />}
                  </div>
                </th>

                <th className="px-4 py-4 text-neutral-500 font-medium text-xs uppercase tracking-wider text-right sticky right-0 bg-[#0A0A0A] md:static">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {paginatedAssets.map((asset) => (
                <tr 
                  key={asset.id} 
                  onClick={() => {
                    const newSet = new Set(selectedIds)
                    newSet.has(asset.id) ? newSet.delete(asset.id) : newSet.add(asset.id)
                    setSelectedIds(newSet)
                  }}
                  className={`hover:bg-white/[0.02] cursor-pointer transition-colors group ${asset.isDeleted ? 'bg-red-500/[0.02]' : ''} ${selectedIds.has(asset.id) ? 'bg-white/[0.05]' : ''}`}
                >
                  {/* Select Box */}
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(asset.id)} 
                      onChange={() => {
                        const newSet = new Set(selectedIds)
                        newSet.has(asset.id) ? newSet.delete(asset.id) : newSet.add(asset.id)
                        setSelectedIds(newSet)
                      }} 
                      className="w-4 h-4 rounded border-white/20 bg-black cursor-pointer focus:ring-0" 
                    />
                  </td>

                  {/* Asset Preview */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shadow-inner">
                        <img src={asset.url} className={`w-full h-full object-cover transition-transform ${asset.isDeleted ? 'grayscale blur-[1px]' : ''}`} />
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] md:h-[3px]" style={{ backgroundColor: asset.colorHex }} />
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                        <span className="text-white font-medium text-sm truncate">{asset.filename}</span>
                        <span className="text-[10px] text-neutral-500 font-mono truncate hidden sm:block">Orig: {asset.originalName}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Taxonomy Tags (Hidden on mobile) */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[200px] lg:max-w-sm">
                      {asset.tags && asset.tags.length > 0 ? (
                        asset.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-white/[0.04] border border-white/5 rounded text-[9px] text-neutral-300 font-medium">{tag}</span>
                        ))
                      ) : (
                        <span className="text-neutral-600 text-[10px] italic">Unclassified</span>
                      )}
                    </div>
                  </td>

                  {/* Tenant Identity */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      {asset.user.avatar ? (
                        <img src={asset.user.avatar} className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/10" />
                      ) : (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">?</div>
                      )}
                      <div className="flex flex-col min-w-0 max-w-[100px] md:max-w-[150px]">
                        <span className="text-xs text-neutral-200 font-medium truncate">{asset.user.name}</span>
                        <span className="text-[9px] text-neutral-500 font-mono truncate">{asset.user.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Size (Hidden on extra small) */}
                  <td className="px-4 py-4 font-mono text-[11px] text-neutral-300 hidden sm:table-cell">
                    {formatBytes(asset.bytes)}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 text-[10px] md:text-xs font-mono text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-600 hidden sm:block" />
                      <span>{formatAuditTime(asset.createdAt).split(',')[0]}</span>
                    </div>
                  </td>

                  {/* Mobile Sticky Action Column */}
                  <td className="px-4 py-4 text-right sticky right-0 bg-[#0A0A0A]/90 backdrop-blur-md md:static md:bg-transparent" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <a href={asset.url} target="_blank" rel="noreferrer" className="p-1.5 md:p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors" title="Inspect Master">
                        <Eye className="w-4 h-4" />
                      </a>
                      
                      {asset.isDeleted ? (
                        <span className="px-1.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px] font-mono font-semibold uppercase tracking-wider">Trashed</span>
                      ) : (
                        <button 
                          onClick={() => setDeleteTarget({ type: 'single', id: asset.id })}
                          className="p-1.5 md:p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination */}
        {totalPages > 1 && (
          <div className="bg-[#0A0A0A] px-4 md:px-6 py-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
            <span className="text-neutral-500 text-center md:text-left">
              Page <strong className="text-neutral-300">{currentPage}</strong> of <strong className="text-neutral-300">{totalPages}</strong>
            </span>
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-white/10 bg-black rounded hover:bg-white/5 text-neutral-300 disabled:opacity-30">Prev</button>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-white/10 bg-black rounded hover:bg-white/5 text-neutral-300 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-4 md:gap-6 animate-in slide-in-from-bottom-10 fade-in w-[90%] md:w-auto overflow-x-auto">
          <span className="text-xs md:text-sm font-medium text-white bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
            {selectedIds.size} {selectedIds.size === 1 ? 'asset' : 'assets'}
          </span>
          <div className="h-4 w-px bg-white/20 flex-shrink-0" />
          <button 
            onClick={() => setDeleteTarget({ type: 'bulk' })} 
            className="text-xs md:text-sm text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors whitespace-nowrap touch-manipulation"
          >
            <ShieldX className="w-4 h-4" /> <span className="hidden md:inline">Force Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}