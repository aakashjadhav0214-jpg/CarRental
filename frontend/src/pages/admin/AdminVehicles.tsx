import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../../api/axios';

export const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm = {
    category: 'Cars', brand: '', model: '', registration_number: '', year: new Date().getFullYear(),
    fuel_type: 'Petrol', transmission: 'Manual', seats: 4, daily_price: 1000, security_deposit: 5000, status: 'AVAILABLE', image_urls: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await api.post('/admin/vehicles/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls ? `${url}, ${prev.image_urls}` : url
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingId(vehicle.id);
    setFormData({
      ...vehicle,
      image_urls: vehicle.images ? vehicle.images.map((img: any) => img.image_url).join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const images = formData.image_urls.split(',').map(url => ({ image_url: url.trim(), is_primary: true })).filter(img => img.image_url.length > 0);
      
      const payload = {
        ...formData,
        year: parseInt(formData.year.toString()),
        seats: parseInt(formData.seats.toString()),
        daily_price: parseFloat(formData.daily_price.toString()),
        security_deposit: parseFloat(formData.security_deposit.toString()),
        images
      };

      if (editingId) {
        await api.put(`/admin/vehicles/${editingId}`, payload);
      } else {
        await api.post('/admin/vehicles', payload);
      }
      
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert('Failed to save vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this vehicle?')) return;
    try {
      await api.delete(`/admin/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert('Failed to delete vehicle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Vehicles</h1>
        <Button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 font-bold">
          <Plus size={18} /> Add Vehicle
        </Button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Vehicle</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Registration</th>
                <th className="px-6 py-4 font-bold">Daily Rate</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-bold">Loading...</td></tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">{v.brand} {v.model}</p>
                      <p className="text-xs font-bold text-slate-500">{v.year}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">{v.category}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{v.registration_number}</td>
                    <td className="px-6 py-4 font-bold text-white">₹{v.daily_price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => openEditModal(v)} className="text-indigo-400 hover:text-indigo-300 p-2 rounded-xl hover:bg-indigo-500/10 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmitVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium">
                    <option>Cars</option>
                    <option>Bikes</option>
                    <option>Mopeds/Scooters</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registration Number</label>
                  <input name="registration_number" value={formData.registration_number} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Model</label>
                  <input name="model" value={formData.model} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seats</label>
                  <input type="number" name="seats" value={formData.seats} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fuel Type</label>
                  <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium">
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transmission</label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium">
                    <option>Manual</option>
                    <option>Automatic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daily Price (₹)</label>
                  <input type="number" name="daily_price" value={formData.daily_price} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
                  <input type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image URLs (comma separated)</label>
                <div className="flex gap-4 items-center">
                  <input name="image_urls" value={formData.image_urls} onChange={handleChange} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium" />
                  
                  <div className="relative shrink-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" className="bg-slate-800 hover:bg-slate-700 font-bold whitespace-nowrap" disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload File...'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-800">
                <Button type="button" variant="outline" className="border-slate-700 text-slate-300" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-bold">Save Vehicle</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
