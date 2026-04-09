import { useRef, useEffect, useState, useCallback } from 'react';
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
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isAtBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight < 50;
      setAutoScroll(isAtBottom);
    },
    [],
  );

  const statusConfig: Record<
    string,
    { label: string; dotClass: string; textClass: string }
  > = {
    queued: {
      label: 'Queued',
      dotClass: 'bg-status-queued',
      textClass: 'text-text-muted',
    },
    in_progress: {
      label: 'Running',
      dotClass: 'bg-status-running animate-pulse',
      textClass: 'text-accent-light',
    },
    completed: {
      label: 'Completed',
      dotClass: 'bg-success',
      textClass: 'text-success',
    },
    failure: {
      label: 'Failed',
      dotClass: 'bg-destructive',
      textClass: 'text-destructive',
    },
  };

  const config =
    statusConfig[status] || {
      label: status,
      dotClass: 'bg-status-queued',
      textClass: 'text-text-muted',
    };

  const copyLogs = useCallback(() => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [logs]);

  const downloadLogs = useCallback(() => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitorbit-run-${workflowRunId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs, workflowRunId]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-destructive mb-1">
              Failed to load logs
            </p>
            <p className="text-xs text-text-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden glass">
      {/* ═══════════ Title bar (macOS style) ═══════════ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-bg-surface/60">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/80 hover:bg-destructive transition-colors" />
            <div className="w-3 h-3 rounded-full bg-warning/80 hover:bg-warning transition-colors" />
            <div className="w-3 h-3 rounded-full bg-success/80 hover:bg-success transition-colors" />
          </div>

          {/* Terminal title */}
          <span className="text-xs text-text-muted font-mono truncate max-w-[160px] sm:max-w-xs">
            GitOrbit Terminal
          </span>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.textClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Polling indicator */}
          {isPolling && (
            <div
              className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin mr-1"
              style={{ animationDuration: '0.8s' }}
            />
          )}

          {/* Copy button */}
          <button
            onClick={copyLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Copy logs"
            aria-label="Copy logs to clipboard"
          >
            {copied ? (
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Download logs"
            aria-label="Download logs as file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══════════ Log output ═══════════ */}
      <div
        ref={logContainerRef}
        className="font-mono text-sm text-text-terminal p-4 h-80 sm:h-96 overflow-y-auto bg-[#0a0a0a]"
        onScroll={handleScroll}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted italic">
              {isPolling ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                  />
                  Waiting for logs&hellip;
                </span>
              ) : (
                'No logs available'
              )}
            </p>
          </div>
        ) : (
          logs.map((line, i) => (
            <div
              key={i}
              className="leading-relaxed whitespace-pre-wrap hover:bg-white/[0.02] -mx-1 px-1 rounded"
            >
              <span className="text-text-muted select-none mr-3 text-xs inline-block w-8 text-right">
                {i + 1}
              </span>
              {line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
