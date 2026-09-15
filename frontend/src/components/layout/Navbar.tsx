import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // Don't show public navbar on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Green Utility Bar */}
      <div className="bg-emerald-600 text-white py-2 px-4 text-sm font-medium hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-emerald-200" />
              <span>Main Branch: B.M. Road, Hassan, Karnataka</span>
            </span>
            <span className="flex items-center gap-2 text-emerald-100">
              <ShieldCheck size={15} className="text-emerald-200" />
              <span>Self-Drive Cars & Bikes &bull; Zero Hidden Charges</span>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <a href="tel:+917259857486" className="flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors font-semibold">
              <Phone size={14} />
              <span>24x7 Helpline: +91 72598 57486 | +91 95133 48666</span>
            </a>

            <span className="text-emerald-400">|</span>
            <Link to="/map" className="hover:text-emerald-100 transition-colors">Our Branch Location</Link>
          </div>
        </div>
      </div>

      {/* Main White Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3.5 group">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-md shadow-emerald-900/10 border-2 border-emerald-600/40 group-hover:border-emerald-600 transition-all shrink-0 bg-slate-900">

              <img 
                src="/logo.png" 
                alt="Shri Krishna Car & Bike Rentals" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Shri Krishna
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-emerald-700 tracking-wide">
                Car & Bike Rentals &bull; Hassan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link 
              to="/" 
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/vehicles" 
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/vehicles' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              Fleet & Catalog
            </Link>
            <Link 
              to="/map" 
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/map' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              Our Branch
            </Link>
            <Link 
              to="/tourist-guides" 
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/tourist-guides' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              Tourist Guides
            </Link>
          </nav>

          {/* Auth & CTA Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <Link 
                  to="/dashboard" 
                  className="text-base font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  My Bookings
                </Link>
                <div className="flex items-center gap-2.5 bg-slate-100 py-2 px-3.5 rounded-full border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{user.name.split(' ')[0]}</span>
                  <button 
                    onClick={handleLogout} 
                    title="Sign Out"
                    className="text-slate-400 hover:text-rose-600 ml-1 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  <User size={17} /> Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className="px-3 py-2.5 rounded-lg text-base font-bold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link 
              to="/vehicles" 
              onClick={() => setIsOpen(false)} 
              className="px-3 py-2.5 rounded-lg text-base font-bold text-slate-800 hover:bg-slate-50"
            >
              Fleet & Vehicles
            </Link>
            <Link 
              to="/map" 
              onClick={() => setIsOpen(false)} 
              className="px-3 py-2.5 rounded-lg text-base font-bold text-slate-800 hover:bg-slate-50"
            >
              Our Branch
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)} 
                className="px-3 py-2.5 rounded-lg text-base font-bold text-emerald-700 bg-emerald-50"
              >
                My Bookings & Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-sm font-semibold text-slate-700">Signed in as <b>{user.name}</b></span>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg text-sm font-bold text-slate-800 border border-slate-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};