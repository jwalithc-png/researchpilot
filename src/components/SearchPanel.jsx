import React, { useState } from 'react';
import { Search, Globe, BookOpen, Newspaper, ShieldCheck, FileText, Layers, Sliders, Plus, Trash2, ArrowRight } from 'lucide-react';
import { PRESET_DOCUMENTS } from '../utils/benchmarkData';
import DocumentUploader from './DocumentUploader';

export default function SearchPanel({
  topic,
  setTopic,
  country,
  setCountry,
  engines,
  setEngines,
  researchDepth,
  setResearchDepth,
  maxSources,
  setMaxSources,
  confidenceThreshold,
  setConfidenceThreshold,
  includeDocuments,
  setIncludeDocuments,
  documents,
  setDocuments,
  onLaunchResearch,
  isLoading
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleEngine = (id) => {
    if (engines.includes(id)) {
      if (engines.length > 1) {
        setEngines(engines.filter(e => e !== id));
      }
    } else {
      setEngines([...engines, id]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading && topic.trim()) {
      onLaunchResearch();
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Top Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
          What would you like to search or research?
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={20} color="#6366f1" style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
          <input
            type="text"
            className="input-text"
            style={{
              paddingLeft: '48px',
              paddingRight: '120px',
              fontSize: '1.05rem',
              height: '52px',
              borderRadius: 'var(--radius-md)'
            }}
            placeholder="e.g., How to prevent dengue fever in India..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '6px',
              height: '40px',
              padding: '0 18px',
              fontSize: '0.9rem'
            }}
            onClick={onLaunchResearch}
            disabled={isLoading || !topic.trim()}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">◷</span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Tip: Press <code>Enter</code> to start search</span>
          <span>{topic.length}/250 characters</span>
        </div>
      </div>

      {/* Engine Multi-Select Grid */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Where should we search? (Choose search engines)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              onClick={() => setEngines(['google', 'google_scholar', 'google_news', 'google_patents'])}
            >
              Select All 4
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
          
          {/* Google Web */}
          <div
            onClick={() => toggleEngine('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: engines.includes('google') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${engines.includes('google') ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
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
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: engines.includes('google') ? '#ffffff' : 'var(--text-secondary)' }}>
                Google Web
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Websites & government portals
              </div>
            </div>
          </div>

          {/* Research Papers (Scholar) */}
          <div
            onClick={() => toggleEngine('google_scholar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: engines.includes('google_scholar') ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${engines.includes('google_scholar') ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: engines.includes('google_scholar') ? '#ffffff' : 'var(--text-secondary)' }}>
                Research Papers
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Scientific studies & journals
              </div>
            </div>
          </div>

          {/* News Articles */}
          <div
            onClick={() => toggleEngine('google_news')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: engines.includes('google_news') ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${engines.includes('google_news') ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185'
            }}>
              <Newspaper size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: engines.includes('google_news') ? '#ffffff' : 'var(--text-secondary)' }}>
                News Articles
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Latest news & media updates
              </div>
            </div>
          </div>

          {/* Patents */}
          <div
            onClick={() => toggleEngine('google_patents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: engines.includes('google_patents') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${engines.includes('google_patents') ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
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
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: engines.includes('google_patents') ? '#ffffff' : 'var(--text-secondary)' }}>
                Patents & Inventions
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Inventions, formulas & designs
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Configuration Bar: Country, Depth, Max Sources, Upload Files */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
        
        {/* Country Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Target Country
          </label>
          <select
            className="input-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isLoading}
          >
            <option value="in">🇮🇳 India</option>
            <option value="us">🇺🇸 United States</option>
            <option value="gb">🇬🇧 United Kingdom</option>
            <option value="global">🌐 Global (Worldwide)</option>
          </select>
        </div>

        {/* Depth Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Search Mode
          </label>
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'fast', label: 'Fast' },
              { id: 'standard', label: 'Balanced' },
              { id: 'deep', label: 'Deep' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '0.78rem',
                  borderRadius: '6px',
                  background: researchDepth === d.id ? '#6366f1' : 'transparent',
                  color: researchDepth === d.id ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: researchDepth === d.id ? 700 : 500
                }}
                onClick={() => setResearchDepth(d.id)}
                disabled={isLoading}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Sources Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Sources to Read:</span>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>{maxSources} sources</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={maxSources}
            onChange={(e) => setMaxSources(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
            disabled={isLoading}
          />
        </div>

        {/* Advanced / Document Ingestion Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Layers size={16} color={includeDocuments ? '#a855f7' : 'currentColor'} />
            <span>Add Your Files ({documents.length}/50)</span>
          </button>
        </div>

      </div>

      {/* Advanced Drawer: Document Upload & Trust Threshold */}
      {showAdvanced && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', animation: 'fadeIn 0.25s ease-out' }}>
          
          <DocumentUploader
            documents={documents}
            setDocuments={setDocuments}
            includeDocuments={includeDocuments}
            setIncludeDocuments={setIncludeDocuments}
          />

          {/* Confidence Threshold Tuning */}
          <div style={{ marginTop: '20px', maxWidth: '340px', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Minimum Trust Score:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
