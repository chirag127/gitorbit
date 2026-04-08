import { githubFetch } from './github-api';

export class OptimisticLockError extends Error {
  constructor(public path: string, public retries: number) {
    super(`Optimistic lock failed for ${path} after ${retries} retries`);
    this.name = 'OptimisticLockError';
  }
}

export async function writeWithRetry<T>(
  owner: string,
  repo: string,
  path: string,
  content: T,
  message: string,
  maxRetries: number = 3
): Promise<void> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const existing = await githubFetch(
        `/repos/${owner}/${repo}/contents/${path}`
      ).catch(() => null);

      const body: any = {
        message,
        content: btoa(JSON.stringify(content, null, 2)),
      };
      if (existing?.sha) body.sha = existing.sha;

      await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      return;
    } catch (err) {
      if (err.message === 'CONFLICT' && retries < maxRetries - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries)));
        continue;
      }
      throw new OptimisticLockError(path, retries);
    }
  }
}

export async function readStateFile(
  owner: string,
  repo: string,
  path: string
): Promise<any> {
  const data = await githubFetch(
    `/repos/${owner}/${repo}/contents/${path}`
  );
  const decoded = atob(data.content.replace(/\n/g, ''));
  return JSON.parse(decoded);
}
