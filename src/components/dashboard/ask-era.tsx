'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, User, Cpu } from 'lucide-react'
import { useRouter } from 'next/navigation' // 🚀 NEXT ROUTER FOR SOFT RELOAD

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AskEra() {
  const router = useRouter() // 🚀 INITIALIZE ROUTER
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Access granted. I am ERA, your vault's intelligence layer. How may I assist you in navigating your archives today?"
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages, isTyping])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response')
      }
      
      // 🚀 MAGIC UI REFRESH: If ERA changed the database, silently refresh the UI
      if (data.needsRefresh) {
        router.refresh()
      }
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: data.role,
        content: data.content
      }])
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || "Connection interrupted. Please verify your network and try again."
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="font-sans antialiased">
      {/* THE INTELLIGENCE PANEL */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 sm:w-[420px] h-[100dvh] sm:h-[600px] z-[100000] bg-[#000000] sm:bg-[#020202]/98 sm:backdrop-blur-3xl sm:border border-white/10 rounded-none sm:rounded-2xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 fade-in duration-300 ease-out">
          
          {/* HEADER - Industrial & Structured */}
          <div className="px-5 pt-10 pb-4 sm:pt-5 sm:pb-5 border-b border-white/10 bg-[#050505] flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-white/20 bg-white/5 text-white rounded-md shadow-inner">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white tracking-wide uppercase">ERA Intelligence</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">Secure Connection</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/10 active:scale-95 touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-white text-black'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white text-black rounded-xl rounded-tr-sm font-medium' 
                    : 'bg-[#0a0a0a] border border-white/10 text-neutral-300 rounded-xl rounded-tl-sm font-light tracking-wide'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%] animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border bg-white border-white text-black">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-[#0a0a0a] border border-white/10 flex items-center gap-1.5 h-[42px]">
                  <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* INPUT AREA - Terminal Style */}
          <div className="p-3 sm:p-5 bg-[#050505] border-t border-white/10 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Submit query..."
                className="w-full bg-[#000000] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-[13px] text-white focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all placeholder:text-neutral-600 font-mono tracking-tight shadow-inner"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 p-1.5 bg-white text-black rounded-md hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-white touch-manipulation"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <div className={`fixed bottom-6 right-4 sm:right-8 z-[99998] group ${isOpen ? 'hidden sm:block' : ''}`}>
        {!isOpen && (
          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl transition-all duration-700 group-hover:bg-white/20 group-hover:blur-2xl animate-pulse -z-10" />
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation border ${
            isOpen 
              ? 'bg-[#050505] border-white/20 text-neutral-400 hover:text-white backdrop-blur-md' 
              : 'bg-white border-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}