import React, { useState, useEffect } from 'react';
import { WelcomePage } from './pages/WelcomePage';
import { AuthPage } from './pages/AuthPage';
import { CreateWorkspacePage } from './pages/CreateWorkspacePage';
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AuthProvider, useAuth } from './context/AuthContext';

export type Page = 'landing' | 'auth' | 'create-workspace' | 'workspace';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    const handleHash = () => {
      const hash = window.location.hash;

      if (hash === '#workspace') {
        if (!isAuthenticated) {
          setCurrentPage('auth');
          setAuthMode('login');
          window.location.hash = '#login';
        } else {
          setCurrentPage('workspace');
        }
      } else if (hash === '#create-workspace' || hash === '#create') {
        if (!isAuthenticated) {
          setCurrentPage('auth');
          setAuthMode('login');
          window.location.hash = '#login';
        } else {
          setCurrentPage('create-workspace');
        }
      } else if (hash === '#auth' || hash === '#login') {
        if (isAuthenticated) {
          setCurrentPage('create-workspace');
          window.location.hash = '#create-workspace';
        } else {
          setCurrentPage('auth');
          setAuthMode('login');
        }
      } else if (hash === '#register') {
        if (isAuthenticated) {
          setCurrentPage('create-workspace');
          window.location.hash = '#create-workspace';
        } else {
          setCurrentPage('auth');
          setAuthMode('register');
        }
      } else {
        setCurrentPage('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAuthenticated, loading]);

  const navigate = (page: Page) => {
    // Enforce protected routes
    if (!isAuthenticated && (page === 'workspace' || page === 'create-workspace')) {
      navigateToAuth('login');
      return;
    }

    setCurrentPage(page);
    window.location.hash = `#${page === 'landing' ? '' : page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setCurrentPage('auth');
    window.location.hash = mode === 'register' ? '#register' : '#auth';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    navigateToAuth('login');
  };

  // Loading state while Firebase auth initializes persistence
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B17] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-base text-slate-400">Loading ResearchPilot...</p>
      </div>
    );
  }

  switch (currentPage) {
    case 'workspace':
      if (!isAuthenticated) {
        return (
          <AuthPage
            initialMode="login"
            onNavigateToLanding={() => navigate('landing')}
            onNavigateToCreateWorkspace={() => navigate('create-workspace')}
          />
        );
      }
      return (
        <ResearchWorkspacePage
          onNavigateToCreateWorkspace={() => navigate('create-workspace')}
          onNavigateToLanding={() => navigate('landing')}
          onLogout={handleLogout}
        />
      );

    case 'create-workspace':
      if (!isAuthenticated) {
        return (
          <AuthPage
            initialMode="login"
            onNavigateToLanding={() => navigate('landing')}
            onNavigateToCreateWorkspace={() => navigate('create-workspace')}
          />
        );
      }
      return (
        <CreateWorkspacePage
          onNavigateToAuth={() => navigateToAuth('login')}
          onNavigateToWorkspace={() => navigate('workspace')}
          onLogout={handleLogout}
        />
      );

    case 'auth':
      return (
        <AuthPage
          initialMode={authMode}
          onNavigateToLanding={() => navigate('landing')}
          onNavigateToCreateWorkspace={() => navigate('create-workspace')}
        />
      );

    default:
      return <WelcomePage onNavigateToAuth={navigateToAuth} />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </AuthProvider>
  );
};

export default App;
