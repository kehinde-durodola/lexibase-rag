"use client"
import { useState, useRef, useEffect } from 'react'
import { signOut, useSession } from "next-auth/react"

const TOKENS_REMAINING = 10
const TOKENS_TOTAL = 10

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

interface Message {
  role: 'user' | 'assistant'
  content: React.ReactNode | string
  sources?: { index: number; page: number }[]
}

const initialMessages: Message[] = [
  {
    role: 'user',
    content: 'What is the primary conclusion of the Q3 report regarding our server infrastructure?',
  },
  {
    role: 'assistant',
    content: (
      <>
        The primary conclusion of the Q3 report is that the current server infrastructure is reaching its maximum capacity <CitationBadge index={1} /> and requires an immediate migration to a distributed microservices architecture by Q4 <CitationBadge index={2} />.
      </>
    ),
    sources: [
      { index: 1, page: 47 },
      { index: 2, page: 12 },
    ]
  },
]

function ConfirmModal({
  title,
  message,
  confirmText,
  onConfirm,
  onCancel
}: {
  title: string
  message: string
  confirmText: string
  onConfirm: () => void
  onCancel: () => void
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
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ onClose, user }: { onClose: () => void, user: any }) {
  const [name, setName] = useState(user?.name || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  return (
    <>
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Account?"
          message="Are you sure you want to permanently delete your account and all associated data? This action cannot be undone."
          confirmText="Delete Account"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false)
            onClose()
          }}
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
            }}
          >
            Delete Account
          </button>
          
          <button
            onClick={onClose}
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
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default function DashboardClient() {
  const { data: session } = useSession()
  const user = session?.user

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showRemoveDocConfirm, setShowRemoveDocConfirm] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [docActive, setDocActive] = useState(true)
  const [focused, setFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I\'m analyzing the document to find the most relevant information for your query.',
        },
      ])
    }, 800)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="dashboard-main-flex"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        background: '#09090e',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#e4e8f4',
        overflow: 'hidden',
      }}
    >
      {showSettingsModal && user && <SettingsModal onClose={() => setShowSettingsModal(false)} user={user} />}
      {showRemoveDocConfirm && (
        <ConfirmModal
          title="Remove Document?"
          message="Are you sure you want to remove this document from the active session? Your chat context will be cleared."
          confirmText="Remove Document"
          onCancel={() => setShowRemoveDocConfirm(false)}
          onConfirm={() => {
            setDocActive(false)
            setShowRemoveDocConfirm(false)
          }}
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
                title="Q3_Enterprise_Architecture_Report_2026.pdf"
              >
                Q3_Enterprise_Architecture_Report_2026.pdf
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
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '14px 12px',
                fontSize: 11.5,
                color: '#3a3e58',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(124,107,255,0.3)'
                e.currentTarget.style.color = '#7c6bff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#3a3e58'
              }}
              onClick={() => setDocActive(true)}
            >
              + Upload a document
            </div>
          )}
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
                  color: TOKENS_REMAINING <= 3 ? '#ff8c5a' : '#a598ff',
                  fontWeight: 500,
                }}
              >
                {TOKENS_REMAINING}
                <span style={{ color: '#3a3e58' }}>/{TOKENS_TOTAL}</span>
              </span>
            </div>
            <TokenSegments remaining={TOKENS_REMAINING} total={TOKENS_TOTAL} />
            <div
              style={{
                marginTop: 8,
                fontSize: 10.5,
                color: '#3a3e58',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {TOKENS_REMAINING} remaining · resets in 14h
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
              {docActive ? 'Q3_Enterprise_Architecture_Report_2026.pdf' : 'No document selected'}
            </span>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 0',
          }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <UserMessage key={i} content={msg.content} />
              ) : (
                <AssistantMessage key={i} content={msg.content} sources={msg.sources} />
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
                onClick={handleSend}
                disabled={!input.trim()}
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

function UserMessage({ content }: { content: React.ReactNode | string }) {
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

function AssistantMessage({ content, sources }: { content: React.ReactNode | string; sources?: { index: number; page: number }[] }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(124,107,255,0.2) 0%, rgba(124,107,255,0.05) 100%)',
          border: '1px solid rgba(124,107,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c6bff" strokeWidth="2">
          <path d="M12 2a2 2 0 0 1 2 2c-.001.552-.448 1-1 1-.552.001-1 .448-1 1v1h2a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3V9a2 2 0 0 1 2-2h2V6c0-.552-.448-1-1-1-.552-.001-1-.448-1-1a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
          <span>{content}</span>
        </div>

        {sources && sources.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sources.map((src) => (
              <div
                key={src.index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 10px',
                  background: 'rgba(200,160,84,0.06)',
                  border: '1px solid rgba(200,160,84,0.15)',
                  borderRadius: 7,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,160,84,0.1)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,160,84,0.06)'
                }}
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
                  Source [{src.index}] · Page {src.page}
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
