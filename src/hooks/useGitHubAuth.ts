import { useState, useEffect, useCallback } from 'react';
import { hasPat, clearPat, getPatMeta, updatePatMeta } from '../lib/pat-storage';
import { githubFetch } from '../lib/github-api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  avatarUrl: string | null;
  error: string | null;
}

export function useGitHubAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    username: null,
    avatarUrl: null,
    error: null,
  });

  const validateToken = useCallback(async (token?: string) => {
    const tokenToUse = token || localStorage.getItem('gitorbit_pat');

    if (!tokenToUse) {
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        username: null,
        avatarUrl: null,
        error: 'No token found',
      });
      return false;
    }

    try {
      console.log('[GitHub Auth] Validating token...');
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenToUse.trim()}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      console.log('[GitHub Auth] Response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          clearPat();
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            username: null,
            avatarUrl: null,
            error: 'Invalid token',
          });
          return false;
        }
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('[GitHub Auth] API error:', res.status, errorText);
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const user = await res.json();
      console.log('[GitHub Auth] User validated:', user.login);
      const scopes = res.headers.get('X-OAuth-Scopes')?.split(',').map(s => s.trim()) || [];

      updatePatMeta({ username: user.login, scopes });

      setAuth({
        isAuthenticated: true,
        isLoading: false,
        username: user.login,
        avatarUrl: user.avatar_url,
        error: null,
      });

      return true;
    } catch (err) {
      console.error('[GitHub Auth] Validation error:', err);
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        username: null,
        avatarUrl: null,
        error: err instanceof Error ? err.message : 'Validation failed',
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearPat();
    setAuth({
      isAuthenticated: false,
      isLoading: false,
      username: null,
      avatarUrl: null,
      error: null,
    });
    window.location.href = '/setup';
  }, []);

  useEffect(() => {
    if (hasPat()) {
      validateToken();
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, [validateToken]);

  return {
    ...auth,
    validateToken,
    logout,
  };
}
