import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { AppointmentSlot } from '../../types';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckCircle } from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [testType, setTestType] = useState<string>('RT-PCR');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    appointmentId: number;
    bookingReference: string;
  } | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await appointmentService.getAvailableSlots();
        if (response.success && response.data) {
          setSlots(response.data);
          if (response.data.length > 0) {
            setSelectedSlotId(response.data[0].id);
          }
        } else {
          setError(response.error || 'Failed to retrieve available testing slots.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with database.');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlotId) {
      setError('Please select an available appointment slot.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await appointmentService.bookAppointment({
        slotId: selectedSlotId,
        testType,
      });

      if (response.success && response.data) {
        setConfirmation(response.data);
      } else {
        setError(response.error || 'Appointment booking failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading active testing center slots..." />
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="container" style={{ maxWidth: '540px', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="card" id="booking-confirmation-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem', color: '#FFFFFF' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Appointment Confirmed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your COVID-19 testing appointment has been scheduled and recorded in the database.
          </p>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#000000',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking Reference:</span>
              <span style={{ fontWeight: 700 }} id="confirmation-booking-ref">
                {confirmation.bookingReference}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Test Type:</span>
              <span style={{ fontWeight: 600 }}>{testType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <span style={{ fontWeight: 600 }}>BOOKED</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/patient/appointments" className="btn btn-primary" id="btn-view-appointments">
              View My Appointments
            </Link>
            <Link to="/patient/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '640px', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Card
        title="Schedule COVID-19 Testing Appointment"
        description="Select your preferred testing slot and diagnostic test modality"
        id="book-appointment-card"
      >
        {error && (
          <Alert type="error" id="booking-error-alert">
            {error}
          </Alert>
        )}

        {slots.length === 0 ? (
          <EmptyState
            title="No Slots Currently Available"
            description="Testing center slots have reached full capacity or have not been created yet by staff."
            action={
              <Link to="/patient/dashboard" className="btn btn-secondary btn-sm">
                Return to Dashboard
              </Link>
            }
            id="empty-slots-state"
          />
        ) : (
          <form onSubmit={handleBooking} id="form-book-appointment">
            <FormField label="Diagnostic Test Modality" required id="group-select-test-type">
              <select
                id="select-test-type"
                className="form-select"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                disabled={submitting}
              >
                <option value="RT-PCR">RT-PCR (Gold Standard Molecular Assay)</option>
                <option value="Rapid Antigen">Rapid Antigen Test (Rapid Detection)</option>
                <option value="SARS-CoV-2 Antibody">SARS-CoV-2 Antibody Serology</option>
              </select>
            </FormField>

            <FormField
              label="Available Testing Slots"
              required
              helpText="Slots indicate start time, end time, and remaining capacity"
              id="group-select-slot"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {slots.map((slot) => {
                  const spotsLeft = slot.max_capacity - slot.current_bookings;
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <label
                      key={slot.id}
                      htmlFor={`slot-option-${slot.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        border: `1px solid ${isSelected ? '#FFFFFF' : 'var(--border-secondary)'}`,
                        borderRadius: '4px',
                        backgroundColor: isSelected ? '#151515' : 'var(--bg-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="radio"
                          id={`slot-option-${slot.id}`}
                          name="appointmentSlot"
                          value={slot.id}
                          checked={isSelected}
                          onChange={() => setSelectedSlotId(slot.id)}
                          disabled={submitting}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                            {slot.start_time} to {slot.end_time}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            Slot #{slot.id}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="badge"
                          style={{
                            borderColor: spotsLeft <= 2 ? 'var(--color-warning)' : 'var(--border-secondary)',
                            color: spotsLeft <= 2 ? 'var(--color-warning)' : 'var(--text-secondary)',
                          }}
                        >
                          {spotsLeft} SPOTS LEFT
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormField>

            <div style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%' }}
                isLoading={submitting}
                id="btn-confirm-booking"
              >
                Confirm Appointment Booking
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

