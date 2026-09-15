import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../api/axios';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      if (res.data.demo_token) {
        setDemoToken(res.data.demo_token);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to login
        </Link>
        
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <KeyRound size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Forgot Password?</h2>
            <p className="text-slate-400">No worries, we'll send you reset instructions.</p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-600 transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                  isLoading={loading}
                >
                  Send Reset Link
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                  <p className="text-slate-400 text-sm">
                    We sent a password reset link to <br/>
                    <span className="text-white font-bold">{email}</span>
                  </p>
                </div>

                {demoToken && (
                  <div className="w-full bg-slate-900 border border-indigo-500/30 p-4 rounded-xl mt-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Demo Mode: Reset Token</p>
                    <p className="font-mono text-sm text-slate-300 break-all select-all bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {demoToken}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                      (In a production environment, this would only exist in your email inbox)
                    </p>
                  </div>
                )}

                <Link to={demoToken ? `/reset-password?token=${encodeURIComponent(demoToken)}` : '/reset-password'} className="w-full">
                  <Button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">
                    Proceed to Reset Password
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
