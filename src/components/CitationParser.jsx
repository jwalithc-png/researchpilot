import React, { useState, useMemo } from 'react';
import { ExternalLink, BookOpen, FileText, Newspaper, ShieldCheck } from 'lucide-react';

const engineIcons = {
  google: <ExternalLink size={12} />,
  google_scholar: <BookOpen size={12} />,
  google_news: <Newspaper size={12} />,
  google_patents: <ShieldCheck size={12} />,
  internal_docs: <FileText size={12} />
};

export default function CitationParser({ text, sources = [], onSelectSource, highlightedSourceId }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Map of sources for fast lookup - MUST BE CALLED UNCONDITIONALLY on every render
  const sourceMap = useMemo(() => {
    const map = new Map();
    (sources || []).forEach(s => {
      const id = s?.sourceId || s?.id;
      if (id) map.set(String(id).toUpperCase(), s);
    });
    return map;
  }, [sources]);

  if (!text) return null;
  const safeText = typeof text === 'string' ? text : String(text || '');
  if (!safeText.trim()) return null;

  // Regex to match citation tokens like [S001], [D001], or [S001, S002]
  const citationRegex = /\[(S\d+|D\d+)(?:,\s*(S\d+|D\d+))*\]/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(safeText)) !== null) {
    const matchStart = match.index;
    const matchEnd = citationRegex.lastIndex;
    const fullMatch = match[0];

    // Push plain text before the citation
    if (matchStart > lastIndex) {
      elements.push(safeText.substring(lastIndex, matchStart));
    }

    // Extract individual citation IDs (e.g. S001, S002, D001)
    const idMatches = fullMatch.match(/(S\d+|D\d+)/g) || [];

    elements.push(
      <span key={`cite-group-${matchStart}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {idMatches.map((citationId) => {
          const upperId = citationId.toUpperCase();
          const source = sourceMap.get(upperId);
          const isDoc = upperId.startsWith('D');
          const isHighlighted = highlightedSourceId === upperId;

          return (
            <span
              key={`pill-${citationId}-${matchStart}`}
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setActiveTooltip(citationId)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <button
                type="button"
                className={`citation-pill ${isDoc ? 'doc-pill' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectSource) {
                    onSelectSource(upperId);
                  }
                }}
                title={`Click to view source ${citationId}`}
              >
                [{citationId}]
              </button>

              {/* Hover Popover */}
              {activeTooltip === citationId && source && (
                <div
                  className="citation-popover"
                  style={{
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-8px)',
                    zIndex: 9999
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge ${
                      source.engine === 'google_scholar' ? 'badge-amber' :
                      source.engine === 'google_news' ? 'badge-rose' :
                      source.engine === 'google_patents' ? 'badge-emerald' :
                      source.engine === 'internal_docs' ? 'badge-purple' : 'badge-blue'
                    }`}>
                      {engineIcons[source.engine] || <ExternalLink size={12} />}
                      {source.engine === 'google_scholar' ? 'Research Paper' :
                       source.engine === 'google_news' ? 'News Article' :
                       source.engine === 'google_patents' ? 'Patent' :
                       source.engine === 'internal_docs' ? 'Your File' : 'Google Web'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      ID: {upperId}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '6px', lineHeight: 1.3 }}>
                    {source.title || 'Untitled Source'}
                  </div>

                  {source.snippet && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.4, maxHeight: '80px', overflowY: 'auto' }}>
                      "{source.snippet}"
                    </div>
                  )}

                  {source.authors && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <strong>Authors:</strong> {source.authors}
                    </div>
                  )}

                  {source.assignee && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <strong>Company/Owner:</strong> {source.assignee}
                    </div>
                  )}

                  {source.citationCount && (
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: '6px' }}>
                      ⭐ Cited by {source.citationCount} papers
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                    {source.url && !source.url.startsWith('#') ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#06b6d4', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        Visit Website <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>Your Uploaded File</span>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => onSelectSource && onSelectSource(upperId)}
                    >
                      View in List →
                    </button>
                  </div>
                </div>
              )}
            </span>
          );
        })}
      </span>
    );

    lastIndex = matchEnd;
  }

  // Push remaining text
  if (lastIndex < safeText.length) {
    elements.push(safeText.substring(lastIndex));
  }

  return <span>{elements}</span>;
}
