// Observability: In-memory trace storage for UI display

import { TraceStep, RequestTrace } from '../../shared/types/Trace';

export class TraceStore {
  private traces: Map<string, RequestTrace> = new Map();

  initTrace(requestId: string, query?: string): void {
    this.traces.set(requestId, {
      requestId,
      steps: [],
      status: 'running',
      query,
      startTime: Date.now(),
    });
  }

  addStep(requestId: string, step: TraceStep): void {
    const trace = this.traces.get(requestId) || {
      requestId,
      steps: [],
      status: 'running' as const,
      startTime: Date.now(),
    };
    trace.steps.push(step);
    this.traces.set(requestId, trace);
  }

  updateStep(requestId: string, stepName: string, updates: Partial<TraceStep>): void {
    const trace = this.traces.get(requestId);
    if (!trace) return;

    const step = trace.steps.find((s) => s.stepName === stepName);
    if (step) {
      Object.assign(step, updates);
    }
  }

  getTrace(requestId: string): RequestTrace | undefined {
    return this.traces.get(requestId);
  }

  setTotalDuration(requestId: string, duration: number): void {
    const trace = this.traces.get(requestId);
    if (trace) {
      trace.totalDuration = duration;
      trace.duration = duration;
      trace.endTime = Date.now();
      trace.status = 'success';
    }
  }

  setFailed(requestId: string): void {
    const trace = this.traces.get(requestId);
    if (trace) {
      const now = Date.now();
      trace.status = 'failed';
      trace.endTime = now;
      trace.duration = now - trace.startTime;
    }
  }
}

export const traceStoreInstance = new TraceStore();
