import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="container header-container">
        <Link to="/" className="brand-logo" id="header-brand-logo">
          <Activity size={20} strokeWidth={2.5} />
          <span>COVITRACK</span>
        </Link>

        <nav>
          <ul className="nav-links">
            {!user && (
              <>
                <li>
                  <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} id="nav-home">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`} id="nav-login">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">
                    Register as Patient
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'patient' && (
              <>
                <li>
                  <Link to="/patient/dashboard" className={`nav-link ${isActive('/patient/dashboard') ? 'active' : ''}`} id="nav-patient-dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/patient/book-appointment" className={`nav-link ${isActive('/patient/book-appointment') ? 'active' : ''}`} id="nav-book-appointment">
                    Book Test
                  </Link>
                </li>
                <li>
                  <Link to="/patient/appointments" className={`nav-link ${isActive('/patient/appointments') ? 'active' : ''}`} id="nav-my-appointments">
                    My Appointments
                  </Link>
                </li>
                <li>
                  <Link to="/patient/reports" className={`nav-link ${isActive('/patient/reports') ? 'active' : ''}`} id="nav-my-reports">
                    My Reports
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'staff' && (
              <>
                <li>
                  <Link to="/staff/dashboard" className={`nav-link ${isActive('/staff/dashboard') ? 'active' : ''}`} id="nav-staff-dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/staff/slots" className={`nav-link ${isActive('/staff/slots') ? 'active' : ''}`} id="nav-manage-slots">
                    Testing Slots
                  </Link>
                </li>
                <li>
                  <Link to="/staff/appointments" className={`nav-link ${isActive('/staff/appointments') ? 'active' : ''}`} id="nav-manage-appointments">
                    Appointments
                  </Link>
                </li>
                <li>
                  <Link to="/staff/patients" className={`nav-link ${isActive('/staff/patients') ? 'active' : ''}`} id="nav-manage-patients">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link to="/staff/create-report" className={`nav-link ${isActive('/staff/create-report') ? 'active' : ''}`} id="nav-create-report">
                    New Report
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} id="nav-admin-dashboard">
                    Admin Stats
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} id="nav-manage-users">
                    Users & Staff
                  </Link>
                </li>
                <li>
                  <Link to="/admin/logs" className={`nav-link ${isActive('/admin/logs') ? 'active' : ''}`} id="nav-audit-logs">
                    Audit Trail
                  </Link>
                </li>
              </>
            )}

            {user && (
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }} id="header-user-badge">
                  [{user.role.toUpperCase()}] {user.fullName}
                </span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm" id="btn-logout" title="Sign Out">
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

