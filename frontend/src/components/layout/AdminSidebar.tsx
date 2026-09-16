import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="px-4 py-5 text-lg font-bold border-b border-slate-800 flex items-center gap-3">
        <img src="/logo.png" alt="Shri Krishna Rentals Logo" className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-xs shrink-0" />
        <span className="leading-normal flex-1">Shri Krishna Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 pb-6 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-start gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 w-full rounded-lg transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
