import React from 'react'
import { Image as ImageIcon, MoreVertical } from 'lucide-react'

interface ImageCardProps {
  name: string
  size: string
  date: string
}

export default function ImageCard({ name, size, date }: ImageCardProps) {
  return (
    <div className="group flex flex-col bg-[#050505] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer">
      
      {/* Image Placeholder / Thumbnail Area */}
      <div className="aspect-[4/3] bg-[#0A0A0A] relative flex items-center justify-center overflow-hidden border-b border-white/10 group-hover:bg-[#111] transition-colors">
        <ImageIcon strokeWidth={1} className="w-10 h-10 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Details */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex flex-col min-w-0 pr-4">
          <h4 className="text-sm font-medium text-white truncate mb-1" title={name}>
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>{size}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
        
        <button className="text-neutral-500 hover:text-white transition-colors p-1 -mr-1">
          <MoreVertical strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}