import { useState, useEffect, useCallback } from 'react';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import { hasPat } from '../../lib/pat-storage';
import AddRepositoryModal from './AddRepositoryModal';
import ConfigureRepositoryModal from './ConfigureRepositoryModal';

type View = 'repos' | 'runs' | 'settings';

interface ManagedRepo {
  fullName: string;
  url: string;
  addedAt: number;
}

interface RepoConfig {
  repoFullName: string;
  agent: 'qwen' | 'claude' | 'custom';
  customAgentCommand?: string;
  prompt: string;
  branch: string;
  autoCommit: boolean;
}

interface NavItem {
  key: View;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'repos',
    label: 'Repositories',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
  },
  {
    key: 'runs',
    label: 'Run History',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724
            1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37
            2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756
            2.924 0 3.35a1.724 1.724 0 00-1.066
            2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0
            00-2.573 1.066c-.426 1.756-2.924 1.756-3.35
            0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724
            1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924
            0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31
            2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function DashboardApp() {
  const { isAuthenticated, isLoading, username, avatarUrl, logout } =
    useGitHubAuth();
  const [activeView, setActiveView] = useState<View>('repos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [managedRepos, setManagedRepos] = useState<ManagedRepo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [configRepo, setConfigRepo] = useState<string | null>(null);

  // Load managed repos from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('gitorbit_managed_repos');
    if (raw) {
      try {
        setManagedRepos(JSON.parse(raw));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const handleRepoAdded = useCallback((repo: ManagedRepo) => {
    setManagedRepos((prev) => {
      const next = [...prev, repo];
      localStorage.setItem('gitorbit_managed_repos', JSON.stringify(next));
      return next;
    });
    setShowAddModal(false);
  }, []);

  const handleRepoRemoved = useCallback((fullName: string) => {
    setManagedRepos((prev) => {
      const next = prev.filter((r) => r.fullName !== fullName);
      localStorage.setItem('gitorbit_managed_repos', JSON.stringify(next));
      // Also remove config
      localStorage.removeItem(`gitorbit_config_${fullName}`);
      return next;
    });
  }, []);

  const handleConfigSaved = useCallback((_config: RepoConfig) => {
    setConfigRepo(null);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasPat()) {
      window.location.href = '/setup';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            />
            <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent-light"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <p className="text-text-secondary text-sm animate-pulse">
            Loading dashboard&hellip;
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ═══════════ Mobile sidebar overlay ═══════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════ Sidebar ═══════════ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border/60 glass flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar header / logo */}
        <div className="px-5 py-5 border-b border-border/40">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10
                      10-4.477 10-10S17.523 2 12 2zm0 1.5a8.5 8.5
                      0 1 1 0 17 8.5 8.5 0 0 1 0-17z"
                    opacity="0.4"
                  />
                </svg>
              </div>
              <div
                className="absolute -inset-1 rounded-full border border-primary/20 animate-orbit"
                style={{ animationDuration: '4s' }}
              />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Git<span className="text-primary">Orbit</span>
            </span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveView(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === item.key
                ? 'bg-primary/15 text-accent-light'
                : 'text-text-muted hover:text-foreground hover:bg-secondary/60'
                }`}
            >
              {item.icon}
              {item.label}
              {item.key === 'runs' && (
                <span className="ml-auto text-xs text-text-muted">0</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-border/40">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                  01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0
                  013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ═══════════ Main area ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-border/60 glass sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-text-muted hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2 className="text-sm font-semibold text-text-secondary capitalize hidden sm:block">
                {activeView === 'runs' ? 'Run History' : activeView}
              </h2>
            </div>

            {avatarUrl && username && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-text-secondary hidden sm:block">
                  {username}
                </span>
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-7 h-7 rounded-full border border-border"
                />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeView === 'repos' && (
            <RepositoriesView
              repos={managedRepos}
              onAdd={() => setShowAddModal(true)}
              onRemove={handleRepoRemoved}
              onConfigure={setConfigRepo}
            />
          )}
          {activeView === 'runs' && <RunsView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <AddRepositoryModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleRepoAdded}
        />
      )}

      {/* Configure Repository Modal */}
      {configRepo && (
        <ConfigureRepositoryModal
          repoFullName={configRepo}
          onClose={() => setConfigRepo(null)}
          onSave={handleConfigSaved}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Repositories View
   ══════════════════════════════════════════════════════ */
interface RepositoriesViewProps {
  repos: ManagedRepo[];
  onAdd: () => void;
  onRemove: (fullName: string) => void;
  onConfigure: (fullName: string) => void;
}

function RepositoriesView({
  repos,
  onAdd,
  onRemove,
  onConfigure,
}: RepositoriesViewProps) {
  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Repositories
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your GitHub repositories and dispatch AI agents.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent-hover text-white text-sm font-medium transition-all glow-ring"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Repository
        </button>
      </div>

      {repos.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-border/60 glass p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No repositories yet
          </h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
            Add a repository to start orchestrating AI coding agents. We&apos;ll
            clone, run prompts, and open PRs automatically.
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/50 text-sm font-medium transition-colors glass"
          >
            <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add your first repository
          </button>
        </div>
      ) : (
        /* Repo list */
        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo.fullName}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 glass transition-colors hover:border-primary/30"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono font-medium text-accent-light hover:underline truncate block"
                >
                  {repo.fullName}
                </a>
                <p className="text-xs text-text-muted mt-1">
                  Added {new Date(repo.addedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onConfigure(repo.fullName)}
                  className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:bg-secondary/50 transition-colors"
                >
                  Configure
                </button>
                <button
                  onClick={() => onRemove(repo.fullName)}
                  className="p-1.5 text-text-muted hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                  aria-label="Remove repository"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Runs View
   ══════════════════════════════════════════════════════ */
function RunsView() {
  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Run History
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track all AI agent dispatches and their outcomes.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent-hover text-white text-sm font-medium transition-all glow-ring">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          New Run
        </button>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-border/60 glass p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No runs recorded
        </h3>
        <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
          Dispatch an AI agent to any repository to see its execution history,
          live logs, and results here.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Settings View
   ══════════════════════════════════════════════════════ */
function SettingsView() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure your GitOrbit environment.
        </p>
      </div>

      {/* Agent configuration */}
      <div className="rounded-xl border border-border/60 glass p-6">
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Default Agent
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Choose which AI coding agent to use when creating new runs.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              value: 'qwen',
              label: 'Qwen Code',
              desc: 'Open-source, fast, and cost-effective',
            },
            {
              value: 'claude',
              label: 'Claude Code',
              desc: 'Anthropic&apos;s advanced coding agent',
            },
          ].map((agent) => (
            <label
              key={agent.value}
              className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:border-primary/40 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="default-agent"
                value={agent.value}
                defaultChecked={agent.value === 'qwen'}
                className="mt-1 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {agent.label}
                </p>
                <p className="text-xs text-text-muted">{agent.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* State repository */}
      <div className="rounded-xl border border-border/60 glass p-6">
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          State Repository
        </h3>
        <p className="text-sm text-text-muted mb-4">
          All application state is stored in a dedicated GitHub repository that
          you control.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="owner/gitorbit-state"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background/80 text-text-primary font-mono text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button className="px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-hover text-white text-sm font-medium transition-all glow-ring">
            Save
          </button>
        </div>
      </div>

      {/* Token management */}
      <div className="rounded-xl border border-border/60 glass p-6">
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Token
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Your GitHub PAT is stored locally in your browser. You can clear it at
          any time.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('gitorbit_pat');
            localStorage.removeItem('gitorbit_pat_meta');
            window.location.href = '/setup';
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear token &amp; sign out
        </button>
      </div>
    </div>
  );
}
