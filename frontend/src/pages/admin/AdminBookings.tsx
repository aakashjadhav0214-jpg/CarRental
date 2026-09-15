import { useState, useEffect } from 'react';
import { Phone, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { booking_status: newStatus });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">View customer contact numbers, update trip statuses &amp; initiate direct calls or WhatsApp chats.</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Booking ID</th>
                <th className="px-6 py-4 font-bold">Customer Contact Info</th>
                <th className="px-6 py-4 font-bold">Dates &amp; Duration</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold text-center">Contact Customer</th>
                <th className="px-6 py-4 font-bold text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-bold">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-bold">No bookings found</td></tr>
              ) : (
                bookings.map(b => {
                  const phoneNum = b.user?.phone || '7259857486';
                  const cleanPhone = phoneNum.replace(/[^0-9]/g, '');

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                        <span className="font-bold text-white block">#{b.booking_number || b.id.substring(0, 8)}</span>
                        <span className="text-[11px] text-slate-500">{new Date(b.created_at || Date.now()).toLocaleDateString()}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {b.user?.name ? b.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{b.user?.name || 'Customer'}</span>
                            <span className="text-xs text-emerald-400 font-semibold block">{phoneNum}</span>
                            <span className="text-[11px] text-slate-400 block">{b.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">
                        <div className="space-y-0.5">
                          <p><b>Pickup:</b> {new Date(b.pickup_datetime).toLocaleString()}</p>
                          <p><b>Return:</b> {new Date(b.return_datetime).toLocaleString()}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-black text-white text-base">
                        ₹{b.total_amount}
                        <span className={`block text-[10px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded w-fit ${
                          b.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>

                      {/* 1-Click Direct Contact Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a 
                            href={`tel:${phoneNum}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                            title={`Call ${b.user?.name || 'Customer'}`}
                          >
                            <Phone size={13} /> Call
                          </a>
                          <a 
                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=Hello%20${encodeURIComponent(b.user?.name || '')}%2C%20this%20is%20Shri%20Krishna%20Car%20%26%20Bike%20Rentals%20regarding%20booking%20%23${encodeURIComponent(b.booking_number || b.id.substring(0,8))}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                            title={`WhatsApp ${b.user?.name || 'Customer'}`}
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        </div>
                      </td>

                      {/* Status Action */}
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={b.booking_status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="px-3 py-2 border border-slate-700 rounded-lg text-xs bg-slate-900 text-white font-bold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="ACTIVE">Active (Picked Up)</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

