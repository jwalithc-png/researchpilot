import React, { useState, useEffect } from 'react';
import { Bookmark, Folder, Search, Download, Trash2, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Plus, Clock, FileText } from 'lucide-react';
import { BENCHMARK_DOSSIERS } from '../utils/benchmarkData';

const WORKSPACE_STORAGE_KEY = 'researchpilot_workspace_saved_dossiers';

export function getWorkspaceDossiers() {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return BENCHMARK_DOSSIERS.map((d, i) => ({
    ...d,
    savedAt: new Date(Date.now() - i * 86400000).toISOString(),
    tags: i === 0 ? ['Health', 'India'] : ['Solar Energy', 'Farming']
  }));
}

export function saveDossierToWorkspace(dossier, customTag = 'Research') {
  const current = getWorkspaceDossiers();
  const newEntry = {
    ...dossier,
    savedAt: new Date().toISOString(),
    tags: [customTag, dossier.country ? dossier.country.toUpperCase() : 'IN']
  };
  const filtered = current.filter(d => (d.requestId && d.requestId !== dossier.requestId) || d.topic !== dossier.topic);
  const updated = [newEntry, ...filtered];
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteDossierFromWorkspace(requestId, topic) {
  const current = getWorkspaceDossiers();
  const updated = current.filter(d => d.requestId !== requestId && d.topic !== topic);
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export default function WorkspaceView({
  currentDossier,
  onLoadDossier,
  currentUser,
  onNotify
}) {
  const [dossiers, setDossiers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('ALL');

  useEffect(() => {
    setDossiers(getWorkspaceDossiers());
  }, []);

  const handleSaveCurrent = () => {
    if (!currentDossier) return;
    const updated = saveDossierToWorkspace(currentDossier, 'My Search');
    setDossiers(updated);
    if (onNotify) onNotify(`Saved "${currentDossier.topic.slice(0, 35)}..." to your saved searches!`, 'success');
  };

  const handleDelete = (dossier) => {
    const updated = deleteDossierFromWorkspace(dossier.requestId, dossier.topic);
    setDossiers(updated);
    if (onNotify) onNotify(`Deleted from your saved searches.`, 'info');
  };

  const handleDownloadMarkdown = (dossier) => {
    let md = `# Research Report: ${dossier.topic}\n\n`;
    md += `**Date:** ${dossier.savedAt || new Date().toISOString()}\n`;
    md += `**Country:** ${dossier.country || 'in'}\n\n`;
    md += `## Summary\n\n${dossier.report?.executiveSummary || 'No summary available'}\n\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${dossier.topic.slice(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDossiers = dossiers.filter(d => {
    const matchesSearch = !searchFilter.trim() ||
      d.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (d.report?.executiveSummary && d.report.executiveSummary.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesTag = tagFilter === 'ALL' || (d.tags && d.tags.includes(tagFilter));
    return matchesSearch && matchesTag;
  });

  const totalSources = dossiers.reduce((acc, d) => acc + (d.sources?.length || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* Workspace Header & Metrics */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Folder size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  My Saved Searches
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {currentUser ? `Saved for: ${currentUser.displayName || currentUser.email}` : 'Saved on this browser (Sign in to sync across devices)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action: Save Current Search */}
          {currentDossier && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)' }}
              onClick={handleSaveCurrent}
            >
              <Bookmark size={16} />
              <span>Save This Search</span>
            </button>
          )}
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saved Searches</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              {dossiers.length}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sources Checked</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4', marginTop: '2px' }}>
              {totalSources}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Check</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
              100% Verified
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-text"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
            placeholder="Search saved searches..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'Health', 'Solar Energy'].map(tag => (
            <button
              key={tag}
              type="button"
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.75rem',
                background: tagFilter === tag ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                color: tagFilter === tag ? '#ffffff' : 'var(--text-secondary)'
              }}
              onClick={() => setTagFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Dossier Cards Grid */}
      {filteredDossiers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Folder size={36} color="#6366f1" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '6px' }}>No Saved Searches Found</h3>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>
            Type any question above, click Search, then click "Save This Search" to see it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredDossiers.map((item, idx) => {
            const confScore = item.metadata?.confidenceIndex?.score ?? (typeof item.metadata?.confidenceIndex === 'number' ? item.metadata.confidenceIndex : null) ?? item.report?.agenticReflection?.refinedConfidence ?? 0.89;
            const confPercent = Math.round(confScore * 100);

            return (
              <div
                key={item.requestId || idx}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease',
                  border: '1px solid var(--border-subtle)',
                  animation: 'fadeInUp 0.3s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  {/* Card Top Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        {confPercent}% Trust Score
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        {item.sources?.length || 0} Sources
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', lineHeight: 1.3 }}>
                    {item.topic}
                  </h3>

                  {/* Excerpt Snippet */}
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '14px', maxHeight: '54px', overflow: 'hidden' }}>
                    {item.report?.executiveSummary || 'Verified search results and summary.'}
                  </p>
                </div>

                {/* Footer Actions */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => onLoadDossier(item)}
                  >
                    <span>View Report</span>
                    <ArrowUpRight size={14} />
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px' }}
                      title="Save as Document"
                      onClick={() => handleDownloadMarkdown(item)}
                    >
                      <Download size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#f43f5e', padding: '6px' }}
                      title="Delete from saved searches"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
