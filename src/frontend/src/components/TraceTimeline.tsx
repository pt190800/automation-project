// Component: Trace timeline display

import type { TraceStep } from '../../../shared/types/Trace';

interface TraceTimelineProps {
  steps: TraceStep[];
}

const statusIcon = (status: TraceStep['status']) => {
  switch (status) {
    case 'success': return '✅';
    case 'failed':  return '❌';
    case 'running': return '⏳';
    default:        return '⏺';
  }
};

const statusColor = (status: TraceStep['status']) => {
  switch (status) {
    case 'success': return '#28a745';
    case 'failed':  return '#dc3545';
    case 'running': return '#ffc107';
    default:        return '#6c757d';
  }
};

export default function TraceTimeline({ steps }: TraceTimelineProps) {
  if (steps.length === 0) {
    return <p style={{ color: '#666' }}>No steps recorded.</p>;
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '16px' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '10px',
        bottom: '10px',
        width: '2px',
        backgroundColor: '#e0e0e0',
      }} />

      {steps.map((step, index) => (
        <div key={index} style={{ position: 'relative', paddingLeft: '36px', paddingBottom: '20px' }}>
          {/* Step dot */}
          <div style={{
            position: 'absolute',
            left: '8px',
            top: '0',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: `2px solid ${statusColor(step.status)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
          }}>
            {statusIcon(step.status)}
          </div>

          {/* Step card */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px 15px',
            borderRadius: '4px',
            border: `1px solid ${statusColor(step.status)}33`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: statusColor(step.status) }}>{step.stepName}</strong>
              {step.duration !== undefined && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {(step.duration / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
              Started: {new Date(step.startTime).toLocaleTimeString()}
            </p>

            {step.error && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                fontSize: '13px',
              }}>
                <strong>Error:</strong> {step.error}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
