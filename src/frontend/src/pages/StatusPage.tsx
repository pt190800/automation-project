// UI: Status/Trace page (automation step display)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStatus } from '../api/client';
import type { RequestTrace } from '../../../shared/types/Trace';

export default function StatusPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [trace, setTrace] = useState<RequestTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) return;

    getStatus(requestId)
      .then((result) => {
        setTrace(result.trace);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load status');
        setLoading(false);
      });
  }, [requestId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <h2>Loading trace...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '4px' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <h2>No trace found for this request</h2>
        <a href="/" style={{ color: '#007bff' }}>← Back to Search</a>
      </div>
    );
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'running':
        return '⏳';
      default:
        return '⏺';
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      case 'running':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>Automation Trace</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Request ID: {requestId} | Status: <span style={{ color: getStepColor(trace.status), fontWeight: 'bold' }}>{trace.status.toUpperCase()}</span>
      </p>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Request Details</h3>
        <p><strong>Query:</strong> {trace.query}</p>
        <p><strong>Started:</strong> {new Date(trace.startTime).toLocaleString()}</p>
        {trace.endTime && (
          <p><strong>Completed:</strong> {new Date(trace.endTime).toLocaleString()}</p>
        )}
        {trace.duration && (
          <p><strong>Duration:</strong> {(trace.duration / 1000).toFixed(2)} seconds</p>
        )}
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px' }}>
        <h3 style={{ marginBottom: '20px' }}>Execution Steps</h3>

        {trace.steps.length === 0 ? (
          <p style={{ color: '#666' }}>No steps recorded</p>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                backgroundColor: '#e0e0e0',
              }}
            />

            {trace.steps.map((step, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  paddingLeft: '50px',
                  paddingBottom: '20px',
                }}
              >
                {/* Step icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '0',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: `2px solid ${getStepColor(step.status)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  {getStepIcon(step.status)}
                </div>

                {/* Step content */}
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '4px',
                    border: `1px solid ${getStepColor(step.status)}33`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0, color: getStepColor(step.status) }}>
                      {step.name}
                    </h4>
                    {step.duration && (
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {(step.duration / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                    Started: {new Date(step.timestamp).toLocaleTimeString()}
                  </p>

                  {step.error && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    >
                      <strong>Error:</strong> {step.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href={`/results/${requestId}`} style={{ color: '#007bff', marginRight: '20px' }}>
          ← Back to Results
        </a>
        <a href="/" style={{ color: '#007bff' }}>
          Start New Search
        </a>
      </div>
    </div>
  );
}
