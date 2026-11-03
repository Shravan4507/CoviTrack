import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { Button } from '../../components/common/Button';
import { RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAuditLogs(100);
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        setError(response.error || 'Failed to retrieve system audit logs.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>System Security & Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Immutable chronological record of administrative actions, patient bookings, and diagnostic activities
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchLogs} id="btn-refresh-audit-logs">
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading system audit entries..." />
      ) : (
        <Card id="card-audit-logs">
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No audit logs recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table" id="table-audit-logs">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Actor</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} id={`row-audit-${log.id}`}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <span className="badge" style={{ textTransform: 'uppercase' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                      </td>
                      <td>
                        {log.userName ? (
                          <div>
                            <span style={{ fontWeight: 600 }}>{log.userName}</span>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              [{log.userRole?.toUpperCase()}]
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>System / Guest</span>
                        )}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', maxWidth: '300px', wordBreak: 'break-word' }}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

