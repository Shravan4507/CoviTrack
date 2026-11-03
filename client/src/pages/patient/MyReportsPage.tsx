import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/report.service';
import { DetailedReport } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Download, FileText } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<DetailedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportService.getMyReports();
        if (response.success && response.data) {
          setReports(response.data);
        } else {
          setError(response.error || 'Failed to retrieve diagnostic reports.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with server.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading your diagnostic test reports..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Diagnostic Test Reports</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Official COVID-19 clinical laboratory reports with downloadable PDF verification
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card id="card-patient-reports">
        {reports.length === 0 ? (
          <EmptyState
            title="No Reports Issued"
            description="Diagnostic reports will appear here once your swab sample has been analyzed by the laboratory."
            id="empty-patient-reports"
          />
        ) : (
          <div className="table-responsive">
            <table className="table" id="table-patient-reports">
              <thead>
                <tr>
                  <th>Report Reference</th>
                  <th>Booking Ref</th>
                  <th>Test Modality</th>
                  <th>Testing Date</th>
                  <th>Result</th>
                  <th>Authorized Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} id={`row-report-${report.id}`}>
                    <td style={{ fontWeight: 600 }}>{report.reportReference}</td>
                    <td>{report.bookingReference}</td>
                    <td>{report.testType}</td>
                    <td>{report.testingDate}</td>
                    <td>
                      <Badge type={report.testResult} id={`badge-result-${report.id}`}>
                        {report.testResult}
                      </Badge>
                    </td>
                    <td>{report.staffName}</td>
                    <td>
                      <a
                        href={`/api/reports/${report.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        id={`btn-download-pdf-${report.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

