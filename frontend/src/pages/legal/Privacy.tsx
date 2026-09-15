import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const Privacy = () => {
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Privacy & Data Security</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last updated: September 2026 &bull; Shri Krishna Car & Bike Rentals</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                We collect personal details essential for completing vehicle rentals and meeting legal transport regulations in India, including your name, contact phone number, email address, physical address, and copies of your Driving License and Government ID.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Payment Security with Razorpay</h2>
              <p>
                All online transactions and card details are processed directly through <b>Razorpay Payment Gateway</b> with PCI-DSS Level 1 compliance and 256-bit encryption. We do not store or process your complete credit/debit card numbers or bank UPI PINs on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Telematics & GPS Tracking</h2>
              <p>
                For passenger safety and theft prevention, all rental vehicles are equipped with certified GPS telematics units. Location data is tracked solely for trip safety, speed compliance, and emergency roadside recovery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Third-Party Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third-party marketing companies. Data is disclosed only to law enforcement authorities when mandated by official statutory orders or court summons.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Your personal data is encrypted and kept confidential under IT Act 2000.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
