import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  Wallet, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Star,
  Info,
  Waves,
  Palmtree,
  Anchor,
  ArrowLeft,
  ChevronRight,
  Mountain,
  Coffee,
  Sun,
  Coins,
  Gem,
  ArrowRight,
  Users,
  Car,
  Zap,
  Camera,
  Utensils,
  Map as MapIcon,
  Heart,
  CloudRain,
  ShieldCheck,
  Ticket,
  Send,
  User as UserIcon,
  X,
  CreditCard
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Initialize Gemini
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || 
         (window as any).process?.env?.GEMINI_API_KEY || 
         localStorage.getItem('temp_gemini_key') || 
         '';
};

const apiKey = getApiKey();
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface DayPlan {
  day: number;
  activities: {
    timeSlot: string;
    activity: string;
    location: string;
    description: string;
    whyGo: string;
    price: number;
  }[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const LOADING_QUOTES = [
  "Consulting the Catarman digital concierge...",
  "Mapping the tides at Sunken Cemetery...",
  "Sourcing fresh local delicacies...",
  "Optimizing your heritage trail...",
  "Crafting your bespoke island story..."
];

const CAMIGUIN_IMAGES = [
  "https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg",
  "https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg",
  "https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg",
  "https://www.lanzonescabana.com/custom/domain_4/image_files/sitemgr_photo_21.png",
];

const CONCIERGE_SYSTEM_PROMPT = `You are the 'Senior Catarman Concierge,' a warm, local expert for Catarman, Camiguin.

Core Guidelines:
1. Catarman-Exclusive: Only suggest experiences, spots, and services within the municipality of Catarman, Camiguin. Never suggest locations in other municipalities like Mambajao or Mahinog.
2. Conversational Strategy: Your goal is to guide the user to an itinerary. Always respond with helpful information and follow up with a relevant, open-ended question to move the planning forward.
3. Tone: Use a professional, hospitable tone with local charm. Start with 'Maayong adlaw!'.
4. Memory: Keep track of the user's travel style (Adventure, Relax, Foodie), group type, and budget.
5. Itinerary Transition: When the user indicates they are finished chatting (e.g., 'Build the plan', 'Finalize it', 'Generate my itinerary'), you must respond only with a valid JSON array matching this schema:
[{ "day": number, "activities": [{ "timeSlot": string, "activity": string, "location": string, "description": string, "whyGo": string, "price": number }] }]
Do not include conversational text when outputting this JSON.`;

// Stable Sub-components (outside main function to prevent re-animation on keypress)
const ChatBubble = React.memo(({ role, children }: { role: 'model' | 'user', children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex gap-5 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-2xl ${
      role === 'model' ? 'forest-gradient text-white border border-white/10' : 'bg-white text-island-green border border-emerald-100'
    }`}>
      {role === 'model' ? <Sparkles size={22} strokeWidth={2.5} /> : <UserIcon size={22} strokeWidth={2.5} />}
    </div>
    <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl ${
      role === 'model' 
        ? 'bg-white text-island-green border border-emerald-50' 
        : 'emerald-gradient text-white shadow-island-emerald/20'
    }`}>
      {children}
    </div>
  </motion.div>
));

const QuickAction = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-island-emerald hover:bg-island-emerald hover:text-white transition-all shadow-sm whitespace-nowrap"
  >
    {label}
  </motion.button>
);

export default function TripPlannerView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([{
    role: 'model',
    text: "Maayong adlaw! I am your Senior Catarman Concierge. I’m absolutely delighted to help you weave the perfect story for your stay here in our beautiful municipality. To begin, tell me—how many days will you be staying with us in the emerald heart of Camiguin?"
  }]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAMIGUIN_IMAGES.length);
      if (loading) setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = typeof text === 'string' ? text : inputText;
    if (!messageToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: messageToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    if (!genAI) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: "I'm in Offline Mode (Missing API Key). Please check your .env file." }]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash-latest",
        systemInstruction: CONCIERGE_SYSTEM_PROMPT,
        contents: [...messages, userMsg].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const responseText = result.response.text().trim();

      if (responseText.startsWith('[') && responseText.endsWith(']')) {
        try {
          const data = JSON.parse(responseText);
          setItinerary(data);
        } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      setError(`Node Error: ${error.message || 'The digital grid is unstable.'}`);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but my connection to the island's digital grid seems a bit unstable. Could you try saying that again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (activity: any, dayNum: number, actionType: 'transport' | 'pass') => {
    if (!user) {
      login();
      return;
    }

    const activityKey = `${dayNum}-${activity.activity}-${actionType}`;
    setBookingStatus(prev => ({ ...prev, [activityKey]: 'loading' }));

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceName: activity.activity,
        serviceType: actionType === 'transport' ? 'transport' : 'experience',
        location: activity.location,
        date: `Day ${dayNum}`,
        amount: actionType === 'transport' ? 500 : activity.price,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
        isVipBooking: true
      });

      setBookingStatus(prev => ({ ...prev, [activityKey]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [activityKey]: 'idle' }));
      }, 3000);
    } catch (error) {
      setBookingStatus(prev => ({ ...prev, [activityKey]: 'idle' }));
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="flex h-screen bg-island-cream overflow-hidden selection:bg-island-emerald/20 selection:text-island-emerald">
      <div className={`flex flex-col ${isMobile && itinerary ? 'w-full' : isMobile ? 'w-full' : 'w-[550px] lg:w-[720px]'} border-r border-emerald-100 bg-white relative z-20 shadow-2xl`}>
        <header className="px-10 py-8 border-b border-emerald-100 flex items-center justify-between bg-white/95 backdrop-blur-3xl sticky top-0 z-30">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(isMobile ? '/mobile' : '/')} className="p-3 text-island-green bg-emerald-50 hover:bg-emerald-100 transition-all rounded-2xl shadow-sm active:scale-90">
              <ArrowLeft size={22} strokeWidth={3.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-island-green tracking-tighter leading-none">Senior Concierge</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-emerald-50 px-5 py-2.5 rounded-[1.5rem] border border-emerald-100">
            <span className="text-[10px] font-black text-island-emerald uppercase tracking-widest">Live Node</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar bg-island-cream/30 [background-image:radial-gradient(#d1fae5_1px,transparent_1px)] [background-size:32px_32px]">
          {!itinerary ? (
            <div className="space-y-12 pb-24">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} role={msg.role}>{msg.text}</ChatBubble>
              ))}
              
              {loading && (
                <div className="flex gap-4 items-center px-6">
                  <div className="w-2 h-2 bg-island-emerald rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-island-emerald rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-island-emerald rounded-full animate-bounce delay-200"></div>
                  <span className="text-[10px] font-black text-island-emerald uppercase tracking-widest ml-2 italic">Thinking...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12 pb-40 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-island-green tracking-tighter">Your Catarman Manifest</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-island-green px-4 py-1.5 rounded-full">Bespoke Plan</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-island-emerald px-4 py-1.5 rounded-full shadow-lg shadow-island-emerald/20">Pilot Edition</span>
                  </div>
                </div>
                <button onClick={() => setItinerary(null)} className="p-4 text-island-green bg-emerald-50 hover:bg-emerald-100 rounded-[1.5rem] transition-all border-2 border-emerald-100 shadow-md active:scale-90">
                  <RefreshCw size={24} strokeWidth={3} />
                </button>
              </div>

              {itinerary.map((day) => (
                <div key={day.day} className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl forest-gradient text-white flex items-center justify-center text-xl font-black shadow-2xl border border-white/10">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-black text-island-green uppercase tracking-[0.3em] text-xs">Phase {day.day} Timeline</h3>
                      <span className="text-[10px] text-island-green/40 font-black uppercase tracking-widest italic">Verified Catarman Node</span>
                    </div>
                  </div>
                  
                  <div className="space-y-12 border-l-4 border-emerald-100 ml-7 pl-12 py-6 relative">
                    {day.activities.map((act, aIdx) => (
                      <div key={aIdx} className="relative group">
                        <div className="absolute -left-[54px] top-2.5 w-4 h-4 rounded-full bg-white border-[5px] border-island-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 group-hover:scale-125 transition-transform" />
                        
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.25em] bg-island-emerald/10 px-4 py-2 rounded-full border-2 border-island-emerald/10">
                              {act.timeSlot}
                            </span>
                            <span className="text-[10px] font-black text-island-green/40 uppercase tracking-[0.25em]">Est. ₱{act.price}</span>
                          </div>
                        </div>
                        
                        <h4 className="text-3xl font-black text-island-green mb-3 tracking-tighter group-hover:text-island-emerald transition-colors">{act.activity}</h4>
                        <div className="flex items-center gap-2.5 mb-8">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-island-emerald shadow-sm">
                            <MapPin size={14} strokeWidth={4} />
                          </div>
                          <p className="text-[10px] text-island-green/40 font-black uppercase tracking-[0.2em] italic">{act.location}</p>
                        </div>
                        
                        <div className="p-10 bg-white rounded-[3rem] border-2 border-emerald-50 shadow-2xl mb-8 transition-all hover:scale-[1.02] hover:border-island-emerald/30 group-hover:shadow-3xl">
                          <p className="text-base text-island-green/70 font-medium leading-relaxed mb-10">{act.description}</p>
                          
                          <div className="flex items-center gap-5 p-6 bg-island-emerald/[0.05] rounded-[2rem] border-2 border-island-emerald/10 mb-10">
                            <div className="w-12 h-12 rounded-2xl emerald-gradient text-white flex items-center justify-center shrink-0 shadow-lg">
                              <Sparkles size={22} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-island-emerald uppercase tracking-[0.3em] block mb-1">Catarman Intelligence</span>
                              <p className="text-xs text-island-green font-black italic leading-snug">"{act.whyGo}"</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-5">
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(act, day.day, 'pass')}
                              disabled={bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'}
                              className={`btn-primary flex-1 h-16 rounded-[1.75rem] ${
                                bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' 
                                  ? 'bg-green-700 shadow-none border border-green-800' 
                                  : ''
                              }`}
                            >
                              {bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' ? <><CheckCircle2 size={22} strokeWidth={3} /> Manifested</> : <><Ticket size={22} strokeWidth={3} /> Add to Pass</>}
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(act, day.day, 'transport')}
                              disabled={bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-transport`] === 'success'}
                              className="w-20 h-16 rounded-[1.75rem] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-island-green/40 hover:text-island-emerald hover:border-island-emerald/30 transition-all shadow-md active:bg-emerald-100"
                            >
                              {bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' ? <CheckCircle2 size={28} className="text-island-emerald" strokeWidth={4} /> : <Car size={28} strokeWidth={3} />}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-16 pb-24 space-y-5">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-volcanic w-full py-8 rounded-[2.5rem] text-sm shadow-emerald-900/40"
                >
                  <CreditCard size={24} strokeWidth={3} /> Finalize All Nodes
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {!itinerary && (
          <div className="p-10 bg-white border-t border-emerald-100 sticky bottom-0 z-40 shadow-[0_-10px_40px_-10px_rgba(6,78,59,0.05)]">
            {error && (
               <div className="mb-4 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100">
                 {error}
               </div>
            )}
            <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
              <QuickAction label="Adventure" onClick={() => handleSendMessage("I want an adventure-filled trip.")} />
              <QuickAction label="Relaxing" onClick={() => handleSendMessage("Suggest a very relaxing itinerary.")} />
              <QuickAction label="Foodie" onClick={() => handleSendMessage("Show me the best local food spots.")} />
              <QuickAction label="Finalize" onClick={() => handleSendMessage("Build the plan and finalize it.")} />
            </div>
            <div className="bg-emerald-50 rounded-[2.5rem] p-4 flex items-center gap-5 border-2 border-emerald-100 shadow-inner">
              <div className="w-12 h-12 rounded-2xl emerald-gradient text-white flex items-center justify-center shadow-lg shrink-0">
                <Sparkles size={24} strokeWidth={3} />
              </div>
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message the Senior Concierge..." 
                className="bg-transparent border-none flex-1 text-sm font-bold text-island-green outline-none placeholder:text-island-green/30"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-island-emerald text-white flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-50"
              >
                <Send size={22} strokeWidth={3.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 relative bg-island-volcanic overflow-hidden ${isMobile ? 'hidden' : 'block'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 3, ease: [0.2, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={CAMIGUIN_IMAGES[currentImageIndex]} 
              alt="Catarman" 
              className="w-full h-full object-cover opacity-60 contrast-125 saturate-[0.8]"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic via-island-volcanic/20 to-island-volcanic/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,44,34,0.5)_100%)]" />

        <div className="absolute inset-0 flex flex-col justify-end p-24 text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="max-w-3xl space-y-12"
          >
            <div className="flex items-center gap-5 bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-full border-2 border-white/20 w-fit shadow-2xl">
              <MapIcon size={22} className="text-island-emerald" strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Node: 9.2014° N, 124.6675° E</span>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-8xl lg:text-9xl font-bold leading-[0.8] tracking-tighter">Bespoke <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-emerald-100">Catarman.</span></h2>
              <p className="text-3xl text-emerald-100/70 font-semibold leading-relaxed max-w-xl">Advanced neural concierge meets volcanic heritage. Welcome to the pilot experience.</p>
            </div>
            
            <div className="flex items-center gap-16 pt-12 border-t-2 border-white/10">
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Heritage</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Ancestral Core</span>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Lush</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Island Energy</span>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Infinite</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Digital Node</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-16 right-16 flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-[1.75rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white shadow-3xl transition-all"
          >
            <Heart size={28} strokeWidth={3} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/')}
            className="w-16 h-16 rounded-[1.75rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white shadow-3xl transition-all"
          >
            <X size={28} strokeWidth={3} />
          </motion.button>
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-5 px-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-1.5 h-10 rounded-full transition-all duration-1000 ${i === currentImageIndex ? 'bg-island-emerald h-24 shadow-[0_0_20px_rgba(16,185,129,1)]' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
