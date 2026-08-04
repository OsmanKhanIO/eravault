'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Enterprise Algorithm: Generate page numbers with ellipses for large datasets
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 w-full">
      {/* PREVIOUS BUTTON */}
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-white/10 bg-[#0a0a0a] text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* PAGE NUMBERS */}
      <div className="flex items-center gap-1 px-2">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return <div key={`ellipsis-${index}`} className="px-2 text-neutral-600"><MoreHorizontal className="w-4 h-4" /></div>
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-md text-xs font-medium transition-all touch-manipulation ${
                currentPage === page 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* NEXT BUTTON */}
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-white/10 bg-[#0a0a0a] text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}