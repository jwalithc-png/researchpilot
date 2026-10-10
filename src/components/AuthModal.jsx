import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, ShieldCheck, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginDemoResearcher } from '../utils/firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerWithEmail(email, password, displayName);
    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    const res = await loginDemoResearcher();
    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(3, 5, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)',
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', padding: '6px' }}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.4)'
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Sign In to Your Account
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sign in to save your searches and view them anytime on any device.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: tab === 'login' ? 'var(--accent-primary)' : 'transparent',
              color: tab === 'login' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: tab === 'login' ? 700 : 500
            }}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: tab === 'register' ? 'var(--accent-primary)' : 'transparent',
              color: tab === 'register' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: tab === 'register' ? 700 : 500
            }}
            onClick={() => setTab('register')}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
          {tab === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Your Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  className="input-text"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Rahul Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="input-text"
                style={{ paddingLeft: '40px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                minLength={6}
                className="input-text"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginBottom: '14px' }}
            disabled={loading}
          >
            {loading ? <span className="animate-spin">◷</span> : tab === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            <span>{tab === 'login' ? 'Sign In' : 'Create Free Account'}</span>
          </button>
        </form>

        {/* Quick Demo Button */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Want to try it right away?
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            onClick={handleQuickDemo}
            disabled={loading}
          >
            <Sparkles size={16} color="#fbbf24" />
            <span>1-Click Guest Sign-In</span>
          </button>
        </div>

      </div>
    </div>
  );
}
