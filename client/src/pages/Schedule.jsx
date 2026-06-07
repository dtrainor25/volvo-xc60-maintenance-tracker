import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';

const STATUS_ORDER = ['overdue', 'urgent', 'upcoming', 'ok', 'unknown'];

const STATUS_BORDER = {
  overdue:  '#ef4444',
  urgent:   '#f97316',
  upcoming: '#eab308',
  ok:       '#22c55e',
  unknown:  '#d1d5db',
};

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => { setSchedule(data); setLoading(false); });
  }, []);

  const sorted = [...schedule].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const filtered = sorted.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'phev') return item.phev;
    return item.status === filter;
  });

  const counts = {
    overdue:  schedule.filter(s => s.status === 'overdue').length,
    urgent:   schedule.filter(s => s.status === 'urgent').length,
    upcoming: schedule.filter(s => s.status === 'upcoming').length,
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  const tabs = [
    { key: 'all',      label: 'All' },
    { key: 'overdue',  label: counts.overdue  > 0 ? `Overdue (${counts.overdue})`   : 'Overdue' },
    { key: 'urgent',   label: counts.urgent   > 0 ? `Urgent (${counts.urgent})`     : 'Urgent' },
    { key: 'upcoming', label: counts.upcoming > 0 ? `Upcoming (${counts.upcoming})` : 'Upcoming' },
    { key: 'phev',     label: 'PHEV' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Maintenance Schedule</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-[#003057] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-4 border-l-4"
            style={{ borderLeftColor: STATUS_BORDER[item.status] ?? STATUS_BORDER.unknown }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                {item.phev && (
                  <span className="inline-block mt-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    PHEV
                  </span>
                )}
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="space-y-0.5 text-xs text-gray-400">
              {item.interval_miles && (
                <p>Every {item.interval_miles.toLocaleString()} miles</p>
              )}
              {item.interval_months && (
                <p>Every {item.interval_months} months</p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Last service</p>
                {item.last_date ? (
                  <>
                    <p className="font-medium text-gray-700">{item.last_date}</p>
                    {item.last_mileage && (
                      <p className="text-gray-400">{item.last_mileage.toLocaleString()} mi</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">Not recorded</p>
                )}
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Next due</p>
                {item.next_due_miles ? (
                  <p className="font-medium text-gray-700">{item.next_due_miles.toLocaleString()} mi</p>
                ) : null}
                {item.next_due_date ? (
                  <p className="text-gray-400">{item.next_due_date}</p>
                ) : null}
                {!item.next_due_miles && !item.next_due_date && (
                  <p className="text-gray-400">—</p>
                )}
              </div>
            </div>

            {item.next_due_miles !== null && item.status !== 'unknown' && (
              <p className="mt-2 text-xs text-gray-400">
                {item.next_due_miles - item.current_mileage > 0
                  ? `${(item.next_due_miles - item.current_mileage).toLocaleString()} mi remaining`
                  : `${Math.abs(item.next_due_miles - item.current_mileage).toLocaleString()} mi overdue`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
