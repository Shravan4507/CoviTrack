import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { reportService } from '../../services/report.service';
import { patientService } from '../../services/patient.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { Calendar, Users, FileCheck, PlusCircle } from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, reportsRes] = await Promise.all([
          appointmentService.getAllAppointments(),
          reportService.getAllReports(),
        ]);

        if (apptsRes.success && apptsRes.data) {
          setAppointments(apptsRes.data);
        }
        if (reportsRes.success && reportsRes.data) {
          setRecentReports(reportsRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to database.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading staff operational dashboard..." />
      </div>
    );
  }

  const bookedCount = appointments.filter((a) => a.status === 'booked').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Staff Operational Command</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            COVID-19 testing center workflow, patient intake, and laboratory reporting
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/staff/slots" className="btn btn-secondary btn-sm" id="btn-quick-slots">
            Manage Slots
          </Link>
          <Link to="/staff/create-report" className="btn btn-primary btn-sm" id="btn-quick-report">
            <PlusCircle size={14} />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Operational Metrics */}
      <div className="stat-grid" id="staff-metrics-grid">
        <div className="stat-box">
          <div className="stat-label">Action Required (Booked)</div>
          <div className="stat-value" id="stat-staff-booked">{bookedCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Confirmed Testing</div>
          <div className="stat-value" id="stat-staff-confirmed">{confirmedCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Completed Tests</div>
          <div className="stat-value" id="stat-staff-completed">{completedCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Reports Issued</div>
          <div className="stat-value" id="stat-staff-reports">{recentReports.length}</div>
        </div>
      </div>

      {/* Recent Appointments Needing Action */}
      <Card
        title="Testing Center Appointments Queue"
        description="Patients awaiting testing confirmation or diagnostic results"
        action={
          <Link to="/staff/appointments" className="btn btn-outline btn-sm">
            View All Appointments
          </Link>
        }
        id="card-staff-appointment-queue"
      >
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No active appointments in queue.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Patient Name</th>
                  <th>Mobile</th>
                  <th>Scheduled Slot</th>
                  <th>Test Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 600 }}>{appt.bookingReference}</td>
                    <td>{appt.patientName}</td>
                    <td>{appt.patientMobile}</td>
                    <td>{appt.slotStartTime}</td>
                    <td>{appt.testType}</td>
                    <td>
                      <Badge type={appt.status}>{appt.status}</Badge>
                    </td>
                    <td>
                      <Link to={`/staff/appointments?search=${appt.bookingReference}`} className="btn btn-secondary btn-sm">
                        Manage
                      </Link>
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

