import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, Car, Bike, MapPin, Clock, Calendar, ArrowRight, Info, ShieldCheck, Waves, Navigation, X, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { transportOptions, schedules } from '../data/transport';

export default function TransportView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleBookTransport = async (transport: any) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus('loading');
    try {
      const bookingData = {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: transport.id,
        serviceName: transport.title,
        serviceType: 'transport',
        businessId: transport.businessId,
        date: new Date().toLocaleDateString(),
        amount: transport.price,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setBookingStatus('success');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedTransport(null);
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
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
          alt="Catarman Transport" 
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
              <Ship size={16} className="text-blue-400" />
              <span className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Municipal Logistics Nodes</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-bold text-white mb-8 tracking-tighter leading-[0.85] drop-shadow-2xl">
              Island <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Flow.</span>
            </h1>
            <p className="text-2xl text-blue-50/70 font-semibold max-w-2xl leading-relaxed">
              Seamless ferry bookings, local transport loops, and real-time tracking for the Catarman pilot adventure.
            </p>
          </motion.div>
        </div>
        
        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] vertical-rl">Active Transit</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Booking Options */}
          <div className="lg:col-span-2 space-y-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-1 bg-blue-500 rounded-full"></div>
                <span className="text-blue-500 font-black uppercase tracking-[0.5em] text-[10px]">Transit Grid</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold text-island-volcanic tracking-tighter leading-none mb-16">Verified <span className="italic font-serif font-light text-blue-600">Nodes.</span></h2>
              
              <div className="grid grid-cols-1 gap-12">
                {transportOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="group bg-white p-8 rounded-[4rem] border-2 border-emerald-50 shadow-[0_20px_50px_-12px_rgba(6,78,59,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(6,78,59,0.15)] transition-all duration-700 flex flex-col md:flex-row items-center gap-12"
                  >
                    <div className={`w-32 h-32 rounded-[2.5rem] ocean-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/20`}>
                      <opt.icon size={56} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h3 className="text-4xl font-bold text-island-volcanic tracking-tighter group-hover:text-blue-600 transition-colors">{opt.title}</h3>
                        <span className="px-5 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">
                          {opt.provider}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed">{opt.route}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-10">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                            <Clock size={20} strokeWidth={3} />
                          </div>
                          {opt.duration}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-island-emerald shadow-sm">
                            <ShieldCheck size={20} strokeWidth={3} />
                          </div>
                          Verified Node
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right min-w-[180px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Standard Fare</span>
                      <p className="text-5xl font-black text-island-volcanic tracking-tighter mb-8">₱{opt.price.toLocaleString()}</p>
                      <button 
                        onClick={() => setSelectedTransport(opt)}
                        className="btn-primary w-full py-6 rounded-2xl shadow-blue-900/10"
                      >
                        Reserve Node <ArrowRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tracking Teaser */}
            <div className="volcanic-gradient p-20 rounded-[4.5rem] text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(2,44,34,0.3)] border border-white/10">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <Navigation size={500} className="absolute -top-20 -right-20 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-1 bg-island-emerald rounded-full"></div>
                  <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px]">Real-time Telemetry</span>
                </div>
                <h3 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter leading-none">Live <span className="text-island-emerald">Node Tracker.</span></h3>
                <p className="text-emerald-50/60 font-medium text-2xl mb-12 max-w-md leading-relaxed">
                  Advanced GPS tracking for all municipal ferry nodes in the Catarman channel.
                </p>
                <div className="flex flex-wrap items-center gap-12">
                  <button className="btn-primary px-14 py-8 rounded-[2rem] text-sm">
                    Initialize Node Tracking
                  </button>
                  <div className="flex items-center gap-4 text-island-emerald font-black uppercase tracking-[0.2em] text-[12px]">
                    <span className="w-3.5 h-3.5 rounded-full bg-island-emerald animate-pulse shadow-[0_0_20px_rgba(16,185,129,1)]"></span>
                    4 Active Nodes detected
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-12">
            <div className="bg-white p-12 rounded-[4.5rem] border-2 border-emerald-50 shadow-[0_20px_50px_-12px_rgba(6,78,59,0.08)]">
              <div className="flex items-center gap-5 mb-12 pb-8 border-b-2 border-emerald-50/50">
                <div className="w-16 h-16 ocean-gradient text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border border-white/10">
                  <Waves size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-island-volcanic tracking-tighter leading-none mb-1">Manifests.</h3>
                  <span className="text-[9px] font-black text-island-emerald uppercase tracking-[0.3em]">Ferry Schedules</span>
                </div>
              </div>
              
              <div className="space-y-10">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-6 border-b border-emerald-50/50 last:border-0 group cursor-default">
                    <div>
                      <p className="text-2xl font-bold text-island-volcanic tracking-tighter group-hover:text-blue-600 transition-colors">{s.time}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">{s.from} → {s.to}</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${s.type === 'warning' ? 'bg-rose-50 text-island-coral border-rose-100' : 'bg-emerald-50 text-island-emerald border-emerald-100'}`}>
                      {s.status}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 p-10 bg-emerald-50/30 rounded-[3rem] flex items-start gap-6 border border-emerald-100/50">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                  <Info size={24} strokeWidth={3} />
                </div>
                <p className="text-xs text-island-green/60 font-black leading-relaxed uppercase tracking-[0.15em] italic">
                  Operational status depends on real-time climate telemetry. Terminal arrival advised 45m prior to departure.
                </p>
              </div>
            </div>

            <div className="lush-gradient p-12 rounded-[4.5rem] text-white shadow-3xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Sparkles size={200} className="translate-x-12 -translate-y-12 rotate-12" />
              </div>
              <h3 className="text-3xl font-bold mb-6 tracking-tighter leading-none">Bespoke Guides.</h3>
              <p className="text-emerald-50/60 font-semibold text-lg mb-12 leading-relaxed">
                Assign a verified local heritage agent with secure transit for a deep immersion experience.
              </p>
              <button className="w-full py-7 bg-white/10 backdrop-blur-3xl border-2 border-white/20 rounded-[2rem] text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white/20 transition-all active:scale-95 shadow-2xl">
                Request Protocol Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTransport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransport(null)}
              className="absolute inset-0 bg-island-volcanic/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[4rem] overflow-hidden shadow-3xl border-2 border-slate-100"
            >
              <button 
                onClick={() => setSelectedTransport(null)}
                className="absolute top-8 right-8 p-4 bg-slate-100 rounded-full text-slate-600 hover:text-island-coral active:scale-90 transition-all shadow-sm"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="p-12">
                <div className="flex items-center gap-6 mb-10 pb-10 border-b-2 border-stone-50">
                  <div className={`w-20 h-20 rounded-[1.75rem] ocean-gradient text-white flex items-center justify-center shadow-2xl border border-white/10`}>
                    <selectedTransport.icon size={44} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">{selectedTransport.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">{selectedTransport.provider}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <MapPin size={24} strokeWidth={3} className="text-island-emerald" />
                    <span className="text-lg tracking-tight">{selectedTransport.route}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <Clock size={24} strokeWidth={3} className="text-island-emerald" />
                    <span className="text-lg tracking-tight">{selectedTransport.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-10 bg-stone-50 rounded-[3rem] mb-12 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmed Fare</span>
                    <span className="text-4xl font-black text-island-volcanic tracking-tighter">₱{selectedTransport.price.toLocaleString()}</span>
                  </div>
                  <ShieldCheck size={48} className="text-island-emerald opacity-20" />
                </div>

                {bookingStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 py-6 bg-emerald-50 rounded-[3rem] border-2 border-emerald-100"
                  >
                    <div className="w-16 h-16 btn-primary rounded-full shadow-2xl">
                      <CheckCircle2 size={36} strokeWidth={3} />
                    </div>
                    <p className="text-island-emerald font-black uppercase tracking-[0.3em] text-[11px]">Booking Active</p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => handleBookTransport(selectedTransport)}
                    disabled={bookingStatus === 'loading'}
                    className="btn-primary w-full py-8 rounded-[2.5rem] text-sm disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? (
                      <RefreshCw size={24} className="animate-spin" />
                    ) : (
                      <Sparkles size={24} strokeWidth={2.5} />
                    )}
                    Commit to Transit
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
