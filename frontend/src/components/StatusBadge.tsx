import React from 'react';

const statusMap: Record<string, { label: string; color: string }> = {
  creating: { label: 'Creating', color: '#f0ad4e' },
  ready: { label: 'Ready', color: '#5cb85c' },
  running: { label: 'Running', color: '#0275d8' },
  failed: { label: 'Failed', color: '#d9534f' },
  pending: { label: 'Pending', color: '#f0ad4e' },
  pass: { label: 'Pass', color: '#5cb85c' },
  fail: { label: 'Fail', color: '#d9534f' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const info = statusMap[status] || { label: status, color: '#ccc' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2em 0.7em',
      borderRadius: '1em',
      background: info.color,
      color: '#fff',
      fontWeight: 500,
      fontSize: '0.9em',
    }}>{info.label}</span>
  );
};

export default StatusBadge;
