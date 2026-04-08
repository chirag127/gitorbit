import { useRef, useEffect, useState } from 'react';
import { useLogPoller } from '../../hooks/useLogPoller';

interface LogViewerProps {
  owner: string;
  repo: string;
  workflowRunId: number;
  enabled?: boolean;
}

export function LogViewer({
  owner,
  repo,
  workflowRunId,
  enabled = true,
}: LogViewerProps) {
  const { logs, status, isPolling, error } = useLogPoller({
    owner,
    repo,
    workflowRunId,
    enabled,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const statusConfig: Record<string, { label: string; variant: string }> = {
    queued: { label: 'Queued', variant: 'bg-zinc-700 text-zinc-300' },
    in_progress: { label: 'Running', variant: 'bg-accent/20 text-accent-light animate-pulse' },
    completed: { label: 'Completed', variant: 'bg-status-success/20 text-status-success' },
    failure: { label: 'Failed', variant: 'bg-status-error/20 text-status-error' },
  };

  const config = statusConfig[status] || { label: status, variant: 'bg-zinc-700 text-zinc-300' };

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitorbit-run-${workflowRunId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-status-error/50 bg-bg-surface p-6">
        <p className="text-status-error mb-2">Failed to load logs</p>
        <p className="text-text-muted text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-bg-border bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-border bg-bg-surface">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-status-error" />
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <div className="w-3 h-3 rounded-full bg-status-success" />
          </div>
          <span className="text-xs text-text-muted font-mono">
            GitOrbit Terminal — {status}
          </span>
          <span className={`${config.variant} rounded-full px-3 py-0.5 text-xs font-medium`}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPolling && (
            <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
          )}
          <button
            onClick={copyLogs}
            disabled={logs.length === 0}
            className="p-1 rounded hover:bg-bg-elevated disabled:opacity-50"
            title="Copy logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-1 rounded hover:bg-bg-elevated disabled:opacity-50"
            title="Download logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="font-mono text-sm text-text-terminal p-4 h-96 overflow-y-auto"
        onScroll={handleScroll}
      >
        {logs.length === 0 ? (
          <div className="text-text-muted italic">
            {isPolling ? 'Waiting for logs...' : 'No logs available'}
          </div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">
              {line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
