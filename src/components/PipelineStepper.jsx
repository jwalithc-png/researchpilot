import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Cpu, FileSearch, ShieldCheck, Sparkles, Database } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: "1. Reading Your Question",
    desc: "Understanding your search topic and keywords",
    icon: <FileSearch size={16} />
  },
  {
    id: 2,
    title: "2. Searching 4 Sources",
    desc: "Checking Google Web, Research Papers, News & Patents",
    icon: <Database size={16} />
  },
  {
    id: 3,
    title: "3. Writing AI Summary",
    desc: "Summarizing findings and key facts clearly",
    icon: <Sparkles size={16} />
  },
  {
    id: 4,
    title: "4. Checking Your Files",
    desc: "Comparing with your uploaded notes & documents",
    icon: <Cpu size={16} />
  },
  {
    id: 5,
    title: "5. Fact-Checking Facts",
    desc: "Double-checking each claim with real source links",
    icon: <ShieldCheck size={16} />
  },
  {
    id: 6,
    title: "6. Building Final Report",
    desc: "Putting together your clean, verified report",
    icon: <CheckCircle2 size={16} />
  }
];

export default function PipelineStepper({ isLoading }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Step progression simulation
    let current = 0;
    const interval = setInterval(() => {
      if (current < STEPS.length - 1) {
        current += 1;
        setCurrentStepIndex(current);
      }
    }, 2200);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pulse-dot" style={{ backgroundColor: '#06b6d4' }}></div>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#f8fafc' }}>
            AI Assistant is Working on Your Research
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          <Clock size={14} />
          <span>{elapsedSeconds}s elapsed</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? '#6366f1' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className={isActive ? 'shimmer-active' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  color: isDone ? '#34d399' : isActive ? '#818cf8' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {isDone ? <CheckCircle2 size={16} /> : step.icon}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isDone ? '#34d399' : isActive ? '#818cf8' : 'var(--text-muted)' }}>
                  {isDone ? 'DONE' : isActive ? 'WORKING' : 'WAITING'}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', lineHeight: 1.2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
