import { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, Share2, Clock, AlertCircle, X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trip Extension Modal State
  const [extendModalBooking, setExtendModalBooking] = useState<any | null>(null);
  const [newReturnDate, setNewReturnDate] = useState('');
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState('');

  // Review & Feedback Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReviews, setMyReviews] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchBookings();
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const res = await api.get('/reviews/my-reviews');
      const map: Record<string, any> = {};
      res.data.forEach((r: any) => {
        if (r.booking_id) map[r.booking_id] = r;
      });
      setMyReviews(map);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const openReviewModal = (booking: any) => {
    setReviewModalBooking(booking);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        booking_id: reviewModalBooking.id,
        vehicle_id: reviewModalBooking.vehicle_id,
        rating: reviewRating,
        comment: reviewComment
      });
      setMyReviews(prev => ({ ...prev, [reviewModalBooking.id]: res.data }));
      alert('Thank you for your feedback! Your review has been submitted.');
      setReviewModalBooking(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, booking_status: 'CANCELLED' } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    }
  };

  const handleWhatsAppShare = async (bookingId: string) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/whatsapp-link`);
      if (res.data.whatsapp_url) {
        window.open(res.data.whatsapp_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to generate WhatsApp link', err);
      alert('Failed to generate WhatsApp receipt link');
    }
  };

  const openExtendModal = (booking: any) => {
    setExtendModalBooking(booking);
    setExtendError('');
    // Default to +1 day from current return
    const curReturn = new Date(booking.return_datetime);
    curReturn.setDate(curReturn.getDate() + 1);
    setNewReturnDate(curReturn.toISOString().slice(0, 16));
  };

  const handleConfirmExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalBooking) return;
    setExtending(true);
    setExtendError('');

    try {
      const res = await api.post(`/bookings/${extendModalBooking.id}/extend`, {
        new_return_datetime: new Date(newReturnDate).toISOString()
      });
      
      alert('Trip extended successfully!');
      setBookings(bookings.map(b => b.id === extendModalBooking.id ? res.data : b));
      setExtendModalBooking(null);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to extend booking duration.';
      setExtendError(msg);
    } finally {
      setExtending(false);
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

  const handlePay = async (bookingId: string) => {
    try {
      const res = await api.post(`/payments/create-order/${bookingId}`);
      
      if (res.data.order_id.startsWith('order_mock')) {
        alert('Backend is in Mock Mode. Simulating payment verification...');
        await api.post('/payments/verify', {
          razorpay_order_id: res.data.order_id,
          razorpay_payment_id: 'pay_mock123456',
          razorpay_signature: 'mock_signature'
        });
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, payment_status: 'PAID', booking_status: 'CONFIRMED' } : b));
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay. Check your internet connection.');
        return;
      }

      const options = {
        key: res.data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TXXxwX1jg4JMom', 
        amount: Math.round(res.data.amount * 100),
        currency: 'INR',
        name: 'Shri Krishna Car & Bike Rentals',
        description: 'Vehicle Rental Booking',
        order_id: res.data.order_id,
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, payment_status: 'PAID', booking_status: 'CONFIRMED' } : b));
            alert('Payment successful!');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          ...(user?.name ? { name: user.name } : {}),
          ...(user?.email ? { email: user.email } : {}),
          ...((user as any)?.phone ? { contact: (user as any).phone } : {})
        },
        theme: {
          color: '#059669' // Emerald 600
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Payment initialization failed.';
      alert(errMsg);
    }
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 text-slate-900">
      <div className="mb-8 pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">My Rental Dashboard</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Welcome back, {user?.name}! Manage your bookings and rental extensions.</p>
        </div>

        <button 
          onClick={fetchBookings}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
        >
          Refresh Bookings
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Active &amp; Past Bookings</h2>
        
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <p className="text-slate-500 text-sm font-medium">You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">Booking #{booking.booking_number}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 tracking-wide
                          ${booking.booking_status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                          ${booking.booking_status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                          ${booking.booking_status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : ''}
                          ${booking.booking_status === 'ACTIVE' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                          ${booking.booking_status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border border-slate-200' : ''}
                        `}>
                          {booking.booking_status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">₹{booking.total_amount}</p>
                        <span className={`text-xs font-bold inline-block mt-1 px-2 py-0.5 rounded ${
                          booking.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          Payment: {booking.payment_status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div className="flex gap-2.5 items-start">
                        <Calendar className="text-emerald-600 shrink-0 mt-0.5" size={15} />
                        <div>
                          <p className="font-bold text-slate-700">Pickup Date &amp; Time</p>
                          <p className="text-slate-500 mt-0.5">{new Date(booking.pickup_datetime).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <MapPin className="text-emerald-600 shrink-0 mt-0.5" size={15} />
                        <div>
                          <p className="font-bold text-slate-700">Drop-off Date &amp; Time</p>
                          <p className="text-slate-500 mt-0.5">{new Date(booking.return_datetime).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 justify-center md:border-l md:border-slate-100 md:pl-6 min-w-[170px] pt-4 md:pt-0 border-t border-slate-100 md:border-t-0 mt-4 md:mt-0">
                    
                    {/* Share via WhatsApp Button */}
                    <button 
                      type="button"
                      onClick={() => handleWhatsAppShare(booking.id)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Share2 size={15} /> Share WhatsApp
                    </button>

                    {/* Extend Trip Button (for CONFIRMED or ACTIVE bookings) */}
                    {['CONFIRMED', 'ACTIVE', 'PENDING'].includes(booking.booking_status) && (
                      <button 
                        type="button"
                        onClick={() => openExtendModal(booking)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Clock size={15} /> Extend Rental
                      </button>
                    )}

                    {/* Feedback / Review Button */}
                    {myReviews[booking.id] ? (
                      <div className="py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <div className="flex justify-center gap-0.5 text-amber-500 mb-0.5">
                          {[...Array(myReviews[booking.id].rating)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wide">Feedback Submitted</span>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => openReviewModal(booking)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Star size={15} fill="currentColor" /> Rate &amp; Give Feedback
                      </button>
                    )}

                    {booking.payment_status === 'PENDING' && booking.booking_status !== 'CANCELLED' && (
                      <button 
                        className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all" 
                        onClick={() => handlePay(booking.id)}
                      >
                        <CreditCard size={15} /> Pay Now
                      </button>
                    )}
                    
                    {['PENDING', 'CONFIRMED'].includes(booking.booking_status) && (
                      <button 
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors" 
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extension Modal */}
      {extendModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-200">
            <button 
              onClick={() => setExtendModalBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                Self-Service Extension
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Extend Trip #{extendModalBooking.booking_number}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your new extended drop-off date &amp; time. Additional day charges &amp; GST will be updated automatically.
              </p>
            </div>

            <form onSubmit={handleConfirmExtension} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Current Drop-off:</span>
                  <b className="text-slate-800">{new Date(extendModalBooking.return_datetime).toLocaleString()}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Current Total Paid:</span>
                  <b className="text-emerald-700">₹{extendModalBooking.total_amount}</b>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Select New Drop-off Date &amp; Time
                </label>
                <input 
                  type="datetime-local" 
                  value={newReturnDate}
                  onChange={(e) => setNewReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {extendError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{extendError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setExtendModalBooking(null)}
                  className="w-1/2 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={extending}
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1"
                >
                  {extending ? 'Updating...' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Feedback Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-200">
            <button 
              onClick={() => setReviewModalBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                Customer Feedback
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Rate Your Experience #{reviewModalBooking.booking_number}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How was your ride experience with Shri Krishna Rentals? Your feedback helps us maintain top quality vehicles.
              </p>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Select Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        star <= reviewRating 
                          ? 'bg-amber-50 border-amber-400 text-amber-500 scale-105' 
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star size={24} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Your Feedback / Review Comments
                </label>
                <textarea 
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about vehicle condition, pickup experience, and drive comfort..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-sm bg-white outline-none focus:border-amber-500 text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="w-1/2 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingReview}
                  className="w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

