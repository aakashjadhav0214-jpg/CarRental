import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../api/axios';

export const ResetPassword = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { 
        token: token.trim(),
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

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
            <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Set New Password</h2>
            <p className="text-slate-400">Enter your reset token and new password.</p>
          </div>

          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Reset Token</label>
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono placeholder-slate-600 transition-all"
                  placeholder="Paste your token here"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                isLoading={loading}
              >
                Reset Password
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4 py-6"
            >
              <CheckCircle2 size={64} className="text-emerald-500 mb-2" />
              <h3 className="text-2xl font-bold text-white">Password Updated!</h3>
              <p className="text-slate-400">Your password has been changed successfully.</p>
              <p className="text-sm font-bold text-indigo-400 animate-pulse mt-4">Redirecting to login...</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
