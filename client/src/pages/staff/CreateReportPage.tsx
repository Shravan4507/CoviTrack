import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { reportService } from '../../services/report.service';
import { DetailedAppointment, DiagnosticResult } from '../../types';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { Spinner } from '../../components/common/Spinner';
import { CheckCircle, Download } from 'lucide-react';

export const CreateReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialApptId = searchParams.get('appointmentId');

  const [appointments, setAppointments] = useState<DetailedAppointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(initialApptId || '');
  const [testResult, setTestResult] = useState<DiagnosticResult>('negative');
  const [testingDate, setTestingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdReport, setCreatedReport] = useState<{ reportId: number; reportReference: string } | null>(null);

  useEffect(() => {
    const fetchEligibleAppointments = async () => {
      try {
        const response = await appointmentService.getAllAppointments();
        if (response.success && response.data) {
          // Eligible for report: confirmed or completed without an existing report
          const eligible = response.data.filter(
            (a) => (a.status === 'confirmed' || a.status === 'completed') && !a.hasReport
          );
          setAppointments(eligible);
          if (initialApptId) {
            setSelectedAppointmentId(initialApptId);
          } else if (eligible.length > 0) {
            setSelectedAppointmentId(eligible[0].id.toString());
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to database.');
      } finally {
        setLoading(false);
      }
    };
    fetchEligibleAppointments();
  }, [initialApptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAppointmentId) {
      setError('Please select an appointment for which to generate a diagnostic report.');
      return;
    }

    if (!testingDate) {
      setError('Testing date is required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reportService.createReport({
        appointmentId: parseInt(selectedAppointmentId, 10),
        testResult,
        testingDate,
        notes: notes.trim(),
      });

      if (response.success && response.data) {
        setCreatedReport(response.data);
      } else {
        setError(response.error || 'Failed to create diagnostic report.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating report record in database.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Spinner label="Loading eligible appointments for reporting..." />
      </div>
    );
  }

  if (createdReport) {
    return (
      <div className="container" style={{ maxWidth: '540px', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="card" id="report-success-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem', color: '#FFFFFF' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Diagnostic Report Created</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            The COVID-19 clinical laboratory report has been generated, signed, and persisted.
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
              <span style={{ color: 'var(--text-secondary)' }}>Report Reference:</span>
              <span style={{ fontWeight: 700 }} id="created-report-reference">
                {createdReport.reportReference}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Diagnostic Result:</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{testResult}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Testing Date:</span>
              <span>{testingDate}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href={`/api/reports/${createdReport.reportId}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              id="btn-view-pdf-report"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} />
              <span>Download Printable PDF</span>
            </a>
            <Link to="/staff/appointments" className="btn btn-secondary">
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '640px', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Card
        title="Issue Diagnostic Test Report"
        description="Enter clinical findings and generate official verifiable COVID-19 report"
        id="card-create-report"
      >
        {error && (
          <Alert type="error" id="create-report-error">
            {error}
          </Alert>
        )}

        {appointments.length === 0 ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              There are currently no completed or confirmed appointments waiting for diagnostic report generation.
            </p>
            <Link to="/staff/appointments" className="btn btn-secondary btn-sm">
              View Appointments Queue
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="form-create-report">
            <FormField label="Target Appointment" required id="group-select-appointment">
              <select
                id="select-appointment-id"
                className="form-select"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select an appointment...</option>
                {appointments.map((appt) => (
                  <option key={appt.id} value={appt.id}>
                    {appt.bookingReference} — {appt.patientName} ({appt.testType}, Slot: {appt.slotStartTime})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Diagnostic Result" required id="group-select-result">
              <select
                id="select-test-result"
                className="form-select"
                value={testResult}
                onChange={(e) => setTestResult(e.target.value as DiagnosticResult)}
                disabled={submitting}
              >
                <option value="negative">Negative (Target Not Detected)</option>
                <option value="positive">Positive (SARS-CoV-2 Viral RNA Detected)</option>
                <option value="inconclusive">Inconclusive (Repeat Assay Advised)</option>
              </select>
            </FormField>

            <FormField label="Laboratory Testing Date" required id="group-testing-date">
              <input
                type="date"
                id="input-testing-date"
                className="form-input"
                value={testingDate}
                onChange={(e) => setTestingDate(e.target.value)}
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Clinical Observations & Notes"
              helpText="Optional notes regarding sample quality, viral load cycle threshold, or observations"
              id="group-report-notes"
            >
              <textarea
                id="input-report-notes"
                className="form-textarea"
                placeholder="e.g. Real-Time PCR completed on calibrated automated thermocycler. Specimen adequate."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </FormField>

            <div style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%' }}
                isLoading={submitting}
                id="btn-submit-report"
              >
                Generate & Sign Clinical Report
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

