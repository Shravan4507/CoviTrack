import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patient.service';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await patientService.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to retrieve patient dashboard details.');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to database.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading your patient profile and medical records..." />
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const stats = dashboardData?.statistics || {
    totalAppointments: 0,
    upcomingAppointmentsCount: 0,
    completedAppointmentsCount: 0,
    totalReportsCount: 0,
  };
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];
  const recentReports = dashboardData?.recentReports || [];

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Patient Header Identity Card */}
      <div
        className="card"
        id="patient-identity-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Registered Patient Portal
          </span>
          <h1 style={{ fontSize: '1.75rem', margin: '4px 0' }} id="patient-display-name">
            {user?.fullName}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            <span>Email: {user?.email}</span>
            <span>Mobile: {user?.mobileNumber}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            PATIENT IDENTIFIER
          </div>
          <div
            id="patient-id-badge"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              padding: '6px 12px',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              backgroundColor: '#000000',
              letterSpacing: '0.05em',
            }}
          >
            {profile?.patient_id_number || 'PENDING'}
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Metrics Row */}
      <div className="stat-grid" id="patient-metrics-grid">
        <div className="stat-box">
          <div className="stat-label">Upcoming Tests</div>
          <div className="stat-value" id="stat-upcoming-tests">{stats.upcomingAppointmentsCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Completed Tests</div>
          <div className="stat-value" id="stat-completed-tests">{stats.completedAppointmentsCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Diagnostic Reports</div>
          <div className="stat-value" id="stat-total-reports">{stats.totalReportsCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value" id="stat-total-bookings">{stats.totalAppointments}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Appointments */}
        <Card
          title="Upcoming Appointments"
          description="Scheduled sample collection sessions"
          action={
            <Link to="/patient/book-appointment" className="btn btn-primary btn-sm" id="btn-book-new-test">
              Book Test Slot
            </Link>
          }
          id="card-upcoming-appointments"
        >
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              title="No Upcoming Appointments"
              description="You have no testing appointments scheduled at this time."
              action={
                <Link to="/patient/book-appointment" className="btn btn-secondary btn-sm">
                  Schedule an Appointment
                </Link>
              }
              id="empty-upcoming-appointments"
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Date & Time</th>
                    <th>Test Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((appt: any) => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: 600 }}>{appt.bookingReference}</td>
                      <td>{appt.slotStartTime}</td>
                      <td>{appt.testType}</td>
                      <td>
                        <Badge type={appt.status}>{appt.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Diagnostic Reports */}
        <Card
          title="Recent Diagnostic Reports"
          description="Verified laboratory findings and printable PDFs"
          action={
            <Link to="/patient/reports" className="btn btn-secondary btn-sm" id="btn-view-all-reports">
              View All Reports
            </Link>
          }
          id="card-recent-reports"
        >
          {recentReports.length === 0 ? (
            <EmptyState
              title="No Diagnostic Reports"
              description="No clinical reports have been issued yet. Reports are published following test completion."
              id="empty-recent-reports"
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Report Ref</th>
                    <th>Date</th>
                    <th>Result</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report: any) => (
                    <tr key={report.id}>
                      <td style={{ fontWeight: 600 }}>{report.reportReference}</td>
                      <td>{report.testingDate}</td>
                      <td>
                        <Badge type={report.testResult}>{report.testResult}</Badge>
                      </td>
                      <td>
                        <a
                          href={`/api/reports/${report.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          PDF
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
    </div>
  );
};

