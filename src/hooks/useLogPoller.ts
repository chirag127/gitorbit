import { useState, useEffect, useCallback, useRef } from 'react';
import { githubFetch } from '../lib/github-api';

interface JobInfo {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | 'failure';
  started_at?: string;
  completed_at?: string;
}

interface UseLogPollerOptions {
  owner: string;
  repo: string;
  workflowRunId: number;
  pollingInterval?: number;
  enabled?: boolean;
}

interface PollResult {
  logs: string[];
  status: string;
  isPolling: boolean;
  error: string | null;
}

export function useLogPoller({
  owner,
  repo,
  workflowRunId,
  pollingInterval = 3000,
  enabled = true,
}: UseLogPollerOptions): PollResult {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('queued');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await githubFetch(
        `/repos/${owner}/${repo}/actions/runs/${workflowRunId}/jobs`
      );

      if (!data.jobs || data.jobs.length === 0) {
        return null;
      }

      const job: JobInfo = data.jobs[0];
      setStatus(job.status);
      return job;
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      return null;
    }
  }, [owner, repo, workflowRunId]);

  const fetchLogs = useCallback(async (jobId: number) => {
    try {
      const pat = localStorage.getItem('gitorbit_pat');
      if (!pat) return;

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
        {
          headers: {
            'Authorization': `Bearer ${pat}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return;
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const logText = await response.text();
      const lines = logText.split('\n').filter(line => line.trim());
      setLogs(lines);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }, [owner, repo]);

  const poll = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      const job = await fetchJobs();

      if (!job) return;

      if (job.id) {
        await fetchLogs(job.id);
      }

      if (job.status === 'completed' || job.status === 'failure') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPolling(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsPolling(false);
    }
  }, [enabled, fetchJobs, fetchLogs]);

  useEffect(() => {
    if (!enabled) return;

    poll();
    intervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollingInterval, poll]);

  return {
    logs,
    status,
    isPolling,
    error,
  };
}
