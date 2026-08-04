'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

type UploadFile = {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

export default function UploadDropzone() {
  const [uploads, setUploads] = useState<UploadFile[]>([])
  
  // 🚀 CUSTOM PREMIUM TOAST STATE
  const [toast, setToast] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    
    // 🛡️ THE FRONTEND BOUNCER (Now using Custom Toast)
    const validFiles: File[] = []
    for (const file of acceptedFiles) {
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

    if (validFiles.length === 0) return 

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    
    setUploads(prev => [...prev, ...newFiles])

    // Process real uploads
    newFiles.forEach(fileObj => {
      const formData = new FormData()
      formData.append('file', fileObj.file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload', true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploads(current => 
            current.map(f => f.id === fileObj.id ? { ...f, progress } : f)
          )
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploads(current => 
            current.map(f => f.id === fileObj.id ? { ...f, progress: 100, status: 'completed' } : f)
          )
        } else {
          setUploads(current => 
            current.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f)
          )
        }
      }

      xhr.onerror = () => {
        setUploads(current => 
          current.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f)
        )
      }

      xhr.send(formData)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/tiff': ['.tiff', '.tif'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/vnd.adobe.photoshop': ['.psd', '.psb']
    }
  })

  return (
    <div className="w-full flex flex-col gap-8 font-sans relative">
      
      {/* 🚀 PREMIUM CUSTOM ERROR TOAST */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[99999] bg-[#050505] border border-red-500/30 text-white px-6 py-3 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.25)] flex items-center gap-3 animate-in slide-in-from-top-5 fade-in font-medium text-sm">
          <XCircle className="w-4 h-4 text-red-500" /> {toast}
        </div>
      )}

      {/* THE DROP ZONE */}
      <div 
        {...getRootProps()} 
        className={`relative flex flex-col items-center justify-center p-16 border transition-all cursor-pointer bg-[#050505] min-h-[320px] rounded-xl
          ${isDragActive 
            ? 'border-white bg-[#0A0A0A] scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.06)]' 
            : 'border-white/10 hover:border-white/30 hover:bg-[#0A0A0A]'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-white text-black' : 'bg-white/5 text-neutral-400'}`}>
            <UploadCloud strokeWidth={1.5} className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white mb-1">
              {isDragActive ? 'Drop images here' : 'Drag and drop your images here'}
            </h3>
            <p className="text-neutral-500 text-sm">
              or click to browse your computer
            </p>
          </div>
        </div>
      </div>

      {/* UPLOAD QUEUE */}
      {uploads.length > 0 && (
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium text-neutral-400 border-b border-white/10 pb-3">
            Upload Queue
          </h4>
          
          <div className="flex flex-col gap-3">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-4 p-4 bg-[#050505] border border-white/10 rounded-lg group transition-colors">
                
                <div className="p-2 bg-white/5 rounded-md flex-shrink-0">
                  <ImageIcon strokeWidth={1.5} className="w-5 h-5 text-neutral-400" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white truncate pr-4">
                      {upload.file.name}
                    </span>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-[#0A0A0A] rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        upload.status === 'completed' ? 'bg-white' : 
                        upload.status === 'error' ? 'bg-red-500' : 'bg-neutral-500'
                      }`}
                      style={{ width: `${upload.status === 'error' ? 100 : upload.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end w-8 flex-shrink-0">
                  {upload.status === 'completed' ? (
                    <CheckCircle2 strokeWidth={1.5} className="w-5 h-5 text-white" />
                  ) : upload.status === 'error' ? (
                    <AlertCircle strokeWidth={1.5} className="w-5 h-5 text-red-500" />
                  ) : (
                    <span className="text-xs font-medium text-neutral-400">
                      {Math.round(upload.progress)}%
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}