"use client"
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { signOut, useSession } from "next-auth/react"
import { APP_CONFIG } from "@/lib/constants"

const TOKENS_TOTAL = APP_CONFIG.MAX_DAILY_TOKENS

function LexibaseMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#7c6bff" fillOpacity="0.15" />
      <rect x="0.5" y="0.5" width="27" height="27" rx="6.5" stroke="#7c6bff" strokeOpacity="0.4" />
      <rect x="9" y="9" width="10" height="10" stroke="#a598ff" strokeWidth="2.5" transform="rotate(-12 14 14)" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="8.5" height="11" rx="1.2" stroke="#7c6bff" strokeWidth="1.1" strokeOpacity="0.7" />
      <path d="M8 1v3.2h2.5" stroke="#7c6bff" strokeWidth="1.1" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M4.5 7.5h5M4.5 9.5h3" stroke="#7c6bff" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 2L7.5 8.5M14 2L9.5 13.5L7.5 8.5M14 2L2 6.5L7.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5.5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2.5M9.5 10l2.5-3-2.5-3M12 7H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TokenSegments({ remaining, total }: { remaining: number; total: number }) {
  const used = total - remaining
  return (
    <div className="flex gap-[3px] items-center">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i >= used
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 6,
              borderRadius: 2,
              background: isActive
                ? `linear-gradient(90deg, #7c6bff, #a598ff)`
                : 'rgba(255,255,255,0.07)',
              boxShadow: isActive ? '0 0 6px rgba(124,107,255,0.35)' : 'none',
              transition: 'background 0.2s',
            }}
          />
        )
      })}
    </div>
  )
}

interface SourceMeta {
  chunkId: string
  pageNumber: number | null
}

interface DbMessage {
  id: string
  role: string
  content: string
  sources: unknown
  createdAt: Date | string
}

interface DashboardClientProps {
  initialSession: { user: { id: string; name?: string | null; email?: string | null; image?: string | null } }
  initialTokens: number
  initialDocument: { id: string; filename: string } | null
  initialMessages: DbMessage[]
  initialHasMore: boolean
}

function ConfirmModal({
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  isLoading = false
}: {
  title: string
  message: string
  confirmText: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(9, 9, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#0c0e18',
          border: '1px solid rgba(255,59,48,0.2)',
          borderRadius: 20,
          padding: '24px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,59,48,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#eaecf8', marginBottom: 12, letterSpacing: '-0.01em' }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#a0a5bc', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#d4d8f0',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#ff3b30',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ onClose, user, update }: { onClose: () => void, user: any, update: any }) {
  const [name, setName] = useState(user?.name || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    if (name === user?.name) {
      onClose()
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await update({ name })
        onClose()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
      })
      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }
  
  return (
    <>
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Account?"
          message="Are you sure you want to permanently delete your account and all associated data? This action cannot be undone."
          confirmText="Delete Account"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      )}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 9, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#0c0e18',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24,
          padding: '32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,107,255,0.1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: '#5a6080',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          ✕
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#eaecf8', marginBottom: 24, letterSpacing: '-0.02em' }}>
          Account Settings
        </h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7494', marginBottom: 8, fontWeight: 500 }}>
            Display Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '12px 14px',
              color: '#e4e8f4',
              fontSize: 14,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(124,107,255,0.4)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7494', marginBottom: 8, fontWeight: 500 }}>
            Email Address
          </label>
          <input
            value={user?.email || ''}
            disabled
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: '12px 14px',
              color: '#5a6080',
              fontSize: 14,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'not-allowed',
            }}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: '#4a5070', fontFamily: "'DM Mono', monospace" }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff5f57',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '8px 0',
              opacity: isDeleting ? 0.5 : 1,
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
          
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #7c6bff, #a598ff)',
              border: 'none',
              borderRadius: 9,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(124,107,255,0.3)',
              opacity: isSaving ? 0.7 : 1,
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default function DashboardClient({
  initialSession,
  initialTokens,
  initialDocument,
  initialMessages: serverMessages,
  initialHasMore,
}: DashboardClientProps) {
  const { data: session, update } = useSession()
  const user = session?.user ?? initialSession.user

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showRemoveDocConfirm, setShowRemoveDocConfirm] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tokensRemaining, setTokensRemaining] = useState(initialTokens)
  const [isMounted, setIsMounted] = useState(false)
  const [isInitializing] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [docActive, setDocActive] = useState(!!initialDocument)
  const [activeDocName, setActiveDocName] = useState<string | null>(initialDocument?.filename ?? null)
  const [uploadStage, setUploadStage] = useState<string | null>(null)
  const [isRemovingDoc, setIsRemovingDoc] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [focused, setFocused] = useState(false)

  const [streamingMessages, setStreamingMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; sources?: { chunkId: string; pageNumber: number | null }[] }[]>(
    (serverMessages as DbMessage[]).map((m) => {
      const rawSources = Array.isArray(m.sources) ? (m.sources as { chunkId: string; pageNumber: number | null }[]) : []
      const filtered = m.role === 'assistant' ? filterSourcesToCited(m.content, rawSources) : []
      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        sources: filtered.length > 0 ? filtered : undefined,
      }
    })
  )
  const [input, setInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [hoursUntilReset, setHoursUntilReset] = useState<number | null>(null)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      setHoursUntilReset(Math.max(1, Math.ceil(diff / (1000 * 60 * 60))))
    }
    calc()
    const interval = setInterval(calc, 1000 * 60 * 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/user/tokens')
        if (res.ok) {
          const data = await res.json()
          if (typeof data.tokens === 'number') {
            setTokensRemaining(data.tokens)
          }
        }
      } catch (err) {
        console.error("Failed to fetch tokens on focus", err)
      }
    }

    window.addEventListener('focus', fetchTokens)
    return () => window.removeEventListener('focus', fetchTokens)
  }, [])

  const bottomRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previousScrollHeight, setPreviousScrollHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (previousScrollHeight !== null && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight
      scrollContainerRef.current.scrollTop += (newScrollHeight - previousScrollHeight)
      setPreviousScrollHeight(null)
    }
  }, [streamingMessages, previousScrollHeight])

  const isInitialScroll = useRef(true)
  const lastMessage = streamingMessages[streamingMessages.length - 1]
  
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isInitialScroll.current) {
      container.scrollTop = container.scrollHeight;
      isInitialScroll.current = false;
      setIsMounted(true);
    } else {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [lastMessage?.id, lastMessage?.content, lastMessage?.sources])

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages || streamingMessages.length === 0) return
    setIsLoadingMore(true)
    const cursor = streamingMessages[0].id
    try {
      const res = await fetch(`/api/messages?cursor=${cursor}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          const processed = data.messages.map((m: any) => {
            const rawSources = Array.isArray(m.sources) ? m.sources : []
            const filtered = m.role === 'assistant' ? filterSourcesToCited(m.content, rawSources) : []
            return {
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              sources: filtered.length > 0 ? filtered : undefined,
            }
          })
          
          setPreviousScrollHeight(scrollContainerRef.current?.scrollHeight ?? 0)

          setStreamingMessages(prev => {
            const prevIds = new Set(prev.map(m => m.id))
            const newMessages = processed.filter((m: any) => !prevIds.has(m.id))
            return [...newMessages, ...prev]
          })
        }
        setHasMoreMessages(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to load older messages', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMoreMessages, streamingMessages])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMessages && !isLoadingMore) {
          loadMoreMessages()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (topRef.current) {
      observer.observe(topRef.current)
    }

    return () => observer.disconnect()
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isChatLoading) return
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text }
    setStreamingMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsChatLoading(true)
    const aiMsgId = (Date.now() + 1).toString()
    setStreamingMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setStreamingMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: err.error || 'Something went wrong.' } : m))
        if (res.status === 403) setTokensRemaining(0)
        return
      }
      const sourcesHeader = res.headers.get('X-Sources')
      const allSources: { chunkId: string; pageNumber: number | null }[] = sourcesHeader ? JSON.parse(sourcesHeader) : []
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: accumulated } : m))
      }
      const citedSources = filterSourcesToCited(accumulated, allSources)
      if (citedSources.length > 0) {
        setStreamingMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, sources: citedSources } : m))
      }
      setTokensRemaining((prev) => Math.max(0, prev - 1))
    } catch (_) {
      setStreamingMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: 'Connection error. Please try again.' } : m))
      setTokensRemaining((prev) => Math.min(APP_CONFIG.MAX_DAILY_TOKENS, prev + 1))
    } finally {
      setIsChatLoading(false)
    }
  }, [isChatLoading])


  const handleUploadFile = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.')
      return
    }
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > APP_CONFIG.MAX_FILE_SIZE_MB) {
      alert(`File is too large. Maximum size is ${APP_CONFIG.MAX_FILE_SIZE_MB}MB.`)
      return
    }
    setUploadStage('Extracting text...')
    const formData = new FormData()
    formData.append('file', file)
    try {
      setUploadStage('Analyzing document...')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Upload failed. Please try again.')
        setUploadStage(null)
        return
      }
      setUploadStage('Saving to database...')
      await new Promise(r => setTimeout(r, 400))
      setActiveDocName(data.document.filename)
      setDocActive(true)
    } catch (e) {
      alert('Something went wrong during upload.')
    } finally {
      setUploadStage(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUploadFile(file)
  }, [handleUploadFile])

  async function handleRemoveDocument() {
    setIsRemovingDoc(true)
    try {
      await fetch('/api/document', { method: 'DELETE' })
      setDocActive(false)
      setActiveDocName(null)
      setShowRemoveDocConfirm(false)
      setStreamingMessages([])
      setHasMoreMessages(false)
    } catch (_) {
      alert('Failed to remove document')
    } finally {
      setIsRemovingDoc(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isChatLoading && input.trim()) {
        sendMessage(input)
      }
    }
  }

  return (
    <div
      className="dashboard-main-flex"
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100%',
        background: '#09090e',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#e4e8f4',
        overflow: 'hidden',
      }}
    >
      {showSettingsModal && user && <SettingsModal onClose={() => setShowSettingsModal(false)} user={user} update={update} />}
      {showRemoveDocConfirm && (
        <ConfirmModal
          title="Remove Document?"
          message="Are you sure you want to remove this document from the active session? Your chat context will be cleared."
          confirmText="Remove Document"
          onCancel={() => setShowRemoveDocConfirm(false)}
          onConfirm={handleRemoveDocument}
          isLoading={isRemovingDoc}
        />
      )}
      {isSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 90,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}
      <aside
        className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{
          width: 264,
          minWidth: 264,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0c0e18 0%, #0a0c15 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 0',
          zIndex: 10,
        }}
      >
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LexibaseMark />
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#eaecf8',
              }}
            >
              Lexibase
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 20px 24px' }} />

        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontSize: 9.5,
              fontFamily: "'DM Mono', monospace",
              color: '#4a5070',
              letterSpacing: '0.12em',
              fontWeight: 500,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            Active Document
          </div>

          {docActive ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: 'rgba(124,107,255,0.08)',
                border: '1px solid rgba(124,107,255,0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                position: 'relative',
              }}
            >
              <PdfIcon />
              <span
                style={{
                  flex: 1,
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: '#c4c8e8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
                title={activeDocName || ''}
              >
                {activeDocName}
              </span>
              <button
                onClick={() => setShowRemoveDocConfirm(true)}
                title="Remove document"
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#6b7494',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  lineHeight: 1,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,80,80,0.15)'
                  e.currentTarget.style.color = '#ff6060'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#6b7494'
                }}
              >
                ×
              </button>
            </div>
          ) : uploadStage ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px dashed rgba(124,107,255,0.3)',
                borderRadius: 8,
                padding: '14px 12px',
                fontSize: 11.5,
                color: '#7c6bff',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="rgba(124,107,255,0.3)" strokeWidth="1.5" />
                <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="#7c6bff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {uploadStage}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDragOver ? '1px dashed rgba(124,107,255,0.5)' : '1px dashed rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '14px 12px',
                fontSize: 11.5,
                color: isDragOver ? '#7c6bff' : '#3a3e58',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                background: isDragOver ? 'rgba(124,107,255,0.04)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(124,107,255,0.3)'
                e.currentTarget.style.color = '#7c6bff'
              }}
              onMouseLeave={(e) => {
                if (!isDragOver) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = '#3a3e58'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <span>+ Upload a PDF</span>
              <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 6 }}>(Max 10MB)</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUploadFile(file)
              e.target.value = ''
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: "'DM Mono', monospace",
                  color: '#4a5070',
                  letterSpacing: '0.12em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                Daily Tokens
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  color: tokensRemaining <= 3 ? '#ff8c5a' : '#a598ff',
                  fontWeight: 500,
                }}
              >
                {tokensRemaining}
                <span style={{ color: '#3a3e58' }}>/{TOKENS_TOTAL}</span>
              </span>
            </div>
            <TokenSegments remaining={tokensRemaining} total={TOKENS_TOTAL} />
            <div
              style={{
                marginTop: 8,
                fontSize: 10.5,
                color: '#3a3e58',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {tokensRemaining} remaining · resets in {hoursUntilReset !== null ? hoursUntilReset : '--'}h
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px', margin: '-6px', borderRadius: 8, transition: 'background 0.2s' }}
              onClick={() => setShowSettingsModal(true)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c6bff 0%, #a598ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                }}
              >
                {user?.image ? (
                  <img src={user.image} alt={user?.name || "User"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : "U"
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#d4d8f0',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {user?.name || "Loading..."}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: '#4a5070',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {user?.email || "..."}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              style={{
                marginTop: 12,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 7,
                border: 'none',
                background: 'transparent',
                color: '#4a5070',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#8b91b8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#4a5070'
              }}
            >
              <SignOutIcon />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 56,
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            flexShrink: 0,
            background: 'rgba(9,9,14,0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            className="mobile-hamburger"
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0a5bc',
              cursor: 'pointer',
              padding: '8px 8px 8px 0',
              marginRight: 8,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PdfIcon />
            <span
              style={{
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                color: '#4a5070',
                letterSpacing: '0.01em',
              }}
            >
              {docActive ? activeDocName || 'No document selected' : 'No document selected'}
            </span>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 0',
            opacity: isMounted ? 1 : 0,
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div ref={topRef} style={{ height: 1 }} />
            {isLoadingMore && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={`loader-${i}`} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6bff', opacity: 0.5, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            {streamingMessages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} content={msg.content} />
              ) : (
                <AssistantMessage key={msg.id} content={msg.content} sources={msg.sources} />
              )
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div
          style={{
            padding: '0 32px 28px',
            background: 'linear-gradient(0deg, #09090e 80%, transparent)',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 12,
                background: '#111520',
                border: focused
                  ? '1px solid rgba(124,107,255,0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: focused
                  ? '0 0 0 3px rgba(124,107,255,0.08), 0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Ask a question about your document…"
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#e4e8f4',
                  lineHeight: 1.6,
                  maxHeight: 160,
                  overflow: 'auto',
                  caretColor: '#7c6bff',
                }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
                }}
              />
              <button
                onClick={() => {
                  if (!isChatLoading && input.trim()) {
                    sendMessage(input)
                  }
                }}
                disabled={!input.trim() || isChatLoading}
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: 'none',
                  background: input.trim()
                    ? 'linear-gradient(135deg, #7c6bff, #a598ff)'
                    : 'rgba(255,255,255,0.05)',
                  color: input.trim() ? '#fff' : '#3a3e58',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s, transform 0.1s',
                  boxShadow: input.trim() ? '0 4px 16px rgba(124,107,255,0.35)' : 'none',
                }}
                onMouseDown={(e) => {
                  if (input.trim()) e.currentTarget.style.transform = 'scale(0.92)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <SendIcon />
              </button>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 10.5,
                fontFamily: "'DM Mono', monospace",
                color: '#2e3250',
                textAlign: 'center',
                letterSpacing: '0.03em',
              }}
            >
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function filterSourcesToCited(
  content: string,
  sources: { chunkId: string; pageNumber: number | null }[]
): { chunkId: string; pageNumber: number | null }[] {
  const citedIndices: number[] = []
  const citeRegex = /<cite>(\d+)<\/cite>/g
  let m
  while ((m = citeRegex.exec(content)) !== null) {
    const idx = parseInt(m[1])
    if (!citedIndices.includes(idx) && idx < sources.length) {
      citedIndices.push(idx)
    }
  }
  return citedIndices.map((idx) => sources[idx])
}

function parseCitations(text: string): React.ReactNode {
  const indexToBadge = new Map<number, number>()
  let counter = 1
  const scanRegex = /<cite>(\d+)<\/cite>/g
  let scanMatch
  while ((scanMatch = scanRegex.exec(text)) !== null) {
    const idx = parseInt(scanMatch[1])
    if (!indexToBadge.has(idx)) {
      indexToBadge.set(idx, counter++)
    }
  }
  const parts = text.split(/(<cite>\d+<\/cite>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^<cite>(\d+)<\/cite>$/)
        if (match) {
          const badge = indexToBadge.get(parseInt(match[1]))
          if (badge === undefined) return null
          return <CitationBadge key={i} index={badge} />
        }
        return part
      })}
    </>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          maxWidth: '68%',
          background: 'linear-gradient(135deg, #1a1730 0%, #141126 100%)',
          border: '1px solid rgba(124,107,255,0.2)',
          borderRadius: '16px 16px 4px 16px',
          padding: '14px 18px',
          fontSize: 14,
          fontWeight: 400,
          color: '#d4d8f0',
          lineHeight: 1.65,
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {content}
      </div>
    </div>
  )
}

function AssistantMessage({ content, sources }: { content: string; sources?: { chunkId: string; pageNumber: number | null }[] }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <LexibaseMark />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: '#a598ff',
            letterSpacing: '0.06em',
            marginBottom: 8,
            fontWeight: 400,
          }}
        >
          LEXIBASE AI
        </div>
        {!content ? (
          <div style={{ height: 32, display: 'flex', gap: 5, alignItems: 'center', paddingLeft: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6bff', opacity: 0.5, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#0f1119',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: '2px solid rgba(124,107,255,0.5)',
              borderRadius: '4px 12px 12px 12px',
              padding: '16px 20px',
              fontSize: 14,
              color: '#c8ccdf',
              lineHeight: 1.75,
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}
          >
            <span>{parseCitations(content)}</span>
          </div>
        )}
        {sources && sources.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sources.map((src, i) => (
              <div
                key={src.chunkId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 10px',
                  background: 'rgba(200,160,84,0.06)',
                  border: '1px solid rgba(200,160,84,0.15)',
                  borderRadius: 7,
                  cursor: 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,160,84,0.1)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,160,84,0.06)' }}
              >
                <PdfIcon />
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "'DM Mono', monospace",
                    color: '#8a7040',
                    letterSpacing: '0.03em',
                  }}
                >
                  [{i + 1}] · Page {src.pageNumber ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CitationBadge({ index }: { index: number }) {
  return (
    <sup
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        marginBottom: 4,
        width: 16,
        height: 16,
        borderRadius: 4,
        background: 'rgba(200,160,84,0.15)',
        border: '1px solid rgba(200,160,84,0.35)',
        fontSize: 8.5,
        fontFamily: "'DM Mono', monospace",
        color: '#c8a054',
        fontWeight: 500,
        lineHeight: 1,
        verticalAlign: 'top',
        position: 'relative',
        top: 3,
        cursor: 'pointer',
      }}
    >
      {index}
    </sup>
  )
}
