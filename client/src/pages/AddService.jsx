import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICE_TYPES = [
  'Oil & Filter Change',
  'Tire Rotation',
  'Cabin Air Filter',
  'Engine Air Filter',
  'Spark Plugs',
  'Brake Fluid Flush',
  'Coolant Flush',
  'Transmission Fluid',
  'Front Differential Fluid',
  'Rear Differential Fluid',
  'Brake Pad Inspection',
  'Tire Inspection',
  'Wheel Alignment',
  'Wiper Blades',
  '12V Battery Inspection',
  'PHEV Battery Check',
  'EV Drive Motor Service',
  'Hybrid System Inspection',
  'Charging System Check',
  'Multi-Point Inspection',
  'Other',
];

const TODAY = new Date().toISOString().split('T')[0];

export default function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: TODAY,
    mileage: '',
    service_type: SERVICE_TYPES[0],
    cost: '',
    shop_name: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const miles = parseInt(form.mileage);
    if (!form.mileage || isNaN(miles) || miles < 0) {
      setError('Please enter a valid mileage.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mileage: miles, cost: parseFloat(form.cost) || 0 }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setTimeout(() => navigate('/history'), 1200);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-green-500 text-5xl mb-3">✓</div>
        <p className="text-gray-700 font-medium">Service record saved! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Add Service Record</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={set}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Mileage">
            <input
              type="number"
              name="mileage"
              value={form.mileage}
              onChange={set}
              placeholder="e.g. 52000"
              required
              min="0"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Service Type">
          <select name="service_type" value={form.service_type} onChange={set} className={inputCls}>
            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cost ($)">
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={set}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={inputCls}
            />
          </Field>
          <Field label="Shop / Dealer">
            <input
              type="text"
              name="shop_name"
              value={form.shop_name}
              onChange={set}
              placeholder="e.g. Volvo Cars"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            name="notes"
            value={form.notes}
            onChange={set}
            placeholder="Optional notes..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#003057] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#00427a] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
