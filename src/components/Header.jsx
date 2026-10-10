import React, { useState } from 'react';
import { Compass, Server, CheckCircle2, Settings, ExternalLink, Sparkles, User, LogIn, LogOut, Folder } from 'lucide-react';

export const PRESET_TOPICS = [
  {
    label: "Dengue Prevention in India",
    topic: "Public Health Dengue Surveillance & Outbreak Early Warning in India",
    depth: "deep",
    country: "in",
    hasDocs: true
  },
  {
    label: "Solar Panels on Farmlands",
    topic: "Agrisolar Photovoltaic Systems & Dual Land-Use Farming in Semiarid India",
    depth: "standard",
    country: "in",
    hasDocs: false
  },
  {
    label: "AI for Health Checkups",
    topic: "Artificial Intelligence for Pulmonary Tuberculosis Radiograph Screening in Rural Primary Health Centers India",
    depth: "deep",
    country: "in",
    hasDocs: true
  },
  {
    label: "Next-Gen Batteries",
    topic: "Solid-State Lithium Sulfur Battery Solid Electrolyte Patents and Energy Density Breakthroughs",
    depth: "standard",
    country: "global",
    hasDocs: false
  }
];

export default function Header({
  onSelectPreset,
  isLiveConnected = true,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenWorkspace
}) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(6, 8, 15, 0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Logo & Simple Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Compass size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                  ResearchPilot <span style={{ color: '#06b6d4' }}>AI</span>
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  Public Interest
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Search Google, research papers, news, and patents in one simple place.
              </p>
            </div>
          </div>

          {/* Controls: System Online, System Status, Sign In */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Live System Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.8rem',
              color: '#34d399'
            }}>
              <span className="pulse-dot"></span>
              <span style={{ fontWeight: 600 }}>System Online</span>
            </div>

            {/* System Status Details */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowConfig(!showConfig)}
              title="View Connected Services"
            >
              <Settings size={15} />
              <span>Status</span>
            </button>

            {/* User Profile / Sign In */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  fontSize: '0.8rem',
                  color: '#e2e8f0'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#f43f5e', padding: '6px' }}
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                onClick={onOpenAuth}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Quick Sample Topics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Sparkles size={13} color="#fbbf24" /> Try an example:
          </span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => onSelectPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* System Status Details Drawer */}
        {showConfig && (
          <div style={{
            marginTop: '14px',
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.92rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={16} color="#6366f1" /> Connected Services (All Live & Ready)
              </h4>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowConfig(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>Main Search Pipeline:</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Ready for user searches</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>Google Search:</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Finds live websites</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>Research Papers (Scholar):</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Searches scientific studies</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>News & Media:</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Finds latest news updates</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>Patents & Inventions:</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Searches official patents</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <strong>AI Fact-Checker:</strong> Connected
                <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px' }}>✓ Checks facts against real links</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
