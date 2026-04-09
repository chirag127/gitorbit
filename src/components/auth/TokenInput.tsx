import { useState, useCallback } from 'react';
import { setPat } from '../../lib/pat-storage';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

export default function TokenInput() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { validateToken } = useGitHubAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsValidating(true);

      try {
        console.log('[TokenInput] Starting validation...');
        const isValid = await validateToken(token);
        console.log('[TokenInput] Validation result:', isValid);

        if (isValid) {
          console.log('[TokenInput] Saving token and redirecting...');
          setPat(token);
          window.location.href = '/dashboard';
        } else {
          setError('Invalid token. Please check your GitHub PAT and try again.');
        }
      } catch (err) {
        console.error('[TokenInput] Validation error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to validate token. Please try again.'
        );
      } finally {
        setIsValidating(false);
      }
    },
    [token, validateToken],
  );

  return (
    <div className="relative w-full max-w-lg animate-slide-up">
      {/* Glass card */}
      <div className="rounded-xl border border-border/60 glass p-8 sm:p-10">
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11
                    17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0
                    01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            {/* Glow ring */}
            <div className="absolute -inset-2 rounded-2xl border border-primary/10 animate-glow" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Connect your <span className="gradient-text">GitHub</span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Enter your GitHub Personal Access Token to unlock the full control
            plane. Your token stays in your browser &mdash; always.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { num: '1', label: 'Create PAT', done: true },
            { num: '2', label: 'Paste token', done: false, active: true },
            { num: '3', label: 'Launch', done: false },
          ].map((step, i) => (
            <div key={step.num} className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${step.done
                    ? 'bg-success/20 text-success'
                    : step.active
                      ? 'bg-primary/20 text-accent-light ring-2 ring-primary/30'
                      : 'bg-muted text-text-muted'
                  }`}
              >
                {step.done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                id="token"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background/80 text-text-primary font-mono text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowToken((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">
              <svg className="w-5 h-5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !token.trim()}
            className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all glow-ring"
          >
            {isValidating ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Validating token&hellip;
              </span>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </form>

        {/* Scope checklist */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/40 text-sm">
          <p className="font-medium text-text-secondary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Required PAT scopes
          </p>
          <ul className="space-y-2">
            {[
              { label: 'Contents', scope: 'Read &amp; Write', ok: true },
              { label: 'Workflows', scope: 'Read &amp; Write', ok: true },
              { label: 'Metadata', scope: 'Read-only', ok: true },
              { label: 'Actions', scope: 'Read &amp; Write', ok: true },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-text-muted">
                <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-secondary">{item.label}:</span>
                <span dangerouslySetInnerHTML={{ __html: item.scope }} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-muted leading-relaxed">
            Create a fine-grained PAT at{' '}
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              github.com/settings/personal-access-tokens/new
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
