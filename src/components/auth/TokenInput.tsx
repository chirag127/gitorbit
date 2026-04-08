import { useState } from 'react';
import { setPat } from '../../lib/pat-storage';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

export default function TokenInput() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { validateToken } = useGitHubAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const isValid = await validateToken(token);
      
      if (isValid) {
        setPat(token);
        window.location.href = '/dashboard';
      } else {
        setError('Invalid token. Please check your GitHub PAT and try again.');
      }
    } catch {
      setError('Failed to validate token. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-bg-border bg-bg-surface p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Setup Your Token</h1>
          <p className="text-text-secondary">
            Enter your GitHub Personal Access Token (PAT) to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-2">
              GitHub PAT
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-lg border border-bg-border bg-bg focus:border-accent focus:outline-none transition-colors font-mono text-sm"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !token.trim()}
            className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {isValidating ? 'Validating...' : 'Continue to Dashboard'}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-bg-elevated/50 text-sm text-text-muted">
          <p className="font-medium text-text-secondary mb-2">Required permissions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Contents: Read & Write</li>
            <li>Workflows: Read & Write</li>
            <li>Metadata: Read</li>
            <li>Actions: Read & Write</li>
          </ul>
          <p className="mt-3 text-xs">
            Create a fine-grained PAT at{' '}
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              github.com/settings/tokens
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
