import { useState, useCallback, useEffect } from 'react';
import { githubFetch } from '../../lib/github-api';

interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

interface AddRepositoryModalProps {
  onClose: () => void;
  onAdded: (repo: { fullName: string; url: string }) => void;
}

export default function AddRepositoryModal({
  onClose,
  onAdded,
}: AddRepositoryModalProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchRepos = async () => {
      try {
        const data = await githubFetch('/user/repos?per_page=100&sort=updated');
        if (!cancelled) {
          setRepos(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load repositories');
          setLoading(false);
        }
      }
    };

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!selected) return;

    setSaving(true);
    setError('');

    try {
      const repo = repos.find((r) => r.full_name === selected);
      if (!repo) throw new Error('Repository not found');

      const stateRepo = {
        fullName: repo.full_name,
        url: repo.html_url,
        addedAt: Date.now(),
      };

      onAdded(stateRepo);
    } catch {
      setError('Failed to add repository');
    } finally {
      setSaving(false);
    }
  }, [selected, repos, onAdded]);

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-border/60 glass p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">
            Add Repository
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <svg
              className="w-8 h-8 animate-spin mx-auto text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="mt-3 text-sm text-text-muted">
              Loading your repositories&hellip;
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <svg
              className="w-12 h-12 mx-auto text-destructive mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-destructive text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-text-primary text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>

            {/* Repo list */}
            <div className="max-h-80 overflow-y-auto space-y-2 mb-6 pr-1">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">
                  No repositories found
                </p>
              ) : (
                filtered.map((repo) => (
                  <label
                    key={repo.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected === repo.full_name
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/40 hover:border-primary/30 hover:bg-secondary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repo"
                      value={repo.full_name}
                      checked={selected === repo.full_name}
                      onChange={(e) => setSelected(e.target.value)}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium text-foreground truncate">
                        {repo.full_name}
                      </p>
                      {repo.description && (
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary/60" />
                            {repo.language}
                          </span>
                        )}
                        <span>
                          Updated{' '}
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {repo.private && (
                      <span className="px-2 py-0.5 text-xs rounded bg-secondary/50 text-text-muted font-medium">
                        Private
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selected || saving}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all glow-ring"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Adding&hellip;
                  </span>
                ) : (
                  'Add Repository'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
