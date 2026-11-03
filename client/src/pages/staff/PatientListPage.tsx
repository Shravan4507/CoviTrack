import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/patient.service';
import { PatientDetailedView } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Search } from 'lucide-react';

export const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientDetailedView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const fetchPatients = async (query = '') => {
    try {
      const response = await patientService.searchPatients(query);
      if (response.success && response.data) {
        setPatients(response.data);
      } else {
        setError(response.error || 'Failed to retrieve registered patients.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleOpenDetails = async (userId: number) => {
    setSelectedPatientId(userId);
    setDetailsLoading(true);
    try {
      const response = await patientService.getPatientDetails(userId);
      if (response.success) {
        setPatientDetails(response.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Registered Patients Registry</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Query patient demographic profiles, testing history, and associated diagnostic records
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Search Input Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              id="input-search-patients"
              className="form-input"
              placeholder="Search by Patient ID (e.g. PT-2026-...), Full Name, or 10-digit Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="sm" id="btn-search-patients">
            <Search size={14} />
            <span>Search Records</span>
          </Button>
        </form>
      </div>

      {loading ? (
        <Spinner label="Loading patient registry..." />
      ) : (
        <Card id="card-patients-table">
          {patients.length === 0 ? (
            <EmptyState
              title="No Patient Records Found"
              description="No registered patients matched your search criteria."
              id="empty-patients-state"
            />
          ) : (
            <div className="table-responsive">
              <table className="table" id="table-patients">
                <thead>
                  <tr>
                    <th>Patient Identifier</th>
                    <th>Full Legal Name</th>
                    <th>Mobile Number</th>
                    <th>Date of Birth</th>
                    <th>Total Tests</th>
                    <th>Reports</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.userId} id={`row-patient-${patient.userId}`}>
                      <td style={{ fontWeight: 700 }}>{patient.patientIdNumber}</td>
                      <td>{patient.fullName}</td>
                      <td>{patient.mobileNumber}</td>
                      <td>{patient.dateOfBirth}</td>
                      <td>{patient.appointmentCount ?? 0}</td>
                      <td>{patient.reportCount ?? 0}</td>
                      <td>
                        <span className="badge">{patient.accountStatus}</span>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDetails(patient.userId)}
                          id={`btn-view-patient-${patient.userId}`}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Patient Detailed Modal */}
      <Modal
        isOpen={selectedPatientId !== null}
        onClose={() => {
          setSelectedPatientId(null);
          setPatientDetails(null);
        }}
        title="Patient Medical Profile"
        id="modal-patient-details"
      >
        {detailsLoading || !patientDetails ? (
          <Spinner label="Loading patient history..." />
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
              <h3 style={{ marginBottom: '4px' }}>{patientDetails.user.fullName}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                ID: {patientDetails.profile?.patient_id_number} | Email: {patientDetails.user.email} | Mobile: {patientDetails.user.mobileNumber}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: '4px 0 0 0' }}>
                Address: {patientDetails.profile?.address}
              </p>
            </div>

            <h4 style={{ marginBottom: '0.75rem', fontSize: 'var(--font-size-base)' }}>Appointment History</h4>
            {patientDetails.appointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No appointments recorded.</p>
            ) : (
              <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="table" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Slot</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDetails.appointments.map((a: any) => (
                      <tr key={a.id}>
                        <td>{a.bookingReference}</td>
                        <td>{a.slotStartTime}</td>
                        <td>{a.testType}</td>
                        <td><Badge type={a.status}>{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 style={{ marginBottom: '0.75rem', fontSize: 'var(--font-size-base)' }}>Issued Diagnostic Reports</h4>
            {patientDetails.reports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No reports issued yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <thead>
                    <tr>
                      <th>Report Ref</th>
                      <th>Date</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDetails.reports.map((r: any) => (
                      <tr key={r.id}>
                        <td>{r.reportReference}</td>
                        <td>{r.testingDate}</td>
                        <td><Badge type={r.testResult}>{r.testResult}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

