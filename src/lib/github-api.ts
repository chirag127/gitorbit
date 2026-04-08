export interface GitHubError extends Error {
  status: number;
  message: string;
  headers?: Headers;
}

export async function githubFetch(
  path: string,
  opts: RequestInit = {}
): Promise<any> {
  const pat = localStorage.getItem('gitorbit_pat');
  if (!pat) throw new Error('UNAUTHENTICATED');

  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const error: GitHubError = new Error(`GitHub API ${res.status}`) as GitHubError;
    error.status = res.status;
    error.message = await res.text().catch(() => res.statusText);
    error.headers = res.headers;

    if (res.status === 401) throw new Error('INVALID_TOKEN');
    if (res.status === 403) {
      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (remaining && parseInt(remaining) < 100) {
        throw new Error('RATE_LIMIT_WARNING');
      }
      throw new Error('RATE_LIMITED');
    }
    if (res.status === 404) throw new Error('NOT_FOUND');
    if (res.status === 409) throw new Error('CONFLICT');
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export function checkRateLimit(headers: Headers): {
  remaining: number;
  limit: number;
  reset: number;
} {
  return {
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0'),
    limit: parseInt(headers.get('X-RateLimit-Limit') || '0'),
    reset: parseInt(headers.get('X-RateLimit-Reset') || '0'),
  };
}
