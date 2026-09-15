import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Car, CalendarCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0, activeUsers: 0, revenueMTD: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [vRes, bRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/admin/bookings')
        ]);
        
        const vehiclesData = vRes.data;
        const bookingsData = bRes.data;
        
        // 1. Calculate Active Users (Unique User IDs who made a booking)
        const uniqueUsers = new Set(bookingsData.map((b: any) => b.user_id));
        
        // 2. Calculate Revenue MTD (Month to Date)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let mtd = 0;
        bookingsData.forEach((b: any) => {
          const bDate = new Date(b.created_at);
          // Count revenue for valid bookings (not cancelled)
          if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear && b.booking_status !== 'CANCELLED') {
            mtd += b.total_amount;
          }
        });
        
        setStats({ 
          vehicles: vehiclesData.length, 
          bookings: bookingsData.length,
          activeUsers: uniqueUsers.size,
          revenueMTD: mtd
        });
        
        // 3. Prepare Revenue Trend Data (Group by Month)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue: Record<string, number> = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          monthlyRevenue[monthNames[d.getMonth()]] = 0;
        }
        
        bookingsData.forEach((b: any) => {
          if (b.booking_status !== 'CANCELLED') {
            const bDate = new Date(b.created_at);
            const mName = monthNames[bDate.getMonth()];
            if (monthlyRevenue[mName] !== undefined) {
              monthlyRevenue[mName] += b.total_amount;
            }
          }
        });
        
        const chartData = Object.keys(monthlyRevenue).map(key => ({
          name: key,
          revenue: monthlyRevenue[key]
        }));
        setRevenueData(chartData);
        
        // 4. Set Recent Activity (Last 5 bookings)
        const sortedBookings = [...bookingsData].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentBookings(sortedBookings.slice(0, 5));

      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/admin/vehicles')}
          className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all active:scale-95"
        >
          <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400">
            <Car size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vehicles</p>
            <h3 className="text-2xl font-extrabold text-white">{stats.vehicles}</h3>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/admin/bookings')}
          className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-800/40 hover:border-emerald-500/30 transition-all active:scale-95"
        >
          <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <h3 className="text-2xl font-extrabold text-white">{stats.bookings}</h3>
          </div>
        </div>
        
        <div 
          className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 cursor-help hover:bg-slate-800/20 transition-colors"
          title="Active users across all bookings"
        >
          <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Users</p>
            <h3 className="text-2xl font-extrabold text-white">{stats.activeUsers}</h3>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/admin/payments')}
          className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-800/40 hover:border-amber-500/30 transition-all active:scale-95"
        >
          <div className="bg-amber-500/20 p-3 rounded-xl text-amber-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue (MTD)</p>
            <h3 className="text-2xl font-extrabold text-white">₹{stats.revenueMTD.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6 text-white">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff'}}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            {recentBookings.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">No recent activity</div>
            ) : (
              recentBookings.map((booking: any) => {
                // Calculate relative time (e.g. "2 hours ago")
                const diffMs = new Date().getTime() - new Date(booking.created_at).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHrs = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHrs / 24);
                let timeAgo = "Just now";
                if (diffDays > 0) timeAgo = `${diffDays} days ago`;
                else if (diffHrs > 0) timeAgo = `${diffHrs} hours ago`;
                else if (diffMins > 0) timeAgo = `${diffMins} mins ago`;

                // Status styling
                let statusColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                if (booking.booking_status === 'CONFIRMED' || booking.booking_status === 'COMPLETED') {
                  statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                } else if (booking.booking_status === 'PENDING') {
                  statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                } else if (booking.booking_status === 'CANCELLED') {
                  statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
                }

                return (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                        {booking.user?.name ? booking.user.name.substring(0, 2).toUpperCase() : booking.user_id.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="text-indigo-300">{booking.user?.name || "Customer"}</span> 
                          <span className="text-slate-400 font-normal">booked</span> 
                          <span>{booking.vehicle?.brand} {booking.vehicle?.model}</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500">#{booking.booking_number} &bull; {timeAgo} &bull; ₹{booking.total_amount}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 border rounded-lg ${statusColor}`}>
                      {booking.booking_status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
