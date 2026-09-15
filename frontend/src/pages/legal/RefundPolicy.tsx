import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const RefundPolicy = () => {
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Customer Protection</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Refund & Cancellation Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last updated: September 2026 &bull; Shri Krishna Car & Bike Rentals</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Advance Booking Cancellation</h2>
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p><b>Cancellation &gt; 24 hours before pickup:</b> 100% full refund of the rental fee.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p><b>Cancellation 6 to 24 hours before pickup:</b> 80% refund (20% nominal holding fee deducted).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p><b>Cancellation &lt; 6 hours before pickup or No-show:</b> No rental refund, but 100% of any security deposit is refunded immediately.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Security Deposit Refund</h2>
              <p>
                Security deposits are held strictly as collateral and are <b>100% refundable</b>. Upon return of the vehicle without structural damages, traffic fines, or major violations, the deposit refund is initiated immediately and reflects in your bank account or original payment method within <b>2 to 24 hours</b>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Breakdown or Mechanical Issues</h2>
              <p>
                In the rare event of an unresolvable mechanical failure not caused by negligence, we provide an immediate replacement vehicle or a pro-rata refund for the remaining rental period.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. How to Request a Refund</h2>
              <p>
                Cancellations can be performed directly through your <b>Customer Dashboard</b> or by contacting our 24x7 helpdesk at <b>+91 97379 65551</b> or emailing <b>support@shrikrishnarentals.com</b>.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Refunds are disbursed through original payment rails via Razorpay.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
