import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Users, Fuel, Gauge, ShieldCheck, 
  Calendar, ArrowLeft, CreditCard, Banknote, 
  AlertCircle, FileText, CheckCircle2, Clock, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { DEFAULT_VEHICLES } from '../data/defaultVehicles';

const formatForDatetimeLocal = (val: string | null, daysOffset = 1, hour = 10): string => {
  if (val) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<any>(null);
  
  // Pre-fill dates from URL if available, else default to tomorrow
  const [pickupDate, setPickupDate] = useState(() => formatForDatetimeLocal(searchParams.get('pickup'), 1, 10));
  const [returnDate, setReturnDate] = useState(() => formatForDatetimeLocal(searchParams.get('return'), 2, 10));
  
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [customQrUrl, setCustomQrUrl] = useState<string | null>(null);


  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        setVehicle(res.data);
      } catch (err) {
        const found = DEFAULT_VEHICLES.find(v => v.id === id || v.model.toLowerCase().includes(id?.toLowerCase() || ''));
        if (found) {
          setVehicle(found);
        } else {
          setVehicle(DEFAULT_VEHICLES[0]);
        }
      }
    };
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        const res = await api.get('/payments/qr-scanner-url');
        if (res.data?.url) {
          setCustomQrUrl(resolveImageUrl(res.data.url));
        } else {
          setCustomQrUrl('/gpay_scanner.jpg');
        }
      } catch (err) {
        setCustomQrUrl('/gpay_scanner.jpg');
      }
    };
    fetchQrUrl();
  }, []);



  // Real-time frontend price calculation
  const calcPricing = useMemo(() => {
    if (!pickupDate || !returnDate || !vehicle) return null;
    const p = new Date(pickupDate).getTime();
    const r = new Date(returnDate).getTime();
    if (isNaN(p) || isNaN(r) || r <= p) return null;

    const durationHours = Math.ceil((r - p) / (1000 * 60 * 60));
    const durationDays = Math.max(1, Math.ceil(durationHours / 24));
    const basePrice = durationDays * (vehicle.daily_price || 0);
    const deposit = vehicle.security_deposit || 0;
    const totalPrice = basePrice + deposit;

    return {
      durationHours,
      durationDays,
      basePrice,
      deposit,
      totalPrice
    };
  }, [pickupDate, returnDate, vehicle]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      setError('Please select both pick-up and drop-off dates.');
      return;
    }

    let pDate = new Date(pickupDate);
    let rDate = new Date(returnDate);

    if (isNaN(pDate.getTime())) {
      pDate = new Date(pickupDate.replace('T', ' ').replace(/-/g, '/'));
    }
    if (isNaN(rDate.getTime())) {
      rDate = new Date(returnDate.replace('T', ' ').replace(/-/g, '/'));
    }

    if (isNaN(pDate.getTime()) || isNaN(rDate.getTime())) {
      setError('Please select valid pick-up and drop-off dates.');
      return;
    }

    if (rDate.getTime() <= pDate.getTime()) {
      setError('Drop-off date & time must be after pick-up date & time.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Instantly unlock payment selection for seamless UX
    setShowPaymentOptions(true);

    try {
      const pickupIso = pDate.toISOString();
      const returnIso = rDate.toISOString();
      
      const res = await api.post(`/bookings/availability?vehicle_id=${id}`, {
        vehicle_id: id,
        pickup_datetime: pickupIso,
        return_datetime: returnIso
      });
      
      if (res.data.available) {
        setAvailability(res.data);
      } else if (res.data.reason) {
        setError(res.data.reason);
      }
    } catch (err: any) {
      console.warn('Availability check fallback to local calculations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>('');
  const [upiSubmitting, setUpiSubmitting] = useState(false);

  const handleInitiateCheckout = async (method: 'ONLINE' | 'CASH' | 'UPI_QR') => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      let pDate = new Date(pickupDate);
      let rDate = new Date(returnDate);

      if (isNaN(pDate.getTime())) {
        pDate = new Date(pickupDate.replace('T', ' ').replace(/-/g, '/'));
      }
      if (isNaN(rDate.getTime())) {
        rDate = new Date(returnDate.replace('T', ' ').replace(/-/g, '/'));
      }

      const pickupIso = pDate.toISOString();
      const returnIso = rDate.toISOString();
      
      // 1. Create Booking record on backend
      const bookingRes = await api.post('/bookings', {
        vehicle_id: id,
        pickup_datetime: pickupIso,
        return_datetime: returnIso
      });
      
      const bookingId = bookingRes.data.id;
      setCreatedBookingId(bookingId);

      if (method === 'CASH') {
        alert('Booking reserved successfully! Please pay cash during vehicle pickup at Hassan branch.');
        navigate('/dashboard');
        return;
      }

      if (method === 'UPI_QR') {
        setIsProcessing(false);
        setAdvanceAmountInput(String(upiAmount));
        setShowUpiModal(true);
        return;
      }

      // 2. Create Order on backend for Online Payment Gateway (Razorpay)
      const res = await api.post(`/payments/create-order/${bookingId}`);
      
      if (res.data.order_id.startsWith('order_mock')) {
        alert('Simulating online payment verification...');
        await api.post('/payments/verify', {
          razorpay_order_id: res.data.order_id,
          razorpay_payment_id: 'pay_mock123456',
          razorpay_signature: 'mock_signature'
        });
        navigate('/dashboard');
        return;
      }

      // 3. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // 4. Trigger Razorpay Payment Gateway Modal
      const options = {
        key: res.data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TXXxwX1jg4JMom', 
        amount: Math.round(res.data.amount * 100),
        currency: 'INR',
        name: 'Shri Krishna Car & Bike Rentals',
        description: `Rental reserved for ${vehicle.brand} ${vehicle.model}`,
        order_id: res.data.order_id,
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            navigate('/dashboard');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed.');
            navigate('/dashboard');
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          ...(user?.name ? { name: user.name } : {}),
          ...(user?.email ? { email: user.email } : {}),
          ...((user as any)?.phone ? { contact: (user as any).phone } : {})
        },
        theme: {
          color: '#059669' // Emerald Green
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        alert('Payment failed. Please try again.');
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmitUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdBookingId || !utrNumber.trim()) {
      alert('Please enter your 12-digit UPI UTR / Transaction Reference Number');
      return;
    }
    setUpiSubmitting(true);
    try {
      const paidAmount = advanceAmountInput ? Number(advanceAmountInput) : upiAmount;
      await api.post('/payments/submit-upi', {
        booking_id: createdBookingId,
        utr_number: utrNumber.trim(),
        amount_paid: paidAmount
      });
      alert('Payment submitted successfully! Your booking is reserved.');
      setShowUpiModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit payment reference.');
    } finally {
      setUpiSubmitting(false);
    }
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return '/uploads/swift.png';
    if (url.startsWith('http://localhost:8000')) return url.replace('http://localhost:8000', '');
    return url;
  };

  if (error && !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">{error}</h2>
          <Link to="/vehicles" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all">
            Back to Fleet Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading Vehicle Details...</p>
        </div>
      </div>
    );
  }

  const primaryImage = resolveImageUrl(
    vehicle.images?.find((img: any) => img.is_primary)?.image_url || vehicle.images?.[0]?.image_url
  );

  const displayPricing = availability?.pricing || calcPricing;
  const upiAmount = displayPricing ? (displayPricing.total_price || displayPricing.totalPrice) : vehicle.daily_price;
  
  const shopUpiId = "chandankt98.hsn1@ybl";
  const payeeName = "CHANDAN K T";
  // Standard static UPI link (prompts customer to manually enter amount in GPay / PhonePe / Paytm)
  const manualUpiLink = `upi://pay?pa=${shopUpiId}&pn=CHANDAN%20K%20T&tn=Rental%20Booking`;
  const upiDeepLink = `upi://pay?pa=${shopUpiId}&pn=CHANDAN%20K%20T&am=${upiAmount.toFixed(2)}&cu=INR&tn=Rental%20Booking`;
  const fixedAmountQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(manualUpiLink)}`;

  return (
    <div className="bg-slate-50 min-h-screen pt-20 md:pt-28 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/vehicles" className="hover:text-emerald-700 flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Fleet Catalog
          </Link>
          <span>/</span>
          <span className="text-slate-900">{vehicle.brand} {vehicle.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Image, Specs, Inclusions & Guidelines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Image Container */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-72 sm:h-[420px] w-full bg-slate-100 relative">
                <img 
                  src={primaryImage} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide text-slate-800 border border-slate-200">
                  {vehicle.category}
                </span>
                <span className="absolute bottom-4 left-4 bg-emerald-700 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={14} /> 100% Inspected &amp; Sanitized
                </span>
              </div>

              {/* Title & Specifications Header */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                      {vehicle.year} Edition &bull; Available for immediate pickup in Hassan
                    </p>
                  </div>
                  <div className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                    {vehicle.km_limit || (vehicle.category === 'Mopeds/Scooters' ? 150 : vehicle.category === 'Bikes' ? 200 : 300)} km / 24 hr included
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Seating</span>
                    <div className="flex items-center gap-2 font-extrabold text-slate-800">
                      <Users size={16} className="text-emerald-600" />
                      <span>{vehicle.seats} Passengers</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Transmission</span>
                    <div className="flex items-center gap-2 font-extrabold text-slate-800">
                      <Gauge size={16} className="text-emerald-600" />
                      <span>{vehicle.transmission}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Fuel Type</span>
                    <div className="flex items-center gap-2 font-extrabold text-slate-800">
                      <Fuel size={16} className="text-emerald-600" />
                      <span>{vehicle.fuel_type}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Deposit</span>
                    <div className="flex items-center gap-2 font-extrabold text-slate-800">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>₹{vehicle.security_deposit} (Refundable)</span>
                    </div>
                  </div>
                </div>

                {/* Features & Inclusions */}
                <div className="pt-6 space-y-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700">
                    Rental Inclusions &amp; Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>{vehicle.km_limit || (vehicle.category === 'Mopeds/Scooters' ? 150 : vehicle.category === 'Bikes' ? 200 : 300)} km limit included (₹{vehicle.extra_km_charge || (vehicle.category === 'Mopeds/Scooters' ? 5 : vehicle.category === 'Bikes' ? 8 : 10)}/km extra)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>24x7 Roadside emergency breakdown support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Free cancellation up to 6 hours before pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Direct pickup at Hassan branch (232J+JQC, Near Canara Bank, B.M. Road)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Terms & Guidelines */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" /> Important Rental Guidelines
              </h3>

              {/* Damage & Insurance Policy Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                    Important Damage &amp; Repair Policy
                  </span>
                  <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                    Any vehicle damages costing <b>under ₹20,000</b> must be repaired directly by the customer taking full in-charge. Damages costing <b>above ₹20,000</b> will be claimed through vehicle insurance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
                <div className="space-y-1">
                  <b className="text-slate-800 block">Required Documents:</b>
                  <p>Original Driving License (DL) &amp; Aadhaar / Govt Photo ID to be presented at handover.</p>
                </div>
                <div className="space-y-1">
                  <b className="text-slate-800 block">Fuel &amp; Toll Policy:</b>
                  <p>{vehicle.category === 'Cars' ? 'Rental price excludes toll & fuel charges. Renter pays actual fuel & toll expenses.' : 'Fuel operated on like-to-like return level.'}</p>
                </div>
                <div className="space-y-1">
                  <b className="text-slate-800 block">Security Deposit:</b>
                  <p>Refundable security deposit is credited back to your bank / UPI within 24 hours of return.</p>
                </div>
                <div className="space-y-1">
                  <b className="text-slate-800 block">Extra Kilometer Rate:</b>
                  <p>Driven beyond allowance is charged at ₹{vehicle.extra_km_charge || (vehicle.category === 'Mopeds/Scooters' ? 5 : vehicle.category === 'Bikes' ? 8 : 10)}/km at handover.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Reservation Console */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md sticky top-28">
              
              <div className="pb-5 border-b border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Rental Price</span>
                  <span className="text-3xl font-black text-slate-900">₹{vehicle.daily_price}</span>
                  <span className="text-xs text-slate-500 font-semibold"> / 24 hour day</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Best Rate
                </span>
              </div>

              {/* Date & Time Selector Form */}
              <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <Calendar size={13} className="text-emerald-600" /> Pick-up Date &amp; Time
                  </label>
                  <input 
                    type="datetime-local" 
                    value={pickupDate}
                    onChange={e => {
                      setPickupDate(e.target.value);
                      setShowPaymentOptions(false);
                      setAvailability(null);
                      setError('');
                    }}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
                    required
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <Clock size={13} className="text-emerald-600" /> Drop-off Date &amp; Time
                  </label>
                  <input 
                    type="datetime-local" 
                    value={returnDate}
                    onChange={e => {
                      setReturnDate(e.target.value);
                      setShowPaymentOptions(false);
                      setAvailability(null);
                      setError('');
                    }}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
                    required
                  />
                </div>

                {/* Real-time Price Estimation Breakdown */}
                {displayPricing && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Rental Duration:</span>
                      <b className="text-slate-900">{displayPricing.duration_days || displayPricing.durationDays} Day(s)</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Rate (₹{vehicle.daily_price} &times; {displayPricing.duration_days || displayPricing.durationDays}d):</span>
                      <span className="font-semibold text-slate-800">₹{(displayPricing.base_price || displayPricing.basePrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refundable Security Deposit:</span>
                      <span className="font-semibold text-slate-800">₹{(displayPricing.security_deposit || displayPricing.deposit).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-emerald-700 text-base sm:text-lg">₹{upiAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Persistent Submit / Action Button */}
                {!showPaymentOptions && (
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Checking Availability...</span>
                      </>
                    ) : (
                      <span>Reserve Now</span>
                    )}
                  </button>
                )}
              </form>

              {/* Payment Method Choices */}
              {showPaymentOptions && (
                <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-1">
                    <CheckCircle2 size={15} /> Select Payment Method:
                  </div>

                  {/* Option 1: Google Pay / PhonePe UPI QR Code Scanner */}
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleInitiateCheckout('UPI_QR')}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99]"
                  >
                    <CreditCard size={18} /> Pay via GPay / PhonePe (Enter ₹{upiAmount.toFixed(2)} Manually)
                  </button>

                  {/* Option 2: Cash on Pickup */}
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleInitiateCheckout('CASH')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 active:scale-[0.99]"
                  >
                    <Banknote size={17} /> Reserve Now, Pay Cash on Pickup
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold pt-4">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Direct Showroom Handover &bull; Shri Krishna Hassan</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Google Pay / PhonePe UPI Scanner Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="text-center">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
                Manual Entry UPI Payment
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Scan &amp; Pay via GPay / PhonePe</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {payeeName} &bull; Shri Krishna Car &amp; Bike Rentals
              </p>
            </div>

            {/* QR Code Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs inline-block">
                <img 
                  src={customQrUrl || fixedAmountQrUrl} 
                  alt="Shri Krishna Rentals PhonePe / GPay Scanner" 
                  className="max-h-48 max-w-full mx-auto rounded-xl object-contain"
                />
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Total Amount to Pay</span>
                <span className="text-3xl font-black text-emerald-700">₹{upiAmount.toFixed(2)}</span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 block w-fit mx-auto mt-1.5 shadow-2xs">
                  ✏️ Enter ₹{upiAmount.toFixed(2)} manually in GPay / PhonePe / Paytm
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-xs font-bold text-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Payee Name:</span>
                  <b className="text-slate-900">{payeeName}</b>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Shop UPI ID:</span>
                  <code className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                    {shopUpiId}
                  </code>
                </div>
              </div>

              {/* Direct UPI App Launch Button for Mobile Phones */}
              <a 
                href={upiDeepLink}
                className="mt-3 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Open GPay / PhonePe App (Enter ₹{upiAmount.toFixed(2)} Manually)</span>
              </a>
            </div>

            {/* Advance & UTR Form */}
            <form onSubmit={handleSubmitUpiPayment} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Total Booking Amount:</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{upiAmount.toFixed(2)}</span>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide block mb-1">
                    Advance Amount Paid (₹):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                    <input 
                      type="number"
                      value={advanceAmountInput}
                      onChange={e => setAdvanceAmountInput(e.target.value)}
                      max={upiAmount}
                      min={1}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-extrabold text-emerald-700 outline-none focus:border-emerald-600"
                      placeholder={`e.g. ${upiAmount}`}
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    Enter the amount you paid into GPay/PhonePe (Default is full amount ₹{upiAmount.toFixed(2)})
                  </span>
                </div>

                {Number(advanceAmountInput) > 0 && Number(advanceAmountInput) < upiAmount && (
                  <div className="flex justify-between items-center text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span>Remaining Balance Due at Pickup:</span>
                    <span className="font-extrabold text-amber-900 text-sm">₹{(upiAmount - Number(advanceAmountInput)).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  12-Digit UPI UTR / Transaction Reference Number:
                </label>
                <input 
                  type="text" 
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value)}
                  placeholder="e.g. 425819034182"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                  required
                />
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                  Find the 12-digit UTR in your Google Pay, PhonePe, or Paytm receipt after sending.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={upiSubmitting}
                  className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  {upiSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Booking & Submit UTR'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

