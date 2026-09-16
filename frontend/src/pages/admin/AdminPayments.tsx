import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatewayEnabled, setGatewayEnabled] = useState(true);

  const fetchLedger = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeBookings = payments.filter(p => p.booking_status !== 'CANCELLED');
  const totalRevenue = activeBookings.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalAdvanceCollected = activeBookings.reduce((acc, curr) => acc + (curr.advance_paid || (curr.payment_status === 'PAID' ? curr.total_amount : 0)), 0);
  const totalBalanceDue = activeBookings.reduce((acc, curr) => acc + (curr.balance_due ?? (curr.payment_status === 'PAID' ? 0 : curr.total_amount)), 0);

  const [uploadingQr, setUploadingQr] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        const res = await api.get('/payments/qr-scanner-url');
        if (res.data.url) {
          const resolveUrl = res.data.url.startsWith('http://localhost:8000') 
            ? res.data.url.replace('http://localhost:8000', '') 
            : res.data.url;
          setCurrentQrUrl(resolveUrl);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQrUrl();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadingQr(true);
    try {
      const res = await api.post('/payments/upload-qr-scanner', formData, {
        headers: { 'Content-Type': 'multipart/form-stream' }
      });
      alert('GPay Scanner image uploaded successfully!');
      const resolveUrl = res.data.url.startsWith('http://localhost:8000') 
        ? res.data.url.replace('http://localhost:8000', '') + `?t=${Date.now()}` 
        : res.data.url;
      setCurrentQrUrl(resolveUrl);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload QR Scanner image');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleVerifyUpi = async (bookingId: string, action: 'APPROVE' | 'REJECT') => {
    if (!window.confirm(`Are you sure you want to ${action === 'APPROVE' ? 'APPROVE & CONFIRM' : 'REJECT & CANCEL'} this payment?`)) return;
    try {
      await api.post(`/payments/verify-upi/${bookingId}`, { action });
      alert(`Payment ${action === 'APPROVE' ? 'Approved & Confirmed' : 'Rejected'} successfully!`);
      fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update payment status');
    }
  };

  const handleSettleBalance = async (bookingId: string) => {
    if (!window.confirm('Mark remaining balance as collected and fully paid?')) return;
    try {
      await api.post(`/payments/settle-balance/${bookingId}`);
      alert('Balance settled successfully! Booking marked fully paid.');
      fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to settle balance');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Payments &amp; Revenue</h1>
            <p className="text-slate-400">Manage transaction history, advance payments &amp; balance collections.</p>
          </div>
        </div>

        <button 
          onClick={fetchLedger}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={14} /> Refresh Ledger
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Booking Revenue</h3>
            <DollarSign className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-slate-500 text-xs font-semibold mt-1">Full contract total</p>
        </div>
        
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Advance Collected</h3>
            <CreditCard className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">₹{totalAdvanceCollected.toLocaleString()}</p>
          <p className="text-emerald-500/80 text-xs font-semibold mt-1">Paid in advance</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Balance Due</h3>
            <TrendingUp className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">₹{totalBalanceDue.toLocaleString()}</p>
          <p className="text-amber-500/80 text-xs font-semibold mt-1">Due at pickup</p>
        </div>
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3">Gateway Status</h3>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span className="text-lg font-bold text-white">Direct UPI Active</span>
          </div>
          <p className="text-emerald-400 font-medium text-xs">GPay / PhonePe Scanner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gateway Config & GPay QR Scanner Upload */}
        <div className="space-y-6">
          
          {/* Shop UPI QR Code Upload */}
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <CreditCard size={18} className="text-emerald-400" />
              <h2 className="text-base font-bold text-white">Upload Shop GPay / UPI Scanner</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload your shop's Google Pay, PhonePe, or Paytm QR Scanner image so customers can pay directly into your account.
            </p>

            {currentQrUrl ? (
              <div className="mb-4 text-center">
                <img 
                  src={currentQrUrl} 
                  alt="Uploaded Shop GPay Scanner" 
                  className="w-36 h-36 mx-auto rounded-xl border border-slate-700 bg-white p-2 object-contain"
                />
                <span className="text-[11px] font-bold text-emerald-400 block mt-2">Current Active Scanner</span>
              </div>
            ) : (
              <div className="mb-4 text-center p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50">
                <p className="text-xs text-slate-500 font-semibold">No custom QR image uploaded yet (Using default live generator)</p>
              </div>
            )}

            <label className="block w-full">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleQrUpload}
                disabled={uploadingQr}
                className="hidden" 
              />
              <span className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                {uploadingQr ? 'Uploading Scanner...' : 'Choose File to Change Scanner'}
              </span>
            </label>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-white mb-4">Gateway Configuration</h2>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white text-sm">Accept Payments</p>
                <p className="text-xs text-slate-400 mt-0.5">Enable or disable checkout flow.</p>
              </div>
              <button 
                onClick={() => setGatewayEnabled(!gatewayEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${gatewayEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${gatewayEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Recent Transactions &amp; Ledger</h2>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading ledger...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">Txn ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment Date &amp; Time</th>
                    <th className="p-4">UTR / Ref No.</th>
                    <th className="p-4">Payment Breakdown</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {payments.map((p) => {
                    const isCancelled = p.booking_status === 'CANCELLED';
                    const isPendingVerification = p.payment_status === 'PENDING_VERIFICATION';
                    const isAdvancePaid = p.payment_status === 'ADVANCE_PAID';
                    
                    const displayStatus = isCancelled 
                      ? 'CANCELLED' 
                      : (isPendingVerification ? 'PENDING VERIFICATION' : (isAdvancePaid ? 'ADVANCE PAID' : (p.payment_status || 'PAID')));

                    let statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    if (isCancelled) statusColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                    if (isPendingVerification) statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
                    if (isAdvancePaid) statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

                    const utrNumber = p.payment?.gateway_payment_id || 'N/A';
                    const paymentDateObj = p.payment?.created_at ? new Date(p.payment.created_at) : new Date(p.created_at);
                    const dateStr = paymentDateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = paymentDateObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
                    
                    const advanceVal = p.advance_paid ?? p.payment?.amount ?? p.total_amount;
                    const balanceVal = p.balance_due ?? (p.total_amount - advanceVal);

                    return (
                      <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-slate-500">#{p.booking_number || p.id.substring(0, 6)}</td>
                        <td className="p-4 font-bold text-white">{p.user?.name || 'Unknown'}</td>
                        <td className="p-4 text-xs font-semibold text-slate-300">
                          <div className="font-bold text-white">{dateStr}</div>
                          <div className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5">{timeStr}</div>
                        </td>
                        <td className="p-4 font-mono text-xs text-emerald-300 font-bold">{utrNumber}</td>
                        
                        {/* Payment Breakdown Column */}
                        <td className="p-4 text-xs font-semibold">
                          <div className="text-white font-extrabold text-sm">₹{p.total_amount} <span className="text-[10px] text-slate-400 font-normal">Total</span></div>
                          <div className="text-emerald-400 text-[11px] font-bold mt-0.5">
                            Advance Paid: ₹{advanceVal}
                          </div>
                          {balanceVal > 0 ? (
                            <div className="text-amber-400 text-[11px] font-extrabold mt-0.5">
                              Balance Due: ₹{balanceVal}
                            </div>
                          ) : (
                            <div className="text-emerald-300 text-[10px] font-semibold mt-0.5">✓ Fully Settled</div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] block text-center ${statusColor}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {isPendingVerification ? (
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleVerifyUpi(p.id, 'APPROVE')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                                title="Approve Payment"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleVerifyUpi(p.id, 'REJECT')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                                title="Reject Invalid UTR"
                              >
                                Reject
                              </button>
                            </div>
                          ) : balanceVal > 0 && !isCancelled ? (
                            <button
                              onClick={() => handleSettleBalance(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs"
                              title="Collect remaining balance at pickup"
                            >
                              Settle ₹{balanceVal}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Verified</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
