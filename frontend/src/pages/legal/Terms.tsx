import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const Terms = () => {
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Legal Agreement</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Terms & Conditions</h1>
            <p className="text-xs text-slate-500 mt-1">Last updated: September 2026 &bull; Shri Krishna Car & Bike Rentals</p>
          </div>

          {/* Highlighted Damage & Insurance Policy Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Important Damage &amp; Insurance Policy
              </span>
              <p className="text-xs sm:text-sm font-semibold text-amber-800 leading-relaxed">
                For any vehicle damages costing <b>under ₹20,000</b>, the customer is fully in-charge of repairing it and bearing the cost. Damages costing <b>above ₹20,000</b> will be claimed through vehicle insurance.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Eligibility & Driver License Requirements</h2>
              <p>
                Renter must be at least 21 years of age. A valid, original Indian Driving License (or International Driving Permit for foreign nationals) and a Government ID proof (Aadhaar / Passport) must be produced at the time of vehicle delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Kilometer Allowance & Over-limit Charges</h2>
              <p>
                All self-drive vehicles include a standard daily allowance of <b>300 kilometers per 24-hour rental day</b>. Additional kilometers driven beyond this limit will be charged at a flat rate of ₹12/km (Bikes/Hatchbacks) and ₹15/km (Sedans/SUVs).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Security Deposit & Damage Liability</h2>
              <p>
                A refundable security deposit is collected before vehicle handover. The deposit will be processed for refund within 24 hours of safe vehicle return after inspection. The renter is strictly liable for any damage, loss, traffic fines, or toll violations incurred during the rental tenure.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium mt-2 space-y-1">
                <p><b>• Repairs Under ₹20,000:</b> Customer takes full charge of repairing any damage up to ₹20,000.</p>
                <p><b>• Repairs Above ₹20,000:</b> Damage expenses exceeding ₹20,000 will be processed through vehicle insurance.</p>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Prohibited Uses</h2>
              <p>
                Vehicles may not be used for racing, towing, subleasing, transport of contraband/narcotics, or driving under the influence of alcohol or drugs. Any violation will result in immediate vehicle impoundment and forfeiture of deposit without refund.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Fuel Policy</h2>
              <p>
                We follow a <b>like-to-like fuel policy</b>. Vehicles are delivered with a recorded fuel level and must be returned with the same fuel level. No cash refund is issued for excess fuel left in the tank.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Governed under the laws of the State of Karnataka, India.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
