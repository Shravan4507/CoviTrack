import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { DetailedAppointment } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { EmptyState } from '../../components/common/EmptyState';

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<DetailedAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError(response.error || 'Failed to retrieve appointments.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you wish to cancel this appointment?')) {
      return;
    }

    setCancellingId(id);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await appointmentService.cancelAppointment(id);
      if (response.success) {
        setSuccessMsg('Appointment cancelled successfully.');
        await fetchAppointments();
      } else {
        setError(response.error || 'Failed to cancel appointment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing cancellation.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading your appointment history..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>My Testing Appointments</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Track sample collection appointments and booking statuses
          </p>
        </div>
        <Link to="/patient/book-appointment" className="btn btn-primary btn-sm" id="btn-book-another-test">
          Book New Test
        </Link>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <Card id="card-patient-appointments">
        {appointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="You have not booked any COVID-19 testing appointments yet."
            action={
              <Link to="/patient/book-appointment" className="btn btn-primary btn-sm">
                Book Your First Appointment
              </Link>
            }
            id="empty-patient-appointments"
          />
        ) : (
          <div className="table-responsive">
            <table className="table" id="table-patient-appointments">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Scheduled Slot</th>
                  <th>Test Modality</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const canCancel = appt.status === 'booked' || appt.status === 'confirmed';
                  return (
                    <tr key={appt.id} id={`row-appt-${appt.id}`}>
                      <td style={{ fontWeight: 600 }}>{appt.bookingReference}</td>
                      <td>
                        <div>{appt.slotStartTime}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          to {appt.slotEndTime}
                        </div>
                      </td>
                      <td>{appt.testType}</td>
                      <td>
                        <Badge type={appt.status} id={`badge-appt-${appt.id}`}>
                          {appt.status}
                        </Badge>
                      </td>
                      <td>
                        {canCancel && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(appt.id)}
                            isLoading={cancellingId === appt.id}
                            id={`btn-cancel-appt-${appt.id}`}
                          >
                            Cancel
                          </Button>
                        )}
                        {appt.hasReport && (
                          <Link to="/patient/reports" className="btn btn-outline btn-sm" style={{ marginLeft: '8px' }}>
                            View Report
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

