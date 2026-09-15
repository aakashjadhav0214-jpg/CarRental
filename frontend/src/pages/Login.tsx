import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username'
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = response.data.access_token;
      
      // Fetch user profile immediately
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(token, userRes.data);
      navigate(userRes.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        setError(Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <CardContent className="pt-10 px-8 pb-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-indigo-400 mb-6 transform -rotate-3">
              <Car size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-white text-center tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Login to manage your bookings</p>
          </div>
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <Input 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            
            <div className="flex flex-col gap-5 mt-8">
              <Button className="w-full py-4 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]" type="submit" isLoading={loading}>
                Login to Account
              </Button>
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center text-sm font-medium text-slate-400">
            Don't have an account? <Link to="/register" className="text-white hover:text-indigo-400 font-bold ml-1 transition-colors">Register here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
