import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { SystemStats } from '../../types';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { Users, Calendar, FileText, ShieldAlert } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.error || 'Failed to load system statistics.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with server.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Querying database metrics and statistics..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>System Administration</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Real-time MySQL relational database statistics and operational monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-secondary btn-sm" id="btn-admin-manage-users">
            Manage Users & Staff
          </Link>
          <Link to="/admin/logs" className="btn btn-outline btn-sm" id="btn-admin-audit-logs">
            View Audit Trail
          </Link>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Top Level Metric Counters */}
      <div className="stat-grid" id="admin-stats-grid">
        <div className="stat-box">
          <div className="stat-label">Registered Patients</div>
          <div className="stat-value" id="stat-admin-patients">{stats?.users.totalPatients ?? 0}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Authorized Staff</div>
          <div className="stat-value" id="stat-admin-staff">{stats?.users.totalStaff ?? 0}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value" id="stat-admin-appts">{stats?.appointments.totalAppointments ?? 0}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Clinical Reports</div>
          <div className="stat-value" id="stat-admin-reports">{stats?.reports.totalReports ?? 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Appointment Breakdown */}
        <Card
          title="Appointment Status Breakdown"
          description="Distribution of patient appointments across lifecycle stages"
          id="card-appointment-breakdown"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span>Booked (Pending Confirmation)</span>
              <span style={{ fontWeight: 700 }} id="stat-breakdown-booked">{stats?.appointments.bookedAppointments ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span>Confirmed (Scheduled for Sample Collection)</span>
              <span style={{ fontWeight: 700 }} id="stat-breakdown-confirmed">{stats?.appointments.confirmedAppointments ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span>Completed (Report Generated)</span>
              <span style={{ fontWeight: 700 }} id="stat-breakdown-completed">{stats?.appointments.completedAppointments ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-error)' }}>Cancelled Appointments</span>
              <span style={{ fontWeight: 700, color: 'var(--color-error)' }} id="stat-breakdown-cancelled">{stats?.appointments.cancelledAppointments ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Diagnostic Results Breakdown */}
        <Card
          title="Diagnostic Test Findings"
          description="Clinical SARS-CoV-2 testing outcomes recorded by laboratory"
          id="card-diagnostic-breakdown"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Positive Test Results</span>
              <span style={{ fontWeight: 700, color: 'var(--color-error)' }} id="stat-results-positive">{stats?.reports.positiveReports ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span>Negative Test Results</span>
              <span style={{ fontWeight: 700 }} id="stat-results-negative">{stats?.reports.negativeReports ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <span style={{ color: 'var(--color-warning)' }}>Inconclusive Results</span>
              <span style={{ fontWeight: 700, color: 'var(--color-warning)' }} id="stat-results-inconclusive">{stats?.reports.inconclusiveReports ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Upcoming Slots</span>
              <span style={{ fontWeight: 700 }}>{stats?.slots.upcomingActiveSlots ?? 0} of {stats?.slots.totalSlots ?? 0} total</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

