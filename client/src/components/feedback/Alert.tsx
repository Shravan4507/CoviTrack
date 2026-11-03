import React, { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  message?: string;
  children?: ReactNode;
  id?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, children, id }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} strokeWidth={2} />;
      case 'warning':
        return <AlertTriangle size={18} strokeWidth={2} />;
      case 'success':
        return <CheckCircle size={18} strokeWidth={2} />;
      default:
        return <Info size={18} strokeWidth={2} />;
    }
  };

  return (
    <div className={`alert alert-${type}`} id={id} role="alert">
      <div style={{ flexShrink: 0 }}>{getIcon()}</div>
      <div>{message || children}</div>
    </div>
  );
};

