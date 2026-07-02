import type { BlogStatus } from '../mockData';

interface StatusBadgeProps {
  status: BlogStatus;
}

const config: Record<BlogStatus, { label: string; classes: string }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  published: {
    label: 'Published',
    classes: 'bg-green-50 text-green-700 border border-green-200',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, classes } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${classes}`}
      style={{ fontSize: '12px', fontWeight: 500 }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          status === 'pending' ? 'bg-amber-500' : 'bg-green-500'
        }`}
      />
      {label}
    </span>
  );
}
