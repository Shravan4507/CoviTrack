import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/feedback/Alert';
import { Plus, UserPlus } from 'lucide-react';
import {
  isValidFullName,
  isValidEmail,
  isValidMobileNumber,
  isValidPassword,
} from '../../validators/regex';

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [staffErrors, setStaffErrors] = useState<Record<string, string>>({});
  const [creatingStaff, setCreatingStaff] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers({
        role: (roleFilter as any) || undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to retrieve user accounts.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await adminService.toggleUserStatus(userId, newStatus as any);
      if (response.success) {
        setSuccessMsg(`User #${userId} status updated to ${newStatus}.`);
        await fetchUsers();
      } else {
        setError(response.error || 'Failed to update user status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing status update.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!staffForm.fullName.trim() || !isValidFullName(staffForm.fullName)) {
      errors.fullName = 'Full name must be 3-50 letters and spaces.';
    }
    if (!staffForm.email.trim() || !isValidEmail(staffForm.email)) {
      errors.email = 'Valid email is required.';
    }
    if (!staffForm.mobileNumber.trim() || !isValidMobileNumber(staffForm.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }
    if (!staffForm.password || !isValidPassword(staffForm.password)) {
      errors.password = 'Password must be at least 8 characters with letters & numbers.';
    }

    if (Object.keys(errors).length > 0) {
      setStaffErrors(errors);
      return;
    }

    setCreatingStaff(true);
    setStaffErrors({});
    setError(null);

    try {
      const response = await adminService.createStaff(staffForm);
      if (response.success) {
        setSuccessMsg('Staff member account created successfully.');
        setIsStaffModalOpen(false);
        setStaffForm({ fullName: '', email: '', mobileNumber: '', password: '' });
        await fetchUsers();
      } else {
        if (response.errors) setStaffErrors(response.errors);
        setError(response.error || 'Staff creation failed.');
      }
    } catch (err: any) {
      if (err.errors) setStaffErrors(err.errors);
      setError(err.message || 'Error creating staff in database.');
    } finally {
      setCreatingStaff(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Manage User Accounts</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Authorize personnel, manage patient status, and provision staff credentials
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsStaffModalOpen(true)}
            id="btn-open-create-staff"
          >
            <UserPlus size={14} />
            <span>Create Staff Member</span>
          </Button>
        </div>
      </div>

      {error && <Alert type="error" id="manage-users-error">{error}</Alert>}
      {successMsg && <Alert type="success" id="manage-users-success">{successMsg}</Alert>}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Filter by Role:</label>
          <select
            id="select-user-role-filter"
            className="form-select"
            style={{ width: '180px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="patient">Patients</option>
            <option value="staff">Staff Members</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading user directory..." />
      ) : (
        <Card id="card-users-table">
          <div className="table-responsive">
            <table className="table" id="table-users">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} id={`row-user-${u.id}`}>
                    <td style={{ fontWeight: 600 }}>#{u.id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile_number}</td>
                    <td>
                      <span className="badge">[{u.role.toUpperCase()}]</span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          borderColor: u.account_status === 'active' ? '#FFFFFF' : 'var(--color-error)',
                          color: u.account_status === 'active' ? '#FFFFFF' : 'var(--color-error)',
                        }}
                      >
                        {u.account_status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.account_status === 'active' ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(u.id, u.account_status)}
                          id={`btn-toggle-user-${u.id}`}
                        >
                          {u.account_status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Provision Authorized Staff Account"
        id="modal-create-staff"
      >
        <form onSubmit={handleCreateStaff} id="form-create-staff">
          <FormField
            label="Staff Full Name"
            required
            error={staffErrors.fullName}
            id="group-staff-fullname"
          >
            <input
              type="text"
              id="input-staff-fullname"
              className="form-input"
              placeholder="e.g. Dr. Jane Smith"
              value={staffForm.fullName}
              onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
              disabled={creatingStaff}
            />
          </FormField>

          <FormField
            label="Staff Email Address"
            required
            error={staffErrors.email}
            id="group-staff-email"
          >
            <input
              type="email"
              id="input-staff-email"
              className="form-input"
              placeholder="e.g. staff.smith@covitrack.local"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              disabled={creatingStaff}
            />
          </FormField>

          <FormField
            label="Mobile Number"
            required
            error={staffErrors.mobileNumber}
            helpText="10 numeric digits"
            id="group-staff-mobile"
          >
            <input
              type="tel"
              id="input-staff-mobile"
              className="form-input"
              placeholder="e.g. 9876543211"
              value={staffForm.mobileNumber}
              onChange={(e) => setStaffForm({ ...staffForm, mobileNumber: e.target.value })}
              maxLength={10}
              disabled={creatingStaff}
            />
          </FormField>

          <FormField
            label="Temporary Password"
            required
            error={staffErrors.password}
            helpText="Min 8 characters, letters & numbers"
            id="group-staff-password"
          >
            <input
              type="password"
              id="input-staff-password"
              className="form-input"
              placeholder="Assign secure password"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              disabled={creatingStaff}
            />
          </FormField>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStaffModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={creatingStaff}
              id="btn-submit-create-staff"
            >
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

