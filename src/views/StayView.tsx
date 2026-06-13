import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotel, Star, MapPin, Wifi, Coffee, Wind, Waves, ArrowRight, Search, Filter, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { accommodations } from '../data/accommodations';

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');

  const handleBook = async (hotel: typeof accommodations[0]) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus(prev => ({ ...prev, [hotel.id]: 'loading' }));
    setTestError(null);

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: hotel.id,
        serviceName: hotel.name,
        serviceType: 'stay',
        businessId: hotel.businessId,
        date: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: hotel.price,
        createdAt: serverTimestamp()
      });
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
      }, 3000);
    } catch (error: any) {
      console.error("Booking error:", error);
      setTestError(error.message || String(error));
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
      try {
        handleFirestoreError(error, OperationType.CREATE, 'bookings');
      } catch (e) {}
    }
  };

  return (
    <div className="bg-[#FDFDFB] min-h-screen pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <section className="relative h-[65vh] flex items-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
          alt="Catarman Resorts" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/90 via-island-volcanic/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,44,34,0.4)_100%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-3xl px-6 py-2 rounded-full border border-white/20 w-fit mb-8">
              <Sparkles size={16} className="text-island-emerald" />
              <span className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Verified Habitat Nodes</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-bold text-white mb-8 tracking-tighter leading-[0.85] drop-shadow-2xl">
              Island <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-emerald-200">Habitats.</span>
            </h1>
            <p className="text-2xl text-emerald-50/70 font-semibold max-w-2xl leading-relaxed">
              From luxury beachfront villas to historic ancestral stays, discover the premier resting places in the Catarman pilot.
            </p>
          </motion.div>
        </div>
        
        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] vertical-rl">Explore Grid</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(2,44,34,0.15)] flex flex-wrap md:flex-nowrap gap-6 items-center border border-emerald-50"
        >
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-island-emerald transition-colors" size={24} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Query municipal habitat nodes..." 
              className="w-full pl-16 pr-6 py-6 bg-stone-50 rounded-[2rem] outline-none focus:ring-8 focus:ring-island-emerald/5 focus:bg-white transition-all font-bold text-slate-900 border-2 border-transparent focus:border-island-emerald/20"
            />
          </div>
          <button className="h-20 px-10 bg-white border-2 border-emerald-50 rounded-[2rem] text-island-green hover:bg-emerald-50 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-4">
            <Filter size={20} strokeWidth={3} /> Filters
          </button>
          <button className="h-20 px-14 forest-gradient text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-island-green/20 hover:scale-[1.02] active:scale-95 transition-all">
            Execute Query
          </button>
        </motion.div>
        {testError && (
          <div className="mt-8 p-6 bg-rose-50 text-rose-700 rounded-[2rem] border-2 border-rose-100 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-4">
            <XCircle size={24} /> Telemetry Error: {testError}
          </div>
        )}
      </div>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-6 mt-40">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-1 bg-island-emerald rounded-full"></div>
              <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px]">Catarman Catalog</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-island-volcanic tracking-tighter leading-none">Verified <span className="italic font-serif font-light text-island-green">Stays.</span></h2>
          </div>
          <div className="flex gap-2 bg-emerald-50/50 p-2 rounded-[2.5rem] border border-emerald-100 shadow-inner">
            {['All', 'Resorts', 'Homestays'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setSelectedTab(tab)}
                className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  selectedTab === tab 
                    ? 'lush-gradient text-white shadow-xl shadow-island-green/30' 
                    : 'text-island-green/40 hover:text-island-green'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {accommodations.map((hotel, idx) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group bg-white rounded-[4.5rem] overflow-hidden border-2 border-emerald-50 shadow-[0_20px_50px_-12px_rgba(6,78,59,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(6,78,59,0.15)] transition-all duration-700 p-6"
            >
              <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden mb-12">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="absolute top-10 right-10 px-6 py-3 bg-white/95 backdrop-blur-xl rounded-2xl text-sm font-black flex items-center gap-3 text-island-volcanic shadow-2xl border border-white/50">
                  <Star size={18} fill="#D97706" className="text-island-sunset" /> {hotel.rating}
                </div>
                
                <div className="absolute bottom-10 left-10 flex gap-3">
                  {hotel.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-5 py-2 bg-white/10 backdrop-blur-3xl text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20 shadow-xl">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <div className="flex justify-between items-start mb-10">
                  <div className="max-w-[70%]">
                    <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.4em] mb-3 block">{hotel.type}</span>
                    <h3 className="text-5xl font-bold text-island-volcanic tracking-tighter leading-[0.9] group-hover:text-island-emerald transition-colors">{hotel.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Pilot Rate</span>
                    <p className="text-4xl font-black text-island-volcanic tracking-tighter">₱{hotel.price.toLocaleString()}</p>
                    <span className="text-[9px] text-island-emerald font-black uppercase tracking-widest">Per Node/Night</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-10 mb-12 py-10 border-y-2 border-emerald-50/50">
                  <div className="flex items-center gap-3 text-island-green/60 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-island-emerald shadow-sm">
                      <Wifi size={20} strokeWidth={3} />
                    </div>
                    Fiber
                  </div>
                  <div className="flex items-center gap-3 text-island-green/60 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-island-emerald shadow-sm">
                      <Coffee size={20} strokeWidth={3} />
                    </div>
                    Amenities
                  </div>
                  <div className="flex items-center gap-3 text-island-green/60 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-island-emerald shadow-sm">
                      <Wind size={20} strokeWidth={3} />
                    </div>
                    Climate
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(hotel)}
                  disabled={bookingStatus[hotel.id] === 'loading' || bookingStatus[hotel.id] === 'success'}
                  className={`btn-primary w-full py-8 rounded-[2.5rem] shadow-emerald-900/10 ${
                    bookingStatus[hotel.id] === 'success' ? 'bg-green-700 shadow-none ring-4 ring-green-100' : ''
                  }`}
                >
                  {bookingStatus[hotel.id] === 'success' ? (
                    <>
                      <CheckCircle2 size={24} strokeWidth={3} />
                      Assignment Verified
                    </>
                  ) : bookingStatus[hotel.id] === 'loading' ? (
                    <RefreshCw size={24} strokeWidth={3} className="animate-spin" />
                  ) : (
                    <>
                      Verify Accommodation <ArrowRight size={24} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
