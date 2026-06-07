import { NavLink } from 'react-router-dom';

export default function NavBar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <nav className="bg-[#003057] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">Volvo XC60 T8</h1>
          <p className="text-blue-300 text-xs">2021 Recharge · Maintenance Tracker</p>
        </div>
        <div className="flex gap-1">
          <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
          <NavLink to="/history" className={linkClass}>History</NavLink>
          <NavLink to="/add" className={linkClass}>Add Service</NavLink>
          <NavLink to="/schedule" className={linkClass}>Schedule</NavLink>
        </div>
      </div>
    </nav>
  );
}
