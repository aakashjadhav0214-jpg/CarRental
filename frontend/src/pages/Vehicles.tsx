import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Users, Fuel, Gauge, Check, Filter, X, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import api from '../api/axios';
import { DEFAULT_VEHICLES } from '../data/defaultVehicles';

export const Vehicles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialPickup = searchParams.get('pickup') || '';
  const initialReturn = searchParams.get('return') || '';
  const initialCategory = searchParams.get('category') || '';
  
  const [pickupDate, setPickupDate] = useState(initialPickup);
  const [returnDate, setReturnDate] = useState(initialReturn);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    categories: initialCategory ? [initialCategory] : [] as string[],
    transmission: [] as string[],
    fuelType: [] as string[]
  });


  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/vehicles');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setVehicles(res.data);
        } else {
          setVehicles(DEFAULT_VEHICLES);
        }
      } catch (err) {
        console.error(err);
        setVehicles(DEFAULT_VEHICLES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleUpdateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupDate) params.append('pickup', pickupDate);
    if (returnDate) params.append('return', returnDate);
    if (filters.categories.length > 0) params.append('category', filters.categories[0]);
    navigate(`/vehicles?${params.toString()}`, { replace: true });
  };

  const toggleFilter = (type: 'categories' | 'transmission' | 'fuelType', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearAllFilters = () => {
    setFilters({ categories: [], transmission: [], fuelType: [] });
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (filters.categories.length > 0 && !filters.categories.includes(v.category)) return false;
      if (filters.transmission.length > 0 && !filters.transmission.includes(v.transmission)) return false;
      if (filters.fuelType.length > 0 && !filters.fuelType.includes(v.fuel_type)) return false;
      return true;
    });
  }, [vehicles, filters]);

  const tripDurationDays = useMemo(() => {
    if (!pickupDate || !returnDate) return null;
    const p = new Date(pickupDate).getTime();
    const r = new Date(returnDate).getTime();
    if (r <= p) return null;
    return Math.ceil((r - p) / (1000 * 60 * 60 * 24));
  }, [pickupDate, returnDate]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-20 md:pt-28 text-slate-900">
      
      {/* Top Search / Date Modifier Bar */}
      <div className="bg-white border-b border-slate-200 py-6 mb-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleUpdateSearch} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 max-w-5xl mx-auto">
            
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <MapPin size={13} className="text-emerald-600" /> Location
              </label>
              <input 
                type="text" 
                defaultValue="Hassan, Karnataka" 
                className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
                readOnly
              />
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Calendar size={13} className="text-emerald-600" /> Pickup Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Calendar size={13} className="text-emerald-600" /> Drop-off Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
              />
            </div>

            <button 
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              Update Dates
            </button>
          </form>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Mobile Overlay */}
          {isFilterOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out
            ${isFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:w-64 lg:p-6 lg:bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:z-auto lg:overflow-visible shrink-0 lg:h-fit
          `}>
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Filter Fleet</h3>
                <div className="flex items-center gap-2">
                  {(filters.categories.length > 0 || filters.transmission.length > 0 || filters.fuelType.length > 0) && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Reset
                    </button>
                  )}
                  <button className="lg:hidden text-slate-400 hover:text-slate-700" onClick={() => setIsFilterOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Vehicle Type</h4>
                  {['Cars', 'Bikes', 'Mopeds/Scooters'].map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => toggleFilter('categories', cat)} 
                      className="flex items-center gap-2.5 mb-2.5 cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        filters.categories.includes(cat) 
                          ? 'bg-emerald-600 text-white' 
                          : 'border border-slate-300 group-hover:border-emerald-500 bg-white'
                      }`}>
                        {filters.categories.includes(cat) && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Transmission Filter */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Transmission</h4>
                  {['Manual', 'Automatic'].map(trans => (
                    <div 
                      key={trans} 
                      onClick={() => toggleFilter('transmission', trans)} 
                      className="flex items-center gap-2.5 mb-2.5 cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        filters.transmission.includes(trans) 
                          ? 'bg-emerald-600 text-white' 
                          : 'border border-slate-300 group-hover:border-emerald-500 bg-white'
                      }`}>
                        {filters.transmission.includes(trans) && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {trans}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fuel Type */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Fuel Type</h4>
                  {['Petrol', 'Diesel', 'Electric'].map(fuel => (
                    <div 
                      key={fuel} 
                      onClick={() => toggleFilter('fuelType', fuel)} 
                      className="flex items-center gap-2.5 mb-2.5 cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        filters.fuelType.includes(fuel) 
                          ? 'bg-emerald-600 text-white' 
                          : 'border border-slate-300 group-hover:border-emerald-500 bg-white'
                      }`}>
                        {filters.fuelType.includes(fuel) && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {fuel}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Help Box */}
                <div className="border-t border-slate-100 pt-5 text-xs text-slate-500">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <ShieldCheck size={16} /> Hassan Showroom Guarantee
                  </div>
                  <p>All cars include 300km/day allowance and 24/7 roadside breakdown assistance.</p>
                </div>

              </div>
            </div>
          </aside>

          {/* Main Content List */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Fleet</h2>
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">
                  {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} matching your criteria
                  {tripDurationDays ? ` • ${tripDurationDays}-day trip calculation` : ''}
                </p>
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs"
              >
                <Filter size={15} className="text-emerald-600" /> Filters
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-xs">
                <Search size={44} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">No Vehicles Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  We couldn't find any vehicles matching your selected filters. Try broadening your criteria.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => {
                  let primaryImage = vehicle.images?.find((img: any) => img.is_primary)?.image_url 
                    || vehicle.images?.[0]?.image_url 
                    || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80';
                  
                  if (primaryImage.startsWith('http://localhost:8000')) {
                    primaryImage = primaryImage.replace('http://localhost:8000', '');
                  }
                  
                  const estimatedTotal = tripDurationDays ? (vehicle.daily_price * tripDurationDays) : vehicle.daily_price;

                  return (
                    <div 
                      key={vehicle.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col md:flex-row group"
                    >
                      {/* Left: Image Container */}
                      <div className="md:w-64 h-52 md:h-auto shrink-0 relative bg-slate-100 overflow-hidden">
                        <img 
                          src={primaryImage} 
                          alt={vehicle.model} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-white/95 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide text-slate-800 border border-slate-200">
                          {vehicle.category}
                        </span>
                      </div>

                      {/* Right: Info & Action */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p className="text-xs font-semibold text-slate-500 mt-0.5">{vehicle.year} Edition &bull; Available in Hassan</p>
                            </div>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <Check size={12} strokeWidth={3} /> Free Cancellation
                            </span>
                          </div>

                          {/* Key Specs */}
                          <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-600 font-semibold">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                              <Users size={14} className="text-emerald-600" />
                              <span>{vehicle.seats} Seats</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                              <Gauge size={14} className="text-emerald-600" />
                              <span>{vehicle.transmission}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                              <Fuel size={14} className="text-emerald-600" />
                              <span>{vehicle.fuel_type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              <span>{vehicle.km_limit || (vehicle.category === 'Mopeds/Scooters' ? 150 : vehicle.category === 'Bikes' ? 200 : 300)} km/day free</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                              <span>₹{vehicle.extra_km_charge || (vehicle.category === 'Mopeds/Scooters' ? 5 : vehicle.category === 'Bikes' ? 8 : 10)}/km extra</span>
                            </div>
                            {vehicle.category === 'Cars' && (
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1.5 rounded-lg border border-amber-200 font-bold">
                                <span>Without Toll &amp; Fuel</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Bar: Price & CTA */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-500 block font-medium">
                              {tripDurationDays ? `Total for ${tripDurationDays} Days` : 'Base Daily Rate'}
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                              ₹{estimatedTotal}
                            </span>
                            {tripDurationDays && (
                              <span className="text-[11px] text-slate-400 block">
                                (₹{vehicle.daily_price}/day)
                              </span>
                            )}
                          </div>

                          <Link 
                            to={`/vehicles/${vehicle.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} 
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
                          >
                            Reserve Now
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
