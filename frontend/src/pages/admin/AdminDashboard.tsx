import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Car, CalendarCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0, pendingCount: 0, activeUsers: 0, revenueMTD: 0 });
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
        
        // 1. Filter Confirmed vs Pending Bookings
        const confirmedBookings = bookingsData.filter((b: any) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(b.booking_status));
        const pendingBookings = bookingsData.filter((b: any) => b.booking_status === 'PENDING');

        // 2. Calculate Active Users (Unique Customers with confirmed bookings)
        const uniqueUsers = new Set(confirmedBookings.map((b: any) => b.user_id));
        
        // 3. Calculate Revenue MTD (Month to Date)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let mtd = 0;
        bookingsData.forEach((b: any) => {
          const bDate = new Date(b.created_at);
          // Count revenue ONLY for confirmed paid bookings
          if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear && b.payment_status === 'PAID' && b.booking_status !== 'CANCELLED') {
            mtd += b.total_amount;
          }
        });
        
        setStats({ 
          vehicles: vehiclesData.length, 
          bookings: confirmedBookings.length,
          pendingCount: pendingBookings.length,
          activeUsers: uniqueUsers.size,
          revenueMTD: mtd
        });
        
        // 3. Prepare Revenue Trend Data (Group by Month for paid bookings)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue: Record<string, number> = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          monthlyRevenue[monthNames[d.getMonth()]] = 0;
        }
        
        bookingsData.forEach((b: any) => {
          if (b.payment_status === 'PAID' && b.booking_status !== 'CANCELLED') {
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

  // Helper to extract clean 2-letter initials
  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'CU';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/admin/vehicles')}
          className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all active:scale-95"
        >
          <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400">
            <Car size={24} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400">Total Vehicles</p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">{stats.vehicles}</h2>
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
            <p className="text-xs font-bold tracking-wider text-slate-400">Confirmed Bookings</p>
            <div className="flex items-center gap-3.5 mt-0.5">
              <h2 className="text-2xl font-extrabold text-white">{stats.bookings}</h2>
              {stats.pendingCount > 0 && (
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg shadow-2xs">
                  {stats.pendingCount} Pending
                </span>
              )}
            </div>
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
            <p className="text-xs font-bold tracking-wider text-slate-400">Active Users</p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">{stats.activeUsers}</h2>
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
            <p className="text-xs font-bold tracking-wider text-slate-400">Revenue (MTD)</p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">₹{stats.revenueMTD.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Trend Section */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h2 className="text-lg font-bold mb-6 text-white">Revenue Trend</h2>
          
          {revenueData.length === 0 || revenueData.every(d => d.revenue === 0) ? (
            <div className="h-72 flex flex-col items-center justify-center text-slate-500 text-sm font-medium border border-dashed border-slate-800/80 rounded-xl bg-slate-900/30 p-6 text-center">
              <TrendingUp size={32} className="text-slate-600 mb-2" />
              <p className="text-slate-300 font-bold">No revenue data available for this period</p>
              <span className="text-xs text-slate-500 mt-1">Chart updates automatically when customer payments are captured.</span>
            </div>
          ) : (
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
          )}
        </div>
        
        {/* Recent Activity Section */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col">
          <h2 className="text-lg font-bold mb-6 text-white">Recent Activity</h2>
          <div className="space-y-1 flex-grow overflow-y-auto pr-2">
            {recentBookings.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">No recent activity</div>
            ) : (
              recentBookings.map((booking: any) => {
                // Calculate relative time
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
                  <div key={booking.id} className="flex items-center gap-3.5 py-4 border-b border-slate-800/80 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30 shrink-0">
                      {getInitials(booking.user?.name)}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-sm font-bold text-indigo-300 truncate">{booking.user?.name || "Customer"}</span> 
                          <span className="text-xs text-slate-400">booked</span> 
                          <span className="text-sm font-bold text-white truncate">{booking.vehicle?.make || booking.vehicle?.brand} {booking.vehicle?.model}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1">#{booking.booking_number} &bull; {timeAgo} &bull; ₹{booking.total_amount}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 border rounded-lg shrink-0 ml-auto ${statusColor}`}>
                        {booking.booking_status}
                      </span>
                    </div>
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
