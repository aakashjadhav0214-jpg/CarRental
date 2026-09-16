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

  useEffect(() => { 
    fetchBookings(); 
    const interval = setInterval(fetchBookings, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { booking_status: newStatus });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleSettleBalance = async (bookingId: string) => {
    if (!window.confirm('Mark remaining balance as collected and fully paid for this customer?')) return;
    try {
      await api.post(`/payments/settle-balance/${bookingId}`);
      alert('Balance settled successfully! Customer booking marked fully paid.');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to settle balance');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Bookings &amp; Customer Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">View customer contact details, advance paid, balance due &amp; settle rental balances.</p>
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
                <th className="px-6 py-4 font-bold">Customer Info</th>
                <th className="px-6 py-4 font-bold">Dates &amp; Duration</th>
                <th className="px-6 py-4 font-bold">Payment (Advance &amp; Balance)</th>
                <th className="px-6 py-4 font-bold text-center">Contact Customer</th>
                <th className="px-6 py-4 font-bold text-right">Status &amp; Actions</th>
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
                  
                  const advanceVal = b.advance_paid ?? (b.payment_status === 'PAID' ? b.total_amount : 0);
                  const balanceVal = b.balance_due ?? (b.payment_status === 'PAID' ? 0 : (b.total_amount - advanceVal));

                  const isCancelled = b.booking_status === 'CANCELLED';
                  const waMsg = `Hello ${b.user?.name || 'Customer'}, this is Shri Krishna Rentals regarding your booking #${b.booking_number || b.id.substring(0,8)}. Total: ₹${b.total_amount}, Advance Paid: ₹${advanceVal}, Balance Due at Pickup: ₹${balanceVal}.`;

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                        <span className="font-bold text-white block">#{b.booking_number || b.id.substring(0, 8)}</span>
                        <span className="text-[11px] text-slate-500">{new Date(b.created_at || Date.now()).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}</span>
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
                          <p><b>Pickup:</b> {new Date(b.pickup_datetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p>
                          <p><b>Return:</b> {new Date(b.return_datetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p>
                        </div>
                      </td>

                      {/* Amount: Advance & Balance Breakdown for each customer */}
                      <td className="px-6 py-4 text-xs">
                        <div className="font-black text-white text-base">₹{b.total_amount} <span className="text-[10px] text-slate-400 font-normal">Total</span></div>
                        <div className="text-emerald-400 font-bold text-[11px] mt-0.5">
                          Advance Paid: ₹{advanceVal}
                        </div>
                        {balanceVal > 0 ? (
                          <div className="text-amber-400 font-extrabold text-[11px] mt-0.5">
                            Balance Due: ₹{balanceVal}
                          </div>
                        ) : (
                          <div className="text-emerald-300 font-semibold text-[10px] mt-0.5">✓ Fully Paid</div>
                        )}
                        <span className={`inline-block text-[10px] font-extrabold uppercase mt-1.5 px-2 py-0.5 rounded border ${
                          b.payment_status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          b.payment_status === 'ADVANCE_PAID' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          b.payment_status === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>

                      {/* Direct Customer Phone & WhatsApp */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-center">
                          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/80 w-fit">
                            <Phone size={13} className="text-emerald-400 shrink-0" />
                            <span className="font-mono text-xs font-extrabold text-white tracking-wide select-all">
                              {phoneNum}
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(cleanPhone);
                                alert(`Copied ${cleanPhone} to clipboard!`);
                              }}
                              className="text-[10px] text-slate-400 hover:text-emerald-300 font-bold ml-1 uppercase"
                              title="Copy phone number"
                            >
                              Copy
                            </button>
                          </div>

                          <a 
                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(waMsg)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-fit shadow-xs"
                            title={`WhatsApp ${b.user?.name || 'Customer'}`}
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        </div>
                      </td>

                      {/* Status Action & Balance Settlement */}
                      <td className="px-6 py-4 text-right space-y-2">
                        <select 
                          value={b.booking_status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="px-3 py-2 border border-slate-700 rounded-lg text-xs bg-slate-900 text-white font-bold focus:outline-none focus:border-emerald-500 block ml-auto"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="ACTIVE">Active (Picked Up)</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        {balanceVal > 0 && !isCancelled && (
                          <button
                            onClick={() => handleSettleBalance(b.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition-colors shadow-xs block ml-auto"
                            title="Collect remaining balance at pickup"
                          >
                            Settle ₹{balanceVal}
                          </button>
                        )}
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

