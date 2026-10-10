import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, BookOpen, FileText, Newspaper, ShieldCheck, Search, FileDown } from 'lucide-react';

export default function SourcesDrawer({ sources = [], highlightedSourceId, onClearHighlight }) {
  const [selectedEngine, setSelectedEngine] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sourceRefs = useRef({});

  // Auto-scroll to highlighted source if triggered from citation click
  useEffect(() => {
    if (highlightedSourceId && sourceRefs.current[highlightedSourceId]) {
      const el = sourceRefs.current[highlightedSourceId];
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedSourceId]);

  const engineCounts = React.useMemo(() => {
    const counts = { all: sources.length, google: 0, google_scholar: 0, google_news: 0, google_patents: 0, internal_docs: 0 };
    sources.forEach(s => {
      const eng = s.engine || 'google';
      if (counts[eng] !== undefined) counts[eng]++;
    });
    return counts;
  }, [sources]);

  const filteredSources = sources.filter(s => {
    const matchesEngine = selectedEngine === 'all' || s.engine === selectedEngine;
    const matchesSearch = !searchQuery.trim() || (
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.snippet && s.snippet.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.authors && s.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.assignee && s.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.sourceId && s.sourceId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesEngine && matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Sources & Real Links
            <span className="badge badge-blue">{sources.length} Verified</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Every statement in the report links to one of these real sources below. Click any link to check it yourself.
          </p>
        </div>

        {/* Search within sources */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-text"
            style={{ paddingLeft: '34px', height: '36px', fontSize: '0.8rem' }}
            placeholder="Search within sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Engine Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'all', label: 'All Sources', count: engineCounts.all },
          { id: 'google', label: 'Google Web', count: engineCounts.google },
          { id: 'google_scholar', label: 'Research Papers', count: engineCounts.google_scholar },
          { id: 'google_news', label: 'News Articles', count: engineCounts.google_news },
          { id: 'google_patents', label: 'Patents', count: engineCounts.google_patents },
          { id: 'internal_docs', label: 'Your Files', count: engineCounts.internal_docs },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-full)',
              background: selectedEngine === tab.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
              color: selectedEngine === tab.id ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${selectedEngine === tab.id ? 'transparent' : 'var(--border-subtle)'}`,
              whiteSpace: 'nowrap'
            }}
            onClick={() => setSelectedEngine(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Sources Grid / List */}
      {filteredSources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No sources match your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
          {filteredSources.map((source) => {
            const id = (source.sourceId || source.id || '').toUpperCase();
            const isHighlighted = highlightedSourceId === id;

            return (
              <div
                key={id || Math.random()}
                ref={el => sourceRefs.current[id] = el}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: isHighlighted ? 'rgba(99, 102, 241, 0.18)' : 'rgba(16, 23, 38, 0.6)',
                  border: `1px solid ${isHighlighted ? '#6366f1' : 'var(--border-subtle)'}`,
                  boxShadow: isHighlighted ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                {/* Source Top Meta: ID & Engine Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: id.startsWith('D') ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: id.startsWith('D') ? '#c084fc' : '#818cf8',
                      border: `1px solid ${id.startsWith('D') ? 'rgba(168, 85, 247, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`
                    }}>
                      [{id}]
                    </span>

                    <span className={`badge ${
                      source.engine === 'google_scholar' ? 'badge-amber' :
                      source.engine === 'google_news' ? 'badge-rose' :
                      source.engine === 'google_patents' ? 'badge-emerald' :
                      source.engine === 'internal_docs' ? 'badge-purple' : 'badge-blue'
                    }`}>
                      {source.engine === 'google_scholar' ? 'Research Paper' :
                       source.engine === 'google_news' ? 'News' :
                       source.engine === 'google_patents' ? 'Patent' :
                       source.engine === 'internal_docs' ? 'Your File' : 'Website'}
                    </span>
                  </div>

                  {source.publicationDate && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {source.publicationDate}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px', lineHeight: 1.35 }}>
                  {source.url && !source.url.startsWith('#') ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'flex-start', gap: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#f8fafc'}
                    >
                      <span>{source.title || 'Untitled Source'}</span>
                      <ExternalLink size={13} style={{ flexShrink: 0, marginTop: '3px' }} />
                    </a>
                  ) : (
                    <span>{source.title || 'Your Uploaded File'}</span>
                  )}
                </h4>

                {/* Snippet */}
                {source.snippet && (
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.45 }}>
                    "{source.snippet}"
                  </p>
                )}

                {/* Authors & Publication */}
                {source.authors && (
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <strong style={{ color: '#fbbf24' }}>Authors:</strong> {source.authors}
                  </div>
                )}

                {source.publication && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <strong>Published in:</strong> {source.publication}
                  </div>
                )}

                {source.patentNumber && (
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginBottom: '4px' }}>
                    <strong>Patent ID:</strong> {source.patentNumber}
                  </div>
                )}

                {source.assignee && (
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <strong style={{ color: '#34d399' }}>Owner / Company:</strong> {source.assignee}
                  </div>
                )}

                {/* Footer Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {source.citationCount && (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        ⭐ Cited by {source.citationCount} papers
                      </span>
                    )}

                    {source.pdfUrl && (
                      <a
                        href={source.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge badge-blue"
                        style={{ fontSize: '0.7rem', textDecoration: 'none' }}
                      >
                        <FileDown size={11} /> Read PDF
                      </a>
                    )}
                  </div>

                  {source.url && !source.url.startsWith('#') && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.72rem', color: '#06b6d4', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      Visit Website <ExternalLink size={11} />
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
