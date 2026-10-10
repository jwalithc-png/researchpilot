import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Plus, Sparkles, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { PRESET_DOCUMENTS } from '../utils/benchmarkData';

const MAX_DOCUMENTS = 50;

export default function DocumentUploader({
  documents = [],
  setDocuments,
  includeDocuments,
  setIncludeDocuments,
  onNotify
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const fileInputRef = useRef(null);

  const remainingSlots = MAX_DOCUMENTS - documents.length;
  const fillPercentage = (documents.length / MAX_DOCUMENTS) * 100;

  // Process files
  const handleProcessFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    const available = MAX_DOCUMENTS - documents.length;

    if (available <= 0) {
      if (onNotify) onNotify(`File limit reached (Maximum ${MAX_DOCUMENTS} files allowed).`, 'warning');
      return;
    }

    const filesToRead = filesArray.slice(0, available);
    if (filesArray.length > available && onNotify) {
      onNotify(`Added first ${available} files. Maximum limit is ${MAX_DOCUMENTS}.`, 'warning');
    }

    let loadedCount = 0;
    const newDocs = [];

    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        if (text && typeof text === 'string') {
          newDocs.push({
            title: file.name.replace(/\.[^/.]+$/, ""),
            content: text.slice(0, 15000),
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            fileType: file.type || file.name.split('.').pop() || 'text'
          });
        }

        loadedCount++;
        if (loadedCount === filesToRead.length) {
          setDocuments([...documents, ...newDocs]);
          setIncludeDocuments(true);
          if (onNotify) onNotify(`Added ${newDocs.length} files to your research.`, 'success');
        }
      };

      reader.onerror = () => {
        loadedCount++;
      };

      reader.readAsText(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleProcessFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    handleProcessFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddManual = () => {
    if (!manualTitle.trim() || !manualContent.trim()) return;
    if (documents.length >= MAX_DOCUMENTS) {
      if (onNotify) onNotify(`Maximum limit of ${MAX_DOCUMENTS} files reached.`, 'warning');
      return;
    }

    setDocuments([
      ...documents,
      {
        title: manualTitle.trim(),
        content: manualContent.trim(),
        fileSize: (manualContent.length / 1024).toFixed(1) + ' KB',
        fileType: 'text/plain'
      }
    ]);
    setManualTitle('');
    setManualContent('');
    setShowManualAdd(false);
    setIncludeDocuments(true);
  };

  const handleAddPresets = () => {
    const toAdd = PRESET_DOCUMENTS.filter(p => !documents.some(d => d.title === p.title));
    const allowed = toAdd.slice(0, MAX_DOCUMENTS - documents.length);
    if (allowed.length > 0) {
      setDocuments([...documents, ...allowed]);
      setIncludeDocuments(true);
      if (onNotify) onNotify(`Added ${allowed.length} sample documents.`, 'success');
    }
  };

  const handleRemoveDoc = (index) => {
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
    if (updated.length === 0) setIncludeDocuments(false);
  };

  const handleClearAll = () => {
    setDocuments([]);
    setIncludeDocuments(false);
  };

  return (
    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
      
      {/* Top Header & Gauge Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '1rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Layers size={18} /> Add Your Own Files & Notes
            </h4>
            <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
              Up to 50 Files
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Upload PDFs, text files, or notes. The AI will compare them with web results and cite them as <code>[D001]</code>, <code>[D002]</code>, etc.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={includeDocuments}
              onChange={(e) => setIncludeDocuments(e.target.checked)}
              style={{ accentColor: '#a855f7' }}
            />
            <span>Include in Search</span>
          </label>

          {documents.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: '#f43f5e', fontSize: '0.75rem' }}
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Capacity Progress Bar Gauge */}
      <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Files Added: <strong style={{ color: fillPercentage >= 100 ? '#f43f5e' : '#c084fc' }}>{documents.length} of {MAX_DOCUMENTS} files</strong>
          </span>
          <span style={{ color: fillPercentage >= 100 ? '#f43f5e' : '#34d399', fontWeight: 600 }}>
            {remainingSlots > 0 ? `${remainingSlots} slots free` : 'Limit reached'}
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${fillPercentage}%`,
              height: '100%',
              background: fillPercentage >= 100
                ? '#f43f5e'
                : 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#c084fc' : 'rgba(168, 85, 247, 0.3)'}`,
          background: isDragging ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.04)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          textAlign: 'center',
          cursor: remainingSlots > 0 ? 'pointer' : 'not-allowed',
          transition: 'all 0.25s ease',
          marginBottom: '16px',
          boxShadow: isDragging ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".txt,.md,.json,.csv,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={remainingSlots <= 0}
        />

        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(168, 85, 247, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          color: '#c084fc'
        }}>
          <Upload size={22} />
        </div>

        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
          {remainingSlots > 0 ? 'Drop files here or click to browse' : 'Maximum 50 files limit reached'}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          You can select multiple files at once (.txt, .pdf, .md, .csv) • Up to 50 files supported
        </p>
      </div>

      {/* Quick Action Toolbar: Sample files & Type manual note */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
            onClick={handleAddPresets}
            disabled={remainingSlots <= 0}
          >
            <Sparkles size={14} />
            <span>Load Sample Guidelines</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
            onClick={() => setShowManualAdd(!showManualAdd)}
            disabled={remainingSlots <= 0}
          >
            <Plus size={14} />
            <span>Type or Paste a Note</span>
          </button>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {documents.length} files attached
        </span>
      </div>

      {/* Manual Add Excerpt Drawer */}
      {showManualAdd && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e9d5ff' }}>Paste Your Note</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowManualAdd(false)}>Cancel</button>
          </div>
          <input
            type="text"
            className="input-text"
            placeholder="Note title (e.g., Hospital Report 2026)"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            style={{ marginBottom: '8px', fontSize: '0.85rem' }}
          />
          <textarea
            className="input-textarea"
            rows={3}
            placeholder="Type or paste text content here..."
            value={manualContent}
            onChange={(e) => setManualContent(e.target.value)}
            style={{ marginBottom: '10px', fontSize: '0.8rem' }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ background: '#7e22ce' }}
            onClick={handleAddManual}
          >
            Add Note
          </button>
        </div>
      )}

      {/* Uploaded Documents Grid */}
      {documents.length > 0 && (
        <div style={{
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '10px',
          paddingRight: '4px'
        }}>
          {documents.map((doc, idx) => {
            const docId = `D${String(idx + 1).padStart(3, '0')}`;
            return (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  transition: 'transform 0.2s ease',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ flex: 1, marginRight: '10px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      background: 'rgba(168, 85, 247, 0.3)',
                      color: '#e9d5ff',
                      borderRadius: '4px'
                    }}>
                      [{docId}]
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3, maxHeight: '36px', overflow: 'hidden' }}>
                    {doc.content}
                  </div>

                  {doc.fileSize && (
                    <div style={{ fontSize: '0.68rem', color: '#a855f7', marginTop: '4px' }}>
                      {doc.fileSize}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#f43f5e', padding: '4px', flexShrink: 0 }}
                  onClick={() => handleRemoveDoc(idx)}
                  title="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
