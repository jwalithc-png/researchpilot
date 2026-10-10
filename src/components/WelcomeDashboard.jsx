import React, { useState } from 'react';
import { Compass, Globe, Sparkles, Cpu, ShieldCheck, ChevronUp, ChevronDown, ArrowRight, Folder, CheckCircle2, Server, Database, Layers } from 'lucide-react';

export default function WelcomeDashboard({
  onStartSearch,
  onOpenWorkspace,
  onLoadBenchmark,
  currentUser
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="glass-panel"
      style={{
        marginBottom: '28px',
        padding: isCollapsed ? '16px 24px' : '28px',
        background: 'linear-gradient(135deg, rgba(16, 23, 38, 0.85) 0%, rgba(10, 14, 24, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Ambient background glow orb */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Header Row with Collapse Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            <Compass size={22} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                {currentUser ? `Welcome back, ${currentUser.displayName || currentUser.email.split('@')[0]}` : 'Welcome to ResearchPilot'}
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                Smart AI Assistant
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Search across the web, scientific papers, latest news, and patents in seconds.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            <span>{isCollapsed ? 'Show Overview' : 'Hide Overview'}</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 4 Feature Cards with Simple Everyday Language */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            
            {/* Card 1: 4-Engine Search */}
            <div
              className="card-interactive"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Globe size={18} />
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>4 Search Engines</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', marginBottom: '4px' }}>Search 4 Places at Once</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Finds information across regular websites, academic studies, breaking news, and official patents.
              </p>
            </div>

            {/* Card 2: Simple AI Summary */}
            <div
              className="card-interactive"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee'
                }}>
                  <Sparkles size={18} />
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Smart Summary</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', marginBottom: '4px' }}>Clear AI Explanations</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Reads through all the search results and writes a clean, simple summary you can read in 2 minutes.
              </p>
            </div>

            {/* Card 3: Upload files */}
            <div
              className="card-interactive"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc'
                }}>
                  <Layers size={18} />
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Up to 50 Files</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', marginBottom: '4px' }}>Add Your Own Files</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Upload your own PDFs, text notes, or research papers to compare them with web results.
              </p>
            </div>

            {/* Card 4: Fact-checked */}
            <div
              className="card-interactive"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>100% Verified</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', marginBottom: '4px' }}>Fact-Checked Sources</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Every key point links directly to its real source so you can click and verify everything yourself.
              </p>
            </div>

          </div>

          {/* Bottom Row: Simple Action Buttons & Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Simple Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="pulse-dot"></span> System: <strong style={{ color: '#34d399' }}>Ready</strong>
              </span>
              <span>•</span>
              <span>Engines: <strong style={{ color: '#cbd5e1' }}>4 Search Engines Active</strong></span>
              <span>•</span>
              <span>File Limit: <strong style={{ color: '#c084fc' }}>50 Files Max</strong></span>
            </div>

            {/* Simple Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenWorkspace}
              >
                <Folder size={14} />
                <span>My Saved Searches</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onStartSearch}
              >
                <span>Start Searching</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
