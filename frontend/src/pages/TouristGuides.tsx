import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Compass, Calendar, ArrowRight, Car, Bike } from 'lucide-react';

export const TouristGuides = () => {
  const navigate = useNavigate();

  const guides = [
    {
      id: 'sakleshpur',
      title: 'Sakleshpur Coffee Estates & Bisle Ghat',
      distance: '38 km from Hassan Hub',
      category: 'Cars',
      recommendedVehicles: 'SUVs, 4x4 & Motorbikes',
      image: '/images/tourist/sakleshpur.jpg',
      bestTime: 'July to March (Post-Monsoon Greenery)',
      description: 'Experience winding ghat roads, lush coffee plantations, star-shaped Manjarabad Fort, and breathtaking valley views at Bisle Ghat Viewpoint.',
      highlights: ['Star-shaped Manjarabad Fort', 'Bisle Ghat Viewpoint', 'Coffee Estate Trails', 'Green Route Trekking']
    },
    {
      id: 'belur-halebidu',
      title: 'Belur & Halebidu Hoysala Heritage',
      distance: '37 km from Hassan Hub',
      category: 'Cars',
      recommendedVehicles: 'Sedans, Hatchbacks & Family Cars',
      image: '/images/tourist/belur.jpg',
      bestTime: 'October to March (Pleasant Weather)',
      description: 'Explore 12th-century UNESCO World Heritage Hoysala architecture with exquisite soapstone sculptures at Chennakesava & Hoysaleswara temples.',
      highlights: ['Chennakesava Temple Belur', 'Hoysaleswara Temple Halebidu', 'Soapstone Frieze Carvings', 'Archaeological Museum']
    },
    {
      id: 'shettihalli',
      title: 'Shettihalli Submerged Rosary Church',
      distance: '22 km from Hassan Hub',
      category: 'Bikes',
      recommendedVehicles: 'Royal Enfield, Activa & Scooters',
      image: '/images/tourist/shettihalli.jpg',
      bestTime: 'Monsoon (Submerged View) & Winter (Exposed Ruins)',
      description: 'A 160-year-old French Gothic church built on Hemavathi backwaters. Partially submerged during monsoon dams, creating a surreal landscape.',
      highlights: ['Gothic Ruin Architecture', 'Hemavathi Backwater Sunset', 'Scenic Evening Ride', 'Photography Spot']
    },
    {
      id: 'shravanabelagola',
      title: 'Shravanabelagola Bahubali Monolith',
      distance: '51 km from Hassan Hub',
      category: 'Cars',
      recommendedVehicles: 'Hatchbacks, Sedans & Scooters',
      image: '/images/tourist/shravanabelagola.jpg',
      bestTime: 'Early Morning or Evening Climb',
      description: 'Home to the world’s tallest 57-foot monolithic statue of Lord Bahubali atop Vindhyagiri Hill. A renowned spiritual and heritage destination.',
      highlights: ['57-ft Monolithic Statue', 'Vindhyagiri 650 Steps Climb', 'Tyagada Kamba Pillar', 'Jain Heritage Museum']
    },
    {
      id: 'yagachi',
      title: 'Yagachi Dam & Water Sports Complex',
      distance: '42 km from Hassan Hub',
      category: 'Cars',
      recommendedVehicles: 'SUVs, 7-Seaters & Motorbikes',
      image: '/images/tourist/yagachi.jpg',
      bestTime: 'All Year (Afternoons & Evenings)',
      description: 'Thrilling water adventure spot offering speed boating, jet skiing, banana rides, and kayaking set against serene Yagachi Reservoir.',
      highlights: ['Speed Boating & Jet Skiing', 'Kayaking & Banana Rides', 'Lakeside Sunset Deck', 'Family Picnic Spot']
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-24 md:pt-32 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 mb-4">
            <Compass size={15} /> Hassan Tourist Gateway Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Explore Karnataka from <span className="text-emerald-600">Hassan</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-semibold leading-relaxed">
            Pick up your self-drive car or bike at our Hassan B.M. Road branch and start your road trip to coffee hills, temple heritage, and waterfalls.
          </p>
        </div>

        {/* Tourist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((place) => (
            <div 
              key={place.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col group"
            >
              {/* Image & Distance Tag */}
              <div className="h-56 relative overflow-hidden bg-slate-100">
                <img 
                  src={place.image.startsWith('/uploads/') ? `http://${window.location.hostname}:8000${place.image}` : place.image}
                  alt={place.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <MapPin size={13} className="text-emerald-400" /> {place.distance}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {place.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {place.description}
                </p>

                {/* Recommended Vehicle */}
                <div className="my-4 py-3 px-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
                  {place.category === 'Bikes' ? <Bike size={18} className="text-emerald-600 shrink-0" /> : <Car size={18} className="text-emerald-600 shrink-0" />}
                  <span>Ideal Ride: {place.recommendedVehicles}</span>
                </div>

                {/* Best Time & Key Highlights */}
                <div className="space-y-2 text-xs text-slate-500 mb-6">
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span><b>Best Season:</b> {place.bestTime}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <b className="text-slate-700 block mb-1.5">Trip Highlights:</b>
                    <div className="flex flex-wrap gap-1.5">
                      {place.highlights.map((h, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/vehicles?category=${place.category}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    <span>Book Ride For This Trip</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hassan Branch Pickup &bull; 300 KM/Day Free
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">Ready for Your Karnataka Road Trip?</h2>
            <p className="text-sm text-slate-300">
              Pick up your verified car or bike from B.M. Road, Hassan. Enjoy zero hidden fees, paperless booking &amp; 24x7 roadside assistance.
            </p>
            <div className="pt-2">
              <Link 
                to="/vehicles" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Browse Fleet Catalog</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
