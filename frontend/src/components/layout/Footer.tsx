import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, CreditCard } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Top Banner inside Footer */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Well-Maintained Fleet</p>
              <p className="text-xs text-slate-400">Inspected &amp; sanitized cars and bikes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Transparent Pricing</p>
              <p className="text-xs text-slate-400">Zero hidden charges or surprises</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Phone size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">24/7 Roadside Assistance</p>
              <p className="text-xs text-slate-400">Instant support wherever you drive</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <MapPin size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Direct Branch Pickup</p>
              <p className="text-xs text-slate-400">Fast handover at B.M. Road, Hassan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Balanced Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
        
        {/* Brand Column (Issue 16: col-span-4 for balanced gutters) */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-md shadow-emerald-900/30 border border-emerald-500/30 shrink-0 bg-slate-900">
              <img 
                src="/logo.png" 
                alt="Shri Krishna Car & Bike Rentals" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white leading-tight">
                Shri Krishna
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                Car &amp; Bike Rentals &bull; Hassan
              </span>
            </div>
          </Link>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Hassan's trusted vehicle rental platform. Book self-drive cars, motorbikes, and scooters at guaranteed best rates with zero hidden fees.
          </p>

          {/* Issue 6: Functional interactive phone and email links */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span>Showroom: 232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan - 573201</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone size={14} className="text-emerald-400 shrink-0" />
              <span>Support: <a href="tel:+917259857486" className="hover:text-emerald-400 hover:underline transition-colors">+91 72598 57486</a> | <a href="tel:+919513348666" className="hover:text-emerald-400 hover:underline transition-colors">+91 95133 48666</a></span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Mail size={14} className="text-emerald-400 shrink-0" />
              <span>Email: <a href="mailto:bookings@shrikrishnarentals.com" className="hover:text-emerald-400 hover:underline transition-colors">bookings@shrikrishnarentals.com</a></span>
            </div>
          </div>
        </div>

        {/* Categories Column */}
        <div className="lg:col-span-3">
          <h3 className="text-white font-bold text-sm mb-4 tracking-wider">Top Categories</h3>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/vehicles?category=Cars" className="hover:text-emerald-400 transition-colors">Self Drive Cars</Link></li>
            <li><Link to="/vehicles?category=Bikes" className="hover:text-emerald-400 transition-colors">Bikes on Rent</Link></li>
            <li><Link to="/vehicles?category=Mopeds/Scooters" className="hover:text-emerald-400 transition-colors">Scooters &amp; Mopeds</Link></li>
            <li><Link to="/vehicles?category=Cars" className="hover:text-emerald-400 transition-colors">Weekend SUVs</Link></li>
            <li><Link to="/vehicles?category=Cars" className="hover:text-emerald-400 transition-colors">City Hatchbacks</Link></li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-bold text-sm mb-4 tracking-wider">Company</h3>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
            <li><Link to="/vehicles" className="hover:text-emerald-400 transition-colors">Fleet Directory</Link></li>
            <li><Link to="/map" className="hover:text-emerald-400 transition-colors">Hassan Branch Location</Link></li>
            <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Customer Dashboard</Link></li>
          </ul>
        </div>

        {/* Policies & KYC Column */}
        <div className="lg:col-span-3">
          <h3 className="text-white font-bold text-sm mb-4 tracking-wider">Policies &amp; Legal</h3>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-emerald-400 transition-colors">Refund &amp; Cancellation</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Fuel &amp; Km Policy</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-slate-900 bg-black/40 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Shri Krishna Car &amp; Bike Rentals. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Payments Secured with 256-bit SSL</span>
            <span>&bull;</span>
            {/* Issue 7: Muted text color for secondary trust badge */}
            <span className="text-slate-400 font-medium">Verified Rental Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
