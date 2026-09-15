import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';

export const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 md:pt-32 pb-20 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-6">
          <Link to="/" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Get in Touch</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Contact Customer Support</h1>
            <p className="text-xs text-slate-500 mt-1">We're here 24 hours a day to answer questions about bookings, pricing, or fleet availability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="space-y-6 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-600 shrink-0 mt-1" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Hassan Hub Showroom</b>
                  <p className="text-slate-600 text-xs mt-0.5">232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-emerald-600 shrink-0 mt-1" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Helpline & Reservations</b>
                  <p className="text-slate-600 text-xs mt-0.5">+91 72598 57486 | +91 95133 48666</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-emerald-600 shrink-0 mt-1" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Official Email</b>
                  <p className="text-slate-600 text-xs mt-0.5">bookings@shrikrishnarentals.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-emerald-600 shrink-0 mt-1" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Operational Timings</b>
                  <p className="text-slate-600 text-xs mt-0.5">Mon - Sun: 06:00 AM – 11:00 PM (24/7 Roadside Assistance)</p>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-8 space-y-2">
                  <span className="text-emerald-600 text-3xl block">✓</span>
                  <b className="text-slate-900 text-base block">Message Received!</b>
                  <p className="text-xs text-slate-500">Our support desk will call or WhatsApp you within 15 minutes.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Send an Instant Message</h3>
                  
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Message / Requirements</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Tell us what vehicle you need and the trip dates..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-emerald-600"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send size={14} /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
