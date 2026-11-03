import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helpText,
  children,
  id,
}) => {
  return (
    <div className="form-group" id={id}>
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {error && <span className="form-error" role="alert">{error}</span>}
      {helpText && !error && <span className="form-help">{helpText}</span>}
    </div>
  );
};

