// Shared types: Observability (Logging & Tracing)

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  requestId: string;
  step: string;
  duration?: number;        // Milliseconds
  message: string;
  error?: string;
}

export interface TraceStep {
  stepName: string;
  status: 'running' | 'success' | 'failed';
  startTime: number;        // Unix timestamp
  duration?: number;        // Milliseconds
  error?: string;
}

export interface RequestTrace {
  requestId: string;
  steps: TraceStep[];
  totalDuration?: number;
  status: 'running' | 'success' | 'failed';
  query?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}
