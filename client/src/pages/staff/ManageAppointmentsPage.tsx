import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { DetailedAppointment, AppointmentStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Search } from 'lucide-react';

export const ManageAppointmentsPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [appointments, setAppointments] = useState<DetailedAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAllAppointments({
        status: (statusFilter as AppointmentStatus) || undefined,
        search: searchTerm.trim() || undefined,
      });

      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError(response.error || 'Failed to retrieve appointments.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: AppointmentStatus) => {
    setProcessingId(appointmentId);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await appointmentService.updateStatus(appointmentId, newStatus);
      if (response.success) {
        setSuccessMsg(`Appointment status updated to '${newStatus}'.`);
        await fetchAppointments();
      } else {
        setError(response.error || 'Failed to update status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you wish to cancel this appointment as staff?')) {
      return;
    }

    setProcessingId(appointmentId);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await appointmentService.cancelAppointment(appointmentId);
      if (response.success) {
        setSuccessMsg('Appointment cancelled successfully.');
        await fetchAppointments();
      } else {
        setError(response.error || 'Failed to cancel appointment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error cancelling appointment.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Manage Patient Appointments</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Verify patient arrivals, confirm scheduled testing, and transition diagnostic stages
        </p>
      </div>

      {error && <Alert type="error" id="manage-appointments-error">{error}</Alert>}
      {successMsg && <Alert type="success" id="manage-appointments-success">{successMsg}</Alert>}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              id="input-search-appointments"
              className="form-input"
              placeholder="Search by Booking Ref, Patient Name, Mobile or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              id="select-status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" id="btn-search-appointments">
            <Search size={14} />
            <span>Search</span>
          </Button>
        </form>
      </div>

      {loading ? (
        <Spinner label="Loading appointments..." />
      ) : (
        <Card id="card-appointments-table">
          {appointments.length === 0 ? (
            <EmptyState
              title="No Appointments Found"
              description="No appointment records matched your current query or filter criteria."
              id="empty-staff-appointments"
            />
          ) : (
            <div className="table-responsive">
              <table className="table" id="table-staff-appointments">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Patient Details</th>
                    <th>Mobile</th>
                    <th>Scheduled Slot</th>
                    <th>Test Type</th>
                    <th>Status</th>
                    <th>Workflow Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id} id={`row-staff-appt-${appt.id}`}>
                      <td style={{ fontWeight: 600 }}>{appt.bookingReference}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          {appt.patientIdNumber || `UID #${appt.patientId}`}
                        </div>
                      </td>
                      <td>{appt.patientMobile}</td>
                      <td>
                        <div>{appt.slotStartTime}</div>
                      </td>
                      <td>{appt.testType}</td>
                      <td>
                        <Badge type={appt.status} id={`badge-status-${appt.id}`}>
                          {appt.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {appt.status === 'booked' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                              isLoading={processingId === appt.id}
                              id={`btn-confirm-appt-${appt.id}`}
                            >
                              Confirm
                            </Button>
                          )}

                          {appt.status === 'confirmed' && (
                            <Link
                              to={`/staff/create-report?appointmentId=${appt.id}`}
                              className="btn btn-primary btn-sm"
                              id={`btn-complete-appt-${appt.id}`}
                            >
                              Enter Report
                            </Link>
                          )}

                          {(appt.status === 'booked' || appt.status === 'confirmed') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(appt.id)}
                              isLoading={processingId === appt.id}
                              id={`btn-staff-cancel-${appt.id}`}
                            >
                              Cancel
                            </Button>
                          )}

                          {appt.status === 'completed' && appt.hasReport && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              Report Issued
                            </span>
                          )}
                        </div>
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

