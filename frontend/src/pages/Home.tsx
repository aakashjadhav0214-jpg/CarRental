import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Bike, 
  MapPin, Calendar, Clock, ArrowRight, ShieldCheck, 
  CheckCircle2, Users, Fuel, Gauge, Phone, ChevronDown, 
  FileText, Tag, Award, HelpCircle, Star, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const fallbackVehicles = [
  {
    id: 1,
    brand: 'Maruti Suzuki',
    model: 'Swift VXi',
    year: 2023,
    category: 'Cars',
    seats: 5,
    transmission: 'Manual',
    fuel_type: 'Petrol',
    daily_price: 1800,
    images: [{ image_url: '/uploads/swift.png', is_primary: true }]
  },
  {
    id: 2,
    brand: 'TVS',
    model: 'Jupiter 125',
    year: 2023,
    category: 'Mopeds/Scooters',
    seats: 2,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    daily_price: 450,
    images: [{ image_url: '/uploads/jupiter.jpg', is_primary: true }]
  },
  {
    id: 3,
    brand: 'Bajaj',
    model: 'Pulsar NS200',
    year: 2023,
    category: 'Bikes',
    seats: 2,
    transmission: 'Manual',
    fuel_type: 'Petrol',
    daily_price: 800,
    images: [{ image_url: '/uploads/ns.webp', is_primary: true }]
  }
];

const fallbackReviews = [
  {
    id: 1,
    user_name: 'Praveen Kumar',
    vehicle_name: 'Swift VXi',
    rating: 5,
    comment: 'Extremely clean car and smooth pickup near Hassan station. The 300km per day limit was more than enough for our Belur & Sakleshpur trip!',
    created_at: '2025-02-10'
  },
  {
    id: 2,
    user_name: 'Ananya Rao',
    vehicle_name: 'TVS Jupiter 125',
    rating: 5,
    comment: 'Very polite staff, instant paperless DL verification. Scooty was in top condition and delivered with a full tank as promised.',
    created_at: '2025-02-14'
  },
  {
    id: 3,
    user_name: 'Karthik Gowda',
    vehicle_name: 'Bajaj Pulsar NS200',
    rating: 5,
    comment: 'Best self-drive service in Hassan! Refundable deposit was returned within 3 hours after vehicle drop-off. Will definitely rent again.',
    created_at: '2025-02-18'
  }
];

export const Home = () => {
  const navigate = useNavigate();

  // Selected Category Tab
  const [activeTab, setActiveTab] = useState<'Cars' | 'Bikes' | 'Mopeds/Scooters'>('Self Drive Car' as any);
  
  // Search Form State
  const [pickupLocation, setPickupLocation] = useState('Hassan, Karnataka');
  
  const getTomorrowFormatted = (daysFromNow = 1, hour = 10) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [pickupDateTime, setPickupDateTime] = useState(getTomorrowFormatted(1, 10));
  const [returnDateTime, setReturnDateTime] = useState(getTomorrowFormatted(2, 10));

  // Live Fleet state
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [publicReviews, setPublicReviews] = useState<any[]>([]);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const showroomLocation: [number, number] = [13.001567, 76.081876];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles?limit=6');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFeaturedVehicles(res.data);
        } else {
          setFeaturedVehicles(fallbackVehicles);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
        setFeaturedVehicles(fallbackVehicles);
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/public');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setPublicReviews(res.data);
        } else {
          setPublicReviews(fallbackReviews);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setPublicReviews(fallbackReviews);
      }
    };
    fetchVehicles();
    fetchReviews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let categoryParam = 'Cars';
    if (activeTab === 'Bikes') categoryParam = 'Bikes';
    else if (activeTab === 'Mopeds/Scooters') categoryParam = 'Mopeds/Scooters';

    const params = new URLSearchParams();
    if (pickupDateTime) params.append('pickup', pickupDateTime);
    if (returnDateTime) params.append('return', returnDateTime);
    if (categoryParam) params.append('category', categoryParam);

    navigate(`/vehicles?${params.toString()}`);
  };

  const categories = [
    { id: 'Self Drive Car', label: 'Self Drive Cars', icon: Car, tag: 'Cars' },
    { id: 'Bikes', label: 'Bikes & Scooters', icon: Bike, tag: 'Bikes' },
  ];

  const topCategories = [
    {
      title: 'Self Drive Car Rental',
      subtitle: 'Rent & drive it yourself',
      image: '/uploads/swift.png',
      category: 'Cars'
    },
    {
      title: 'Bikes',
      subtitle: 'For city rides & quick getaways',
      image: '/uploads/ns.webp',
      category: 'Bikes'
    },
    {
      title: 'Mopeds & Scooters',
      subtitle: 'Effortless daily commutes',
      image: '/uploads/jupiter.jpg',
      category: 'Mopeds/Scooters'
    }
  ];

  const faqs = [
    {
      q: 'What is the daily kilometer limit for self-drive vehicles?',
      a: 'We offer a generous daily limit of 300 km per rental day. Any additional distance driven beyond this allowance is charged at a minimal flat rate of ₹12 to ₹15 per km depending on vehicle category.'
    },
    {
      q: 'What is the damage and insurance policy for vehicles?',
      a: 'Any vehicle damages costing under ₹20,000 must be repaired directly by the customer taking full in-charge. Damages costing above ₹20,000 will be claimed through vehicle insurance as per policy guidelines.'
    },
    {
      q: 'What documents are required to rent a car or bike?',
      a: 'You only need a valid original Driving License (DL) and an Indian Government-approved photo identity proof (Aadhaar Card or Passport). Digital copies uploaded via DigiLocker are also welcomed!'
    },
    {
      q: 'When and how is the security deposit refunded?',
      a: 'Your refundable security deposit is initiated for refund immediately upon safe vehicle handover and inspection. It reflects back to your original payment method (Bank account or UPI) within 2 to 24 hours.'
    },
    {
      q: 'What is the fuel policy?',
      a: 'We operate on a simple like-to-like fuel policy. If you receive the car or bike with a half tank, you return it with the same level. No excess fuel surcharges are imposed.'
    },
    {
      q: 'Where do I collect and return the vehicle?',
      a: 'Vehicles can be picked up and returned directly at our Hassan branch located conveniently at 232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pt-16 md:pt-28">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & MARKETPLACE SEARCH CONSOLE */}
      {/* ========================================================================= */}
      <section className="relative bg-slate-100/70 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Main Title & Subtitle */}
          <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100/90 mb-4 border border-emerald-200 shadow-2xs">
              <Award size={15} /> Premier Self-Drive Car &amp; Bike Rentals
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Rent Self-Drive Cars &amp; Bikes in <span className="text-emerald-600">Hassan</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
              Well-maintained fleet with transparent per-day pricing, 300km daily allowance &amp; zero hidden charges.
            </p>
          </div>

          {/* Search Box Card with Tabs */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
            
            {/* Category Tabs Header */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <IconComponent size={18} className={isSelected ? 'text-white' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Search Console */}
            <form onSubmit={handleSearch} className="p-5 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                
                {/* Pickup Location */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/50 transition-colors h-20 flex flex-col justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <MapPin size={14} className="text-emerald-600 shrink-0" /> Pickup Location
                  </label>
                  <input 
                    type="text" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm sm:text-base text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="City, landmark or area"
                    required
                  />
                </div>

                {/* Pickup Date & Time */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/50 transition-colors h-20 flex flex-col justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <Calendar size={14} className="text-emerald-600 shrink-0" /> Pickup Date &amp; Time
                  </label>
                  <input 
                    type="datetime-local" 
                    value={pickupDateTime}
                    onChange={(e) => setPickupDateTime(e.target.value)}
                    className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                </div>

                {/* Drop-off Date & Time */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/50 transition-colors h-20 flex flex-col justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <Clock size={14} className="text-emerald-600 shrink-0" /> Drop-off Date &amp; Time
                  </label>
                  <input 
                    type="datetime-local" 
                    value={returnDateTime}
                    onChange={(e) => setReturnDateTime(e.target.value)}
                    className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                </div>

                {/* Search CTA Button */}
                <div className="h-20 flex items-center">
                  <button 
                    type="submit"
                    className="w-full h-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    <span>Search Fleet</span>
                    <ArrowRight size={18} />
                  </button>
                </div>

              </div>

              {/* Trust Features Strip */}
              <div className="mt-7 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-5 text-slate-700">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Instant Confirmation</span>
                    <span className="text-xs text-slate-500 font-medium">For business expense claim</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Price Protection</span>
                    <span className="text-xs text-slate-500 font-medium">Best rate guarantee</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Instant Verification</span>
                    <span className="text-xs text-slate-500 font-medium">Paperless DL approval</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Save Up to 20%</span>
                    <span className="text-xs text-slate-500 font-medium">On multi-day rentals</span>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Popular Search Tags */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 text-sm text-slate-700">
            <span className="font-bold text-slate-800 text-sm">Popular Searches:</span>
            <Link to="/vehicles?category=Cars" className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-emerald-600 hover:text-white text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs">
              Self Drive Cars in Hassan
            </Link>
            <Link to="/vehicles?category=Bikes" className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-emerald-600 hover:text-white text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs">
              KTM Duke &amp; Royal Enfield
            </Link>
            <Link to="/vehicles?category=Mopeds/Scooters" className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-emerald-600 hover:text-white text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs">
              Activa &amp; Jupiter on Rent
            </Link>
            <Link to="/vehicles?category=Cars" className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-emerald-600 hover:text-white text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs">
              7 Seater XUV500
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EXPLORE OUR TOP CATEGORIES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Whatever you're looking for, it's here</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Explore Our Top Rental Categories
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              Choose from well-maintained self-drive cars, motorbikes, and city scooters for short trips or weekend getaways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCategories.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/vehicles?category=${cat.category}`)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col"
              >
                <div className="p-5 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {cat.subtitle}
                  </p>
                </div>
                <div className="p-4 pt-0 mt-auto">
                  <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                    <img 
                      src={cat.image.startsWith('http://localhost:8000') ? cat.image.replace('http://localhost:8000', '') : cat.image} 
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link 
              to="/vehicles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              <span>Explore All Vehicles</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE FEATURED FLEET */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Available For Immediate Booking</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-2">
                Popular Fleet in Hassan
              </h2>
            </div>
            <Link to="/vehicles" className="mt-4 md:mt-0 text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              View complete fleet catalog &rarr;
            </Link>
          </div>

          {isLoadingVehicles ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => {
                let imgUrl = vehicle.images?.find((img: any) => img.is_primary)?.image_url 
                  || vehicle.images?.[0]?.image_url 
                  || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80';

                if (imgUrl.startsWith('http://localhost:8000')) {
                  imgUrl = imgUrl.replace('http://localhost:8000', '');
                }

                return (
                  <div 
                    key={vehicle.id} 
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col group"
                  >
                    {/* Vehicle Card Image */}
                    <div className="h-52 overflow-hidden relative bg-slate-100">
                      <img 
                        src={imgUrl} 
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide text-slate-800 border border-slate-200">
                        {vehicle.category}
                      </span>
                      <span className="absolute bottom-3 left-3 bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 size={11} /> 300 km/day Free
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">{vehicle.year} Edition &bull; Hassan Hub</p>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 my-4 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-emerald-600" />
                          <span>{vehicle.seats} Seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Gauge size={14} className="text-emerald-600" />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel size={14} className="text-emerald-600" />
                          <span>{vehicle.fuel_type}</span>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div>
                          <span className="text-xs text-slate-500 block font-medium">Starting from</span>
                          <span className="text-xl font-bold text-slate-900">
                            ₹{vehicle.daily_price}
                            <span className="text-xs font-normal text-slate-500"> /day</span>
                          </span>
                        </div>
                        <Link 
                          to={`/vehicles/${vehicle.id}`}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
                        >
                          Reserve
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY RENT WITH SHRI KRISHNA */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">The Hassan Self-Drive Advantage</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-2">
              Drive with Freedom Across Karnataka
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* For Customers */}
            <div className="rounded-2xl p-8 sm:p-10 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden shadow-lg border border-slate-800">
              <div className="relative z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Self-Drive Experience
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-3">Find. Reserve. Ride.</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Browse through cars, motorbikes and scooters. Transparent per-day pricing, 300 km daily allowance, paperless booking, and instant payment confirmation.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Regularly inspected &amp; sanitized vehicles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Free cancellation up to 6 hours before pickup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> 24x7 on-road mechanical support
                  </li>
                </ul>
              </div>
              <Link 
                to="/vehicles" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors w-fit relative z-10"
              >
                <span>Start Booking Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Hassan & Outstation Trips */}
            <div className="rounded-2xl p-8 sm:p-10 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden shadow-lg border border-slate-800">
              <div className="relative z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Heritage &amp; Weekend Getaways
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-3">Explore Belur, Halebidu &amp; Hills</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Our Hassan branch on B.M. Road gives you immediate access to historic Belur, Halebidu temples, Sakleshpur coffee estates, and Western Ghats.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Generous 300 km daily limit included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Quick handover at Hassan branch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> 100% refundable security deposit
                  </li>
                </ul>
              </div>
              <Link 
                to="/map" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors w-fit relative z-10"
              >
                <span>View Hassan Branch</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SHOWROOM & PICKUP LOCATION MAP */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Physical Pickup Location</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Visit Our Hassan Branch
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pick up your reserved vehicle directly from our Hassan branch located near Canara Bank (Guddenahalli) on B.M. Road.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Address:</b> 232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Working Hours:</b> Mon - Sun: 06:00 AM – 11:00 PM (24/7 Handover available)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Direct Support:</b> +91 72598 57486 | +91 95133 48666</span>
                </div>

              </div>

              <button 
                onClick={() => window.open(`https://www.google.com/maps/place/13%C2%B000'05.6%22N+76%C2%B004'54.8%22E/@13.0015667,76.0818759,17z`, '_blank')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>Open in Google Maps</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Leaflet Map Card */}
            <div className="lg:col-span-7 h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <MapContainer 
                center={showroomLocation} 
                zoom={16} 
                scrollWheelZoom={false} 
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={showroomLocation}>
                  <Popup>
                    <div className="p-1 text-slate-900 font-sans">
                      <b className="font-bold text-sm block">Shri Krishna Car &amp; Bike Rentals Hub</b>
                      <span className="text-xs text-slate-600">232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan</span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.5 CUSTOMER REVIEWS & FEEDBACK */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/30">
              <Star size={14} fill="currentColor" /> Verified Customer Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 text-white">
              Rider Experiences &amp; Reviews
            </h2>
            <p className="text-sm text-slate-300 mt-2 font-medium">
              Genuine feedback from customers who rented self-drive cars and bikes from our Hassan branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicReviews.map((r) => (
              <div key={r.id} className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl flex flex-col justify-between shadow-lg backdrop-blur-xs hover:border-amber-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Ride
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <b className="text-white block font-bold">{r.user_name}</b>
                    <span className="text-emerald-400 font-semibold text-xs">{r.vehicle_name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Everything you need to know about renting a vehicle in Hassan with us.
            </p>
          </div>

          {/* Highlighted Damage & Insurance Policy Banner */}
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Important Damage &amp; Insurance Repair Policy
              </span>
              <p className="text-xs sm:text-sm font-semibold text-amber-800 leading-relaxed">
                For any vehicle damages costing <b>under ₹20,000</b>, the customer is fully in-charge of repairing it and bearing the cost. Damages costing <b>above ₹20,000</b> will be claimed through vehicle insurance as per standard policy guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button 
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    <span className="text-sm sm:text-base flex items-center gap-2.5">
                      <HelpCircle size={17} className="text-emerald-600 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
