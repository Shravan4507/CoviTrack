import React, { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, id }) => {
  return (
    <div className="empty-state" id={id}>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  );
};

