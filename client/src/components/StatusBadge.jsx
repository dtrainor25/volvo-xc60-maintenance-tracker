const CONFIGS = {
  overdue:  { label: 'Overdue',  cls: 'bg-red-100 text-red-700' },
  urgent:   { label: 'Urgent',   cls: 'bg-orange-100 text-orange-700' },
  upcoming: { label: 'Upcoming', cls: 'bg-yellow-100 text-yellow-700' },
  ok:       { label: 'OK',       cls: 'bg-green-100 text-green-700' },
  unknown:  { label: 'Unknown',  cls: 'bg-gray-100 text-gray-500' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = CONFIGS[status] ?? CONFIGS.unknown;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
