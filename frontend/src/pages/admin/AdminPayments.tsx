import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, DollarSign, Settings, Server } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';

export const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock settings for the demo
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('rzp_test_rEntAl_M0ck_kEy123');

  useEffect(() => {
    // We don't have a dedicated GET /payments endpoint for admin in the MVP yet.
    // So we will just fetch bookings and extract completed/paid ones to act as a payment ledger.
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
    fetchLedger();
  }, []);

  const validPayments = payments.filter(p => p.payment_status === 'PAID' && p.booking_status !== 'CANCELLED');
  const totalRevenue = validPayments.reduce((acc, curr) => acc + curr.total_amount, 0);

  const [uploadingQr, setUploadingQr] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        const res = await api.get('/payments/qr-scanner-url');
        if (res.data.url) {
          const resolveUrl = res.data.url.startsWith('/uploads/') 
            ? `http://${window.location.hostname}:8000${res.data.url}` 
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
      const resolveUrl = res.data.url.startsWith('/uploads/') 
        ? `http://${window.location.hostname}:8000${res.data.url}?t=${Date.now()}` 
        : res.data.url;
      setCurrentQrUrl(resolveUrl);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload QR Scanner image');
    } finally {
      setUploadingQr(false);
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
            <h1 className="text-3xl font-extrabold tracking-tight">Payments & Revenue</h1>
            <p className="text-slate-400">Manage transaction history and gateway settings.</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Gross Revenue</h3>
            <DollarSign className="text-emerald-400" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1 mt-2">
            <TrendingUp size={14} /> +12.5% this month
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Transactions</h3>
            <CreditCard className="text-indigo-400" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-white">{validPayments.length}</p>
          <p className="text-slate-500 text-sm font-medium mt-2">Successful captures</p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-emerald-500/10">
            <Server size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Gateway Status</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span className="text-2xl font-bold text-white">Direct UPI Active</span>
            </div>
            <p className="text-emerald-400 font-medium text-sm">GPay / PhonePe Scanner Ready</p>
          </div>
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

            <label className="block">
              <span className="sr-only">Choose GPay Scanner photo</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleQrUpload}
                disabled={uploadingQr}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </label>
            {uploadingQr && <p className="text-xs text-emerald-400 font-bold mt-2 animate-pulse">Uploading scanner photo...</p>}
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 h-fit">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Settings size={20} className="text-slate-400" />
              <h2 className="text-lg font-bold text-white">Gateway Configuration</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div>
                  <p className="font-bold text-white">Accept Payments</p>
                  <p className="text-xs text-slate-500">Enable or disable checkout flow.</p>
                </div>
                <div 
                  onClick={() => setGatewayEnabled(!gatewayEnabled)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${gatewayEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: gatewayEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Razorpay API Key</label>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl py-3 shadow-lg shadow-indigo-500/20">
                Save Configuration
              </Button>
            </div>
          </div>
        </div>


        {/* Ledger */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
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
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {payments.map((p) => {
                    const isCancelled = p.booking_status === 'CANCELLED';
                    const displayStatus = isCancelled ? 'REFUNDED' : (p.payment_status || 'SUCCESS');
                    const statusColor = isCancelled 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    
                    return (
                      <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-slate-500">pay_{p.id.substring(0, 8)}</td>
                        <td className="p-4 font-bold text-white">{p.user?.name || 'Unknown'}</td>
                        <td className="p-4 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-white">₹{p.total_amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded font-bold text-xs border ${statusColor}`}>
                            {displayStatus}
                          </span>
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
