import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/schedule').then(r => r.json()),
    ]).then(([svcs, sched]) => {
      setServices(svcs);
      setSchedule(sched);
      setLoading(false);
    });
  }, []);

  const currentMileage = schedule[0]?.current_mileage ?? 0;
  const overdue = schedule.filter(s => s.status === 'overdue');
  const urgent = schedule.filter(s => s.status === 'urgent');
  const upcoming = schedule.filter(s => s.status === 'upcoming');
  const recentServices = services.slice(0, 5);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Mileage"
          value={currentMileage.toLocaleString()}
          sub="miles"
          accent="#003057"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          sub="items"
          accent={overdue.length > 0 ? '#ef4444' : '#e5e7eb'}
          valueColor={overdue.length > 0 ? 'text-red-600' : 'text-gray-400'}
        />
        <StatCard
          label="Urgent"
          value={urgent.length}
          sub="items"
          accent={urgent.length > 0 ? '#f97316' : '#e5e7eb'}
          valueColor={urgent.length > 0 ? 'text-orange-500' : 'text-gray-400'}
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          sub="items"
          accent={upcoming.length > 0 ? '#eab308' : '#e5e7eb'}
          valueColor={upcoming.length > 0 ? 'text-yellow-600' : 'text-gray-400'}
        />
      </div>

      {/* Alert banner */}
      {(overdue.length > 0 || urgent.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-800 mb-3">Attention Required</h2>
          <ul className="space-y-2">
            {[...overdue, ...urgent].map(item => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <StatusBadge status={item.status} />
                <span className="text-red-700 font-medium">{item.name}</span>
                {item.next_due_miles && (
                  <span className="text-gray-500">
                    · due at {item.next_due_miles.toLocaleString()} mi
                  </span>
                )}
                {item.next_due_date && (
                  <span className="text-gray-500">· by {item.next_due_date}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming maintenance */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Upcoming Maintenance</h2>
            <Link to="/schedule" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400">
                Nothing due in the next 3,000 miles / 90 days.
              </p>
            ) : (
              upcoming.map(item => (
                <div key={item.id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    {item.next_due_miles && (
                      <p className="text-xs text-gray-400">
                        Due at {item.next_due_miles.toLocaleString()} mi
                        {' '}({(item.next_due_miles - item.current_mileage).toLocaleString()} mi away)
                      </p>
                    )}
                    {item.next_due_date && (
                      <p className="text-xs text-gray-400">By {item.next_due_date}</p>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent services */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Recent Services</h2>
            <Link to="/history" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentServices.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400">
                No service records yet.{' '}
                <Link to="/add" className="text-blue-600 hover:underline">
                  Add your first →
                </Link>
              </p>
            ) : (
              recentServices.map(svc => (
                <div key={svc.id} className="px-5 py-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">{svc.service_type}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {svc.cost > 0 ? `$${Number(svc.cost).toFixed(2)}` : '—'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {svc.date} · {svc.mileage.toLocaleString()} mi
                    {svc.shop_name ? ` · ${svc.shop_name}` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, valueColor = 'text-[#003057]' }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border-l-4" style={{ borderLeftColor: accent }}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
