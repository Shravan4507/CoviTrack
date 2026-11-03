import React from 'react';

interface BadgeProps {
  type?: 'default' | 'positive' | 'negative' | 'inconclusive' | 'booked' | 'confirmed' | 'completed' | 'cancelled';
  children: React.ReactNode;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'default', children, id }) => {
  let badgeClass = 'badge';
  if (type === 'positive') badgeClass += ' badge-positive';
  else if (type === 'negative') badgeClass += ' badge-negative';
  else if (type === 'inconclusive') badgeClass += ' badge-inconclusive';
  else if (type === 'booked') badgeClass += ' badge-status-booked';
  else if (type === 'confirmed') badgeClass += ' badge-status-confirmed';
  else if (type === 'completed') badgeClass += ' badge-status-completed';
  else if (type === 'cancelled') badgeClass += ' badge-status-cancelled';

  return (
    <span className={badgeClass} id={id}>
      {children}
    </span>
  );
};

