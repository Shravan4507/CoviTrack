import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointment.service';
import { AppointmentSlot } from '../../types';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';

export const ManageSlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [maxCapacity, setMaxCapacity] = useState<number>(10);

  const fetchSlots = async () => {
    try {
      const response = await appointmentService.getAllSlots();
      if (response.success && response.data) {
        setSlots(response.data);
      } else {
        setError(response.error || 'Failed to retrieve testing slots.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Provide sensible default tomorrow 09:00 to 11:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`;
    const endIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T12:00`;

    setStartTime(startIso);
    setEndTime(endIso);

    fetchSlots();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!startTime || !endTime) {
      setError('Start time and end time are required.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start <= new Date()) {
      setError('Slot start time must be in the future.');
      return;
    }

    if (end <= start) {
      setError('Slot end time must be after slot start time.');
      return;
    }

    if (maxCapacity < 1) {
      setError('Maximum capacity must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      // Format as YYYY-MM-DD HH:mm:ss for MySQL
      const formatSqlDateTime = (iso: string) => iso.replace('T', ' ') + ':00';
      const response = await appointmentService.createSlot({
        startTime: formatSqlDateTime(startTime),
        endTime: formatSqlDateTime(endTime),
        maxCapacity,
      });

      if (response.success) {
        setSuccessMsg('Testing slot created successfully.');
        await fetchSlots();
      } else {
        setError(response.error || 'Failed to create slot.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing slot creation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (slotId: number, currentStatus: boolean) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await appointmentService.toggleSlotStatus(slotId, !currentStatus);
      if (response.success) {
        setSuccessMsg(`Slot #${slotId} status updated successfully.`);
        await fetchSlots();
      } else {
        setError(response.error || 'Failed to update slot status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating slot status.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading testing slots..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Manage Testing Slots</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Define center operating hours and capacity thresholds to prevent overcrowding
        </p>
      </div>

      {error && <Alert type="error" id="slots-error-alert">{error}</Alert>}
      {successMsg && <Alert type="success" id="slots-success-alert">{successMsg}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Create Slot Form */}
        <Card
          title="Create New Testing Slot"
          description="Establish scheduled window for sample collections"
          id="card-create-slot"
        >
          <form onSubmit={handleCreateSlot} id="form-create-slot">
            <FormField label="Start Date & Time" required id="group-slot-start">
              <input
                type="datetime-local"
                id="input-slot-start"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
              />
            </FormField>

            <FormField label="End Date & Time" required id="group-slot-end">
              <input
                type="datetime-local"
                id="input-slot-end"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Maximum Patient Capacity"
              required
              helpText="Upper limit of patients accepted during this window"
              id="group-slot-capacity"
            >
              <input
                type="number"
                id="input-slot-capacity"
                className="form-input"
                min={1}
                max={500}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 1)}
                disabled={submitting}
              />
            </FormField>

            <div style={{ marginTop: '1.5rem' }}>
              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%' }}
                isLoading={submitting}
                id="btn-create-slot"
              >
                Create Slot
              </Button>
            </div>
          </form>
        </Card>

        {/* Existing Slots Table */}
        <Card
          title="Center Testing Slots"
          description="Live capacity tracking and active status controls"
          id="card-slots-list"
          style={{ gridColumn: 'span 2' }}
        >
          {slots.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No slots configured yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table" id="table-manage-slots">
                <thead>
                  <tr>
                    <th>Slot ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Bookings / Cap</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} id={`row-slot-${slot.id}`}>
                      <td style={{ fontWeight: 600 }}>#{slot.id}</td>
                      <td>{slot.start_time}</td>
                      <td>{slot.end_time}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{slot.current_bookings}</span> / {slot.max_capacity}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            borderColor: slot.is_active ? '#FFFFFF' : 'var(--color-error)',
                            color: slot.is_active ? '#FFFFFF' : 'var(--color-error)',
                          }}
                        >
                          {slot.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant={slot.is_active ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(slot.id, slot.is_active)}
                          id={`btn-toggle-slot-${slot.id}`}
                        >
                          {slot.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
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

