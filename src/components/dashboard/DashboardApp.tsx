import { useState, useEffect } from 'react';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import { hasPat } from '../../lib/pat-storage';

export default function DashboardApp() {
  const { isAuthenticated, isLoading, username, avatarUrl, logout } = useGitHubAuth();
  const [activeView, setActiveView] = useState<'repos' | 'runs' | 'settings'>('repos');

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasPat()) {
      window.location.href = '/setup';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-bg-border bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <span className="font-bold text-lg">GitOrbit</span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              {avatarUrl && username && (
                <div className="flex items-center gap-3">
                  <img 
                    src={avatarUrl} 
                    alt={username}
                    className="w-8 h-8 rounded-full border border-bg-border"
                  />
                  <span className="text-sm font-mono text-text-secondary">{username}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="border-b border-bg-border bg-bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {(['repos', 'runs', 'settings'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeView === view
                    ? 'border-accent text-accent-light'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {view === 'repos' ? 'Repositories' : view === 'runs' ? 'Run History' : 'Settings'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'repos' && <RepositoriesView />}
        {activeView === 'runs' && <RunsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function RepositoriesView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Repositories</h2>
        <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
          Add Repository
        </button>
      </div>
      <div className="rounded-lg border border-bg-border bg-bg-surface p-12 text-center">
        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-text-secondary">No repositories added yet.</p>
        <p className="text-text-muted text-sm mt-2">Click "Add Repository" to get started.</p>
      </div>
    </div>
  );
}

function RunsView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Run History</h2>
        <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
          New Run
        </button>
      </div>
      <div className="rounded-lg border border-bg-border bg-bg-surface p-12 text-center">
        <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-text-secondary">No runs yet.</p>
        <p className="text-text-muted text-sm mt-2">Dispatch an AI agent to see your runs here.</p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-6">
        <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Agent</label>
              <select className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg focus:border-accent focus:outline-none">
                <option value="qwen">Qwen Code</option>
                <option value="claude">Claude Code</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
          <h3 className="text-lg font-semibold mb-4">State Repository</h3>
          <p className="text-text-secondary text-sm mb-4">
            All state is stored in a dedicated GitHub repository.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="owner/gitorbit-state"
              className="flex-1 px-4 py-2 rounded-lg border border-bg-border bg-bg focus:border-accent focus:outline-none font-mono text-sm"
            />
            <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
