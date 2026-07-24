"use client"
import { useState } from 'react'
import { signIn } from 'next-auth/react'

function LexibaseMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#7c6bff" fillOpacity="0.15" />
      <rect x="0.5" y="0.5" width="27" height="27" rx="6.5" stroke="#7c6bff" strokeOpacity="0.4" />
      <rect x="9" y="9" width="10" height="10" stroke="#a598ff" strokeWidth="2.5" transform="rotate(-12 14 14)" />
    </svg>
  )
}

function PdfMiniIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="8.5" height="11" rx="1.2" stroke="#7c6bff" strokeWidth="1.1" strokeOpacity="0.7" />
      <path d="M8 1v3.2h2.5" stroke="#7c6bff" strokeWidth="1.1" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeroChatPreview() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 620,
        margin: '0 auto',
        background: '#0c0e18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,107,255,0.08)',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: '#0a0c14',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6 }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 6,
              fontSize: 10.5,
              fontFamily: "'DM Mono', monospace",
              color: '#3a3e58',
            }}
          >
            <PdfMiniIcon />
            Q3_Enterprise_Architecture_Report_2026.pdf
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div
            style={{
              maxWidth: '72%',
              background: 'linear-gradient(135deg, #1a1730 0%, #141126 100%)',
              border: '1px solid rgba(124,107,255,0.2)',
              borderRadius: '14px 14px 3px 14px',
              padding: '10px 14px',
              fontSize: 12.5,
              color: '#d4d8f0',
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
            }}
          >
            What is the primary conclusion regarding server infrastructure?
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'rgba(124,107,255,0.12)',
              border: '1px solid rgba(124,107,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2" fill="#a598ff" fillOpacity="0.8" />
              <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#7c6bff" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                background: '#0f1119',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '2px solid rgba(124,107,255,0.5)',
                borderRadius: '3px 10px 10px 10px',
                padding: '10px 14px',
                fontSize: 12.5,
                color: '#c8ccdf',
                lineHeight: 1.7,
                letterSpacing: '-0.01em',
              }}
            >
              The infrastructure is at maximum capacity and requires migration to distributed microservices by Q4.
              <sup
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 3,
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: 'rgba(200,160,84,0.15)',
                  border: '1px solid rgba(200,160,84,0.35)',
                  fontSize: 7.5,
                  fontFamily: "'DM Mono', monospace",
                  color: '#c8a054',
                  fontWeight: 500,
                  position: 'relative',
                  top: 2,
                  cursor: 'pointer',
                  verticalAlign: 'top',
                }}
              >
                1
              </sup>
            </div>
            <div
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                background: 'rgba(200,160,84,0.06)',
                border: '1px solid rgba(200,160,84,0.15)',
                borderRadius: 5,
              }}
            >
              <PdfMiniIcon />
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: "'DM Mono', monospace",
                  color: '#7a6035',
                  letterSpacing: '0.02em',
                }}
              >
                Source [1] · pg. 47
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 5,
                  borderRadius: 1.5,
                  background:
                    i >= 6
                      ? 'linear-gradient(90deg, #7c6bff, #a598ff)'
                      : 'rgba(255,255,255,0.06)',
                  boxShadow: i >= 6 ? '0 0 5px rgba(124,107,255,0.3)' : 'none',
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 9.5,
              fontFamily: "'DM Mono', monospace",
              color: '#4a5070',
            }}
          >
            4 / 10 tokens
          </span>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 7v6l7 5 7-5V7L10 2Z" stroke="#7c6bff" strokeWidth="1.2" strokeLinejoin="round" strokeOpacity="0.8" />
        <path d="M7 10l2 2 4-4" stroke="#a598ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'VERIFIED · CITED',
    title: 'Answers you can stake your name on.',
    body: "Every response includes the exact source passage and page number. No summaries. No paraphrasing. The precise text that answers your question, every time.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="#7c6bff" strokeWidth="1.2" strokeOpacity="0.8" />
        <path d="M7 10h6M7 7h6M7 13h3" stroke="#a598ff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
        <circle cx="15" cy="5" r="3" fill="#c8a054" fillOpacity="0.15" stroke="#c8a054" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M14 5l.7.7L16 4" stroke="#c8a054" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
      </svg>
    ),
    label: 'PRIVATE · SECURE',
    title: 'Your documents stay yours. Full stop.',
    body: "Run it locally or self-host it. No third-party API calls, no hidden telemetry. Your data never leaves your own secure environment.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#7c6bff" strokeWidth="1.2" strokeOpacity="0.8" />
        <path d="M10 6v4l3 2" stroke="#a598ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'INSTANT · PRECISE',
    title: 'Stop reading. Start querying.',
    body: "What used to take hours of page-turning takes seconds. Our advanced retrieval engine scans thousands of pages instantly to deliver the precise citation you need.",
  },
]

function AuthModal({ onClose }: { onClose: () => void }) {
  return (
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
          padding: '40px 32px',
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <LexibaseMark size={40} />
        </div>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#eaecf8', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7494', marginBottom: 32 }}>
          Sign in to access your secure documents and start querying.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#e4e8f4',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#e4e8f4',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LandingClient() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const handleAuth = () => setShowAuthModal(true)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090e',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#e4e8f4',
        overflowX: 'hidden',
      }}
    >
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(9,9,14,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 32px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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

          <button
            onClick={handleAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#c4c8e8',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'border-color 0.2s, background 0.2s, color 0.2s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(124,107,255,0.4)'
              e.currentTarget.style.background = 'rgba(124,107,255,0.08)'
              e.currentTarget.style.color = '#e4e8f4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#c4c8e8'
            }}
          >
            Sign In
            <ArrowIcon />
          </button>
        </div>
      </header>

      <section
        className="mobile-padding"
        style={{
          padding: '100px 32px 80px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: '#eaecf8',
                marginBottom: 22,
              }}
            >
              Your 300-page
              <br />
              document,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c6bff 0%, #a598ff 60%, #c8a054 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                answered
              </span>
              <br />
              in seconds.
            </h1>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: '#6b7494',
                fontWeight: 400,
                marginBottom: 36,
                maxWidth: 420,
              }}
            >
              Upload any PDF and ask questions in plain language. Lexibase finds the exact relevant passage in milliseconds.
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={handleAuth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 26px',
                  borderRadius: 11,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c6bff 0%, #a598ff 100%)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.01em',
                  boxShadow: '0 8px 32px rgba(124,107,255,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,107,255,0.45)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,107,255,0.35)'
                }}
              >
                Start Querying
                <ArrowIcon />
              </button>

              <a
                href="https://github.com/kehinde-durodola/lexibase-rag"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '13px 22px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: '#6b7494',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = '#c4c8e8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = '#6b7494'
                }}
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>


          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                height: 300,
                background: 'radial-gradient(ellipse, rgba(124,107,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <HeroChatPreview />
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(124,107,255,0.2) 20%, rgba(124,107,255,0.2) 80%, transparent)',
          }}
        />
      </div>

      <section
        className="mobile-padding-lg"
        style={{
          padding: '80px 32px 100px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontSize: 9.5,
              fontFamily: "'DM Mono', monospace",
              color: '#4a5070',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Core Principles
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#eaecf8',
              lineHeight: 1.2,
            }}
          >
            Built for precision work.
          </h2>
        </div>

        <div
          className="features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                background: hoveredFeature === i ? '#111520' : '#0f1117',
                border:
                  hoveredFeature === i
                    ? '1px solid rgba(124,107,255,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '28px 26px',
                cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
                transform: hoveredFeature === i ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow:
                  hoveredFeature === i
                    ? '0 16px 48px rgba(0,0,0,0.3)'
                    : '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(124,107,255,0.08)',
                  border: '1px solid rgba(124,107,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  color: '#4a5070',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                {f.label}
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#e4e8f4',
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: '#5a6080',
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>


      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '28px 32px',
        }}
      >
        <div
          className="footer-flex"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LexibaseMark size={20} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#3a3e58',
                letterSpacing: '-0.01em',
              }}
            >
              Lexibase
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: '#2e3250',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            Open source · MIT License · lexibase.app
          </div>

          <a
            href="https://github.com/kehinde-durodola/lexibase-rag"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#3a3e58',
              textDecoration: 'none',
              fontFamily: "'DM Mono', monospace",
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#7c6bff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3a3e58'
            }}
          >
            <GitHubIcon />
            kehinde-durodola/lexibase-rag
          </a>
        </div>
      </footer>
    </div>
  )
}

