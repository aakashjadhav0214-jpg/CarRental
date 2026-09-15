import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const OfficeMap = () => {
  const [office, setOffice] = useState({
    name: 'Shri Krishna Car & Bike Rentals - Hassan Hub',
    address: '232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201',
    latitude: 13.001567,
    longitude: 76.081876,
    phone: '+91 72598 57486 | +91 95133 48666',
    landline: '08172-268900',
    working_hours: '06:00 AM - 11:00 PM (24/7 Handover available)'
  });

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const res = await api.get('/office');
        if (res.data) {
          setOffice(prev => ({
            ...prev,
            name: res.data.name || prev.name,
            address: res.data.address || prev.address,
            latitude: res.data.latitude || prev.latitude,
            longitude: res.data.longitude || prev.longitude,
            phone: res.data.phone || prev.phone,
            working_hours: res.data.working_hours || prev.working_hours
          }));
        }
      } catch (err) {
        console.error('Failed to fetch office details', err);
      }
    };
    fetchOffice();
  }, []);

  const handleGetDirections = () => {
    window.open(`https://www.google.com/maps/place/13%C2%B000'05.6%22N+76%C2%B004'54.8%22E/@13.0015667,76.0818759,17z`, '_blank');
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 md:pt-32 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Our Branch</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
            Visit Our Hassan Branch
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            Conveniently located on B.M. Road for immediate self-drive car and bike handovers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Showroom Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Hassan Branch
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-3">{office.name}</h3>
            </div>
            
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Address</b>
                  <p className="text-slate-600 mt-0.5">{office.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Phone Numbers</b>
                  <p className="text-slate-600 mt-0.5">{office.phone} &bull; {office.landline}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <b className="block text-slate-900 font-bold">Showroom Timings</b>
                  <p className="text-slate-600 mt-0.5">{office.working_hours}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <button 
                onClick={handleGetDirections}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Open Directions in Google Maps</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Instant pickup &amp; return at our Hassan branch</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-2 h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
            <MapContainer 
              key={`map-${office.latitude}-${office.longitude}`}
              center={[office.latitude, office.longitude]} 
              zoom={16} 
              scrollWheelZoom={true} 
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[office.latitude, office.longitude]}>
                <Popup>
                  <div className="p-1 font-sans">
                    <b className="text-slate-900 block font-bold text-sm">{office.name}</b>
                    <p className="text-xs text-slate-600 mt-0.5">{office.address}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

        </div>

      </div>
    </div>
  );
};
