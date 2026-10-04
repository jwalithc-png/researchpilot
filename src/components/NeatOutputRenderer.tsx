import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Bookmark, 
  ChevronRight,
  ShieldCheck,
  Brain
} from 'lucide-react';

interface NeatOutputRendererProps {
  content: any;
  title?: string;
  className?: string;
}

export const NeatOutputRenderer: React.FC<NeatOutputRendererProps> = ({
  content,
  title,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Helper to safely parse JSON if content is a JSON string
  const parsedData = useMemo(() => {
    if (!content) return null;
    if (typeof content === 'object') return content;

    if (typeof content === 'string') {
      const trimmed = content.trim();

      // Check if wrapped in markdown code fence
      let candidate = trimmed;
      const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (fenceMatch) {
        candidate = fenceMatch[1].trim();
      }

      if (
        (candidate.startsWith('{') && candidate.endsWith('}')) ||
        (candidate.startsWith('[') && candidate.endsWith(']'))
      ) {
        try {
          return JSON.parse(candidate);
        } catch {
          // If parsing fails, fall back to text
          return null;
        }
      }
    }
    return null;
  }, [content]);

  // Convert raw text into plain readable string for copy
  const getPlainSummaryText = (): string => {
    if (typeof content === 'string') {
      return content.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    }
    if (parsedData) {
      return JSON.stringify(parsedData, null, 2);
    }
    return String(content || '');
  };

  const handleCopy = () => {
    const text = getPlainSummaryText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert key names like 'potentialResearchGaps' or 'confidence_score' to 'Potential Research Gaps'
  const formatKeyName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  // Check if parsed data matches a Validation Report schema
  const isValidationReport = 
    parsedData && 
    typeof parsedData === 'object' && 
    !Array.isArray(parsedData) &&
    ('isValid' in parsedData || 'confidenceScore' in parsedData || 'reasoning' in parsedData);

  // Render Validation Assessment
  const renderValidationReport = (val: any) => {
    const isValid = val.isValid !== false;
    const score = typeof val.confidenceScore === 'number' 
      ? Math.round(val.confidenceScore <= 1 ? val.confidenceScore * 100 : val.confidenceScore)
      : null;

    return (
      <div className="space-y-6">
        {/* Status & Confidence Banner */}
        <div className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
          isValid 
            ? 'bg-emerald-950/40 border-emerald-500/30' 
            : 'bg-amber-950/40 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isValid 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {isValid ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h4 className="text-white font-serif text-lg tracking-tight font-medium">
                {isValid ? 'Empirically Validated & Grounded' : 'Validation Feedback & Considerations'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {isValid 
                  ? 'All conclusions and directions are verified against source literature without hallucinations.'
                  : 'Certain hypotheses require additional citations or empirical confirmation.'}
              </p>
            </div>
          </div>

          {score !== null && (
            <div className="flex flex-col sm:items-end shrink-0 pl-14 sm:pl-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confidence:</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">{score}%</span>
              </div>
              <div className="w-32 bg-white/10 rounded-full h-2 mt-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Reasoning */}
        {val.reasoning && (
          <div className="bg-[#0b1728]/70 border border-white/10 rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Scientific Evaluation</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed font-sans">
              {val.reasoning}
            </p>
          </div>
        )}

        {/* Deficiencies or Notes */}
        {Array.isArray(val.deficiencies) && val.deficiencies.length > 0 && (
          <div className="bg-[#0b1728]/70 border border-amber-500/20 rounded-xl p-5 shadow-lg space-y-3">
            <h5 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>Identified Boundary Conditions / Observations</span>
            </h5>
            <ul className="space-y-2">
              {val.deficiencies.map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render an array of structured objects (e.g. gaps, directions, paper comparisons)
  const renderArrayItems = (items: any[]) => {
    return (
      <div className="space-y-4">
        {items.map((item, idx) => {
          if (typeof item !== 'object' || item === null) {
            return (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-[#0b1728]/60 border border-white/10 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-200 leading-relaxed font-sans">{String(item)}</span>
              </div>
            );
          }

          // Extract primary title from common keys
          const primaryTitle = 
            item.title || 
            item.potentialGap || 
            item.gap || 
            item.direction || 
            item.name || 
            item.problem ||
            `Item ${idx + 1}`;

          // Extract confidence if present
          const itemConfidence = 
            item.confidence !== undefined ? item.confidence :
            item.confidenceScore !== undefined ? item.confidenceScore : null;

          return (
            <div 
              key={idx} 
              className="bg-[#0b1728]/70 border border-white/10 hover:border-cyan-500/40 rounded-xl p-5 shadow-xl transition-all duration-300 space-y-4 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-white font-serif text-base tracking-tight font-medium">
                    {primaryTitle}
                  </h4>
                </div>

                {itemConfidence !== null && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
                    {typeof itemConfidence === 'number' && itemConfidence <= 1 
                      ? `${Math.round(itemConfidence * 100)}% Confidence` 
                      : `Confidence: ${itemConfidence}`}
                  </span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {Object.entries(item).map(([key, val]) => {
                  if (['title', 'potentialGap', 'gap', 'direction', 'name', 'confidence', 'confidenceScore'].includes(key)) {
                    return null;
                  }
                  if (val === null || val === undefined || val === '') return null;

                  return (
                    <div key={key} className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400/90 flex items-center gap-1.5">
                        <ChevronRight size={12} className="text-cyan-400" />
                        {formatKeyName(key)}
                      </span>
                      <div className="pl-4 text-slate-200 text-sm leading-relaxed">
                        {Array.isArray(val) ? (
                          <ul className="space-y-1.5 mt-1">
                            {val.map((v, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                                <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : typeof val === 'object' ? (
                          <div className="p-3 bg-[#060B17]/60 rounded-lg border border-white/5 space-y-1 mt-1">
                            {Object.entries(val).map(([subK, subV]) => (
                              <div key={subK} className="text-xs">
                                <span className="text-slate-400 font-medium">{formatKeyName(subK)}: </span>
                                <span className="text-slate-200">{String(subV)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>{String(val)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render generic object keys as styled sections
  const renderObjectFields = (obj: Record<string, any>) => {
    return (
      <div className="space-y-5">
        {Object.entries(obj).map(([key, value]) => {
          if (value === null || value === undefined || value === '') return null;

          return (
            <div key={key} className="bg-[#0b1728]/70 border border-white/10 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2 border-b border-white/5 pb-2">
                <Bookmark size={14} className="text-cyan-400" />
                {formatKeyName(key)}
              </h4>

              <div className="text-slate-200 text-sm leading-relaxed font-sans">
                {Array.isArray(value) ? (
                  renderArrayItems(value)
                ) : typeof value === 'object' ? (
                  <div className="space-y-3 pl-2">
                    {Object.entries(value).map(([k, v]) => (
                      <div key={k} className="p-3 bg-[#060B17]/60 rounded-lg border border-white/5">
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                          {formatKeyName(k)}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{String(value)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Rich Neat Markdown / Structured Text Renderer
  const renderFormattedText = (rawStr: string) => {
    // Split into logical blocks or lines
    const lines = rawStr.split('\n');
    const elements: React.ReactNode[] = [];

    let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;

    const flushList = () => {
      if (!currentList) return;
      if (currentList.type === 'bullet') {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 my-3 pl-2">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="space-y-2.5 my-3 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-cyan-500/30">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        flushList();
        elements.push(<div key={`space-${lineIdx}`} className="h-2" />);
        return;
      }

      // Check Markdown Headers: #, ##, ###, ####
      if (trimmed.startsWith('#')) {
        flushList();
        const headerLevel = trimmed.match(/^#+/)?.[0].length || 1;
        const text = trimmed.replace(/^#+\s*/, '');

        if (headerLevel === 1) {
          elements.push(
            <h2 key={`h1-${lineIdx}`} className="text-xl sm:text-2xl font-serif text-white tracking-tight font-medium mt-6 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              <span>{text}</span>
            </h2>
          );
        } else if (headerLevel === 2) {
          elements.push(
            <h3 key={`h2-${lineIdx}`} className="text-lg font-serif text-cyan-200 font-medium mt-5 mb-2 flex items-center gap-2">
              <ChevronRight size={16} className="text-cyan-400" />
              <span>{text}</span>
            </h3>
          );
        } else {
          elements.push(
            <h4 key={`h3-${lineIdx}`} className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mt-4 mb-1">
              {text}
            </h4>
          );
        }
        return;
      }

      // Bullet lists: - , * , •
      if (/^[-*•]\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        if (currentList && currentList.type === 'bullet') {
          currentList.items.push(itemText);
        } else {
          flushList();
          currentList = { type: 'bullet', items: [itemText] };
        }
        return;
      }

      // Numbered lists: 1. , 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s+/, '');
        if (currentList && currentList.type === 'number') {
          currentList.items.push(itemText);
        } else {
          flushList();
          currentList = { type: 'number', items: [itemText] };
        }
        return;
      }

      // Blockquotes: >
      if (trimmed.startsWith('>')) {
        flushList();
        const quoteText = trimmed.replace(/^>\s*/, '');
        elements.push(
          <div key={`quote-${lineIdx}`} className="p-4 my-3 bg-cyan-950/30 border-l-4 border-cyan-400 rounded-r-xl text-sm text-cyan-100 italic">
            {renderInlineFormatting(quoteText)}
          </div>
        );
        return;
      }

      // Standard paragraph
      flushList();

      // Check if this line looks like "Category / Section: Content"
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 35 && !trimmed.startsWith('http')) {
        const label = trimmed.substring(0, colonIdx);
        const rest = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <div key={`field-${lineIdx}`} className="my-2 text-sm">
            <span className="font-semibold text-cyan-300 font-sans">{label}: </span>
            <span className="text-slate-200 leading-relaxed">{renderInlineFormatting(rest)}</span>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${lineIdx}`} className="text-sm text-slate-200 leading-relaxed font-sans my-1.5">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  // Helper for inline bold **text** or italic *text*
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Quick regex replace for bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Action / Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Brain size={16} />
          <span>{title ? title : 'Synthesized Research Dossier'}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          title="Copy formatted findings to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Text</span>
            </>
          )}
        </button>
      </div>

      {/* Content Body */}
      <div className="leading-relaxed">
        {isValidationReport ? (
          renderValidationReport(parsedData)
        ) : Array.isArray(parsedData) ? (
          renderArrayItems(parsedData)
        ) : parsedData && typeof parsedData === 'object' ? (
          renderObjectFields(parsedData)
        ) : (
          <div className="space-y-2">
            {renderFormattedText(typeof content === 'string' ? content : JSON.stringify(content, null, 2))}
          </div>
        )}
      </div>
    </div>
  );
};
