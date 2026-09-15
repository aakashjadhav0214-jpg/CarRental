import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Car } from 'lucide-react';
import api from '../api/axios';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((e: any) => e.msg).join(', '));
        } else {
          setError(detail);
        }
      } else {
        setError(err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <CardContent className="pt-10 px-8 pb-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-indigo-400 mb-6 transform -rotate-3">
              <Car size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-white text-center tracking-tight">Create an Account</h2>
          </div>
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <Input label="Full Name" type="text" id="name" value={formData.name} onChange={handleChange} required />
            <Input label="Email Address" type="email" id="email" value={formData.email} onChange={handleChange} required />
            <Input label="Phone Number" type="tel" id="phone" value={formData.phone} onChange={handleChange} required />
            <Input label="Password" type="password" id="password" value={formData.password} onChange={handleChange} required />
            <Input label="Confirm Password" type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            
            <Button className="w-full py-4 mt-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]" type="submit">
              Create Account
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center text-sm font-medium text-slate-400">
            Already have an account? <Link to="/login" className="text-white hover:text-indigo-400 font-bold ml-1 transition-colors">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
