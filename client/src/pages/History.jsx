import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function History() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { setServices(data); setLoading(false); });
  }, []);

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return (
      s.service_type.toLowerCase().includes(q) ||
      (s.shop_name || '').toLowerCase().includes(q) ||
      (s.notes || '').toLowerCase().includes(q)
    );
  });

  const totalCost = filtered.reduce((sum, s) => sum + (s.cost || 0), 0);

  const handleDelete = async id => {
    if (!window.confirm('Delete this service record?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Service History</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total:{' '}
            <span className="font-semibold text-gray-800">${totalCost.toFixed(2)}</span>
            {' '}· {filtered.length} records
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
          />
          <Link
            to="/add"
            className="bg-[#003057] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#00427a] transition-colors whitespace-nowrap"
          >
            + Add
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search ? 'No results match your search.' : 'No service records yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Shop</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Mileage</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Notes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(svc => (
                  <tr key={svc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{svc.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{svc.service_type}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{svc.shop_name || '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{svc.mileage.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {svc.cost > 0 ? `$${Number(svc.cost).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell max-w-xs truncate">
                      {svc.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(svc.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
