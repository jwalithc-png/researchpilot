import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '800px',
          margin: '40px auto',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          color: '#f8fafc',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fb7185'
          }}>
            <AlertTriangle size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px', color: '#fca5a5' }}>
            Interface Render Recovery
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 20px' }}>
            An unexpected error occurred while rendering the intelligence view. Your search data is safe.
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#fda4af',
              overflowX: 'auto',
              maxHeight: '140px'
            }}>
              {this.state.error.toString()}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#6366f1' }}
              onClick={this.handleReset}
            >
              <RefreshCw size={16} />
              <span>Reset & Restore Dossier</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
