import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Compass, 
  BarChart3, 
  MessageSquare, 
  Tag, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  X,
  Smartphone,
  Star,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';

import BookingsModule from '../components/business/BookingsModule';
import InventoryModule from '../components/business/InventoryModule';
import ToursModule from '../components/business/ToursModule';
import AnalyticsModule from '../components/business/AnalyticsModule';
import ReviewsModule from '../components/business/ReviewsModule';
import SettingsModule from '../components/business/SettingsModule';

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 6890 },
  { name: 'Sat', sales: 8390 },
  { name: 'Sun', sales: 7490 },
];

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const businessId = profile?.businessId || 'demo-biz';

  useEffect(() => {
    if (!businessId) return;

    const q = query(
      collection(db, 'bookings'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [businessId]);

  const unconfirmedCount = useMemo(() => 
    bookings.filter(b => b.status === 'pending').length
  , [bookings]);

  const totalRevenue = useMemo(() => 
    bookings.filter(b => b.paymentStatus === 'PAID').reduce((acc, b) => acc + (b.amount || 0), 0)
  , [bookings]);

  const DashboardHome = () => (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} change="+12%" isPositive={true} color="emerald" />
        <StatCard icon={Calendar} label="New Bookings" value={bookings.length.toString()} change="+5" isPositive={true} color="blue" />
        <StatCard icon={Star} label="Avg Rating" value="4.8" change="+0.2" isPositive={true} color="amber" />
        <StatCard icon={Users} label="Total Guests" value="1,242" change="-3%" isPositive={false} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Operational Revenue</h3>
            <select className="bg-stone-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-island-emerald">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#064E3B', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#064E3B', fontSize: 10, fontWeight: 800}} />
                <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(6,78,59,0.2)', padding: '20px' }} />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
          <h3 className="text-2xl font-black text-island-volcanic tracking-tighter mb-10">Live Pulse</h3>
          <div className="space-y-8">
            {bookings.slice(0, 5).map((booking, i) => (
              <div key={i} className="flex gap-5 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  booking.paymentStatus === 'PAID' ? 'bg-emerald-50 text-island-emerald' : 'bg-amber-50 text-island-sunset'
                }`}>
                  {booking.paymentStatus === 'PAID' ? <CheckCircle2 size={20} strokeWidth={3} /> : <Clock size={20} strokeWidth={3} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black text-island-volcanic truncate leading-none mb-1">{booking.touristName}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{booking.serviceName}</p>
                </div>
                <p className="text-sm font-black text-island-green">₱{booking.amount?.toLocaleString()}</p>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="mx-auto text-emerald-100 mb-4" size={48} />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Recent Activity</p>
              </div>
            )}
          </div>
          {bookings.length > 0 && (
            <Link to="/business/bookings" className="w-full mt-12 py-5 btn-secondary rounded-2xl text-[10px]">
              View All Nodes
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#F4F4F1] selection:bg-island-emerald/20">
      {/* Sidebar */}
      <aside className="w-[320px] bg-white border-r border-emerald-50 hidden lg:flex flex-col shadow-2xl relative z-20">
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-5 mb-16 px-4">
            <div className="w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center text-white shadow-2xl border border-white/10">
              <Building2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter leading-none mb-1">Business</h3>
              <span className="text-[10px] text-island-emerald font-black uppercase tracking-[0.4em]">Node Operator</span>
            </div>
          </div>

          <nav className="space-y-4">
            <SidebarItem icon={LayoutDashboard} label="Operations" to="/business" active={location.pathname === '/business'} />
            <SidebarItem icon={Calendar} label="Manifests" to="/business/bookings" active={location.pathname.startsWith('/business/bookings')} badge={unconfirmedCount} />
            <SidebarItem icon={Package} label="Inventory" to="/business/inventory" active={location.pathname.startsWith('/business/inventory')} />
            <SidebarItem icon={Compass} label="Experience Node" to="/business/tours" active={location.pathname.startsWith('/business/tours')} />
            <SidebarItem icon={BarChart3} label="Performance" to="/business/analytics" active={location.pathname.startsWith('/business/analytics')} />
            <SidebarItem icon={MessageSquare} label="Reviews" to="/business/reviews" active={location.pathname.startsWith('/business/reviews')} />
          </nav>
        </div>
        
        <div className="p-10 border-t-2 border-stone-50 space-y-4">
          <SidebarItem icon={Settings} label="Interface" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <Link 
            to="/"
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest text-slate-400 bg-stone-50 hover:bg-rose-50 hover:text-island-coral transition-all duration-300 border border-transparent hover:border-rose-100"
          >
            <X size={22} strokeWidth={3} />
            Detach Node
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-white/50 backdrop-blur-sm">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px] mb-3 block">Operational Interface v1.0.5</span>
            <h1 className="text-5xl font-black text-island-volcanic tracking-tighter leading-none">{profile?.name || 'Business'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-green">Command.</span></h1>
            <p className="text-slate-500 font-semibold text-lg mt-3">Node ID: {businessId} • Pilot Active</p>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            <button className="btn-primary px-8 py-4 rounded-2xl h-14">
              <Plus size={20} strokeWidth={3} />
              <span className="hidden md:inline">New Manifest</span>
            </button>
            <button className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-2xl text-island-volcanic flex items-center justify-center relative shadow-2xl hover:bg-emerald-50 active:scale-90 transition-all group">
              <Bell size={24} strokeWidth={2.5} className="group-hover:text-island-emerald transition-colors" />
              <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-island-coral rounded-full border-2 border-white ring-4 ring-rose-500/10"></span>
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/bookings" element={<BookingsModule />} />
          <Route path="/inventory" element={<InventoryModule />} />
          <Route path="/tours" element={<ToursModule />} />
          <Route path="/analytics" element={<AnalyticsModule />} />
          <Route path="/reviews" element={<ReviewsModule />} />
          <Route path="/settings" element={<SettingsModule />} />
        </Routes>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, isPositive, color }: any) {
  const colors: any = {
    emerald: 'text-island-emerald bg-emerald-50 border-emerald-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    amber: 'text-island-sunset bg-amber-50 border-amber-100',
    rose: 'text-island-coral bg-rose-50 border-rose-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -12 }}
      className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl hover:shadow-3xl transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-2xl border-2 ${colors[color]} shadow-lg`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black px-4 py-2 rounded-full border-2 ${isPositive ? 'bg-emerald-50 text-island-emerald border-emerald-100' : 'bg-rose-50 text-island-coral border-rose-100'}`}>
          {isPositive ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
          {change}
        </div>
      </div>
      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{label}</h4>
      <p className="text-4xl font-black text-island-volcanic tracking-tighter">{value}</p>
    </motion.div>
  );
}

function SidebarItem({ icon: Icon, label, to, active = false, badge }: { icon: any, label: string, to: string, active?: boolean, badge?: number }) {
  return (
    <Link 
      to={to}
      className={`w-full flex items-center justify-between gap-5 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
      active 
        ? 'emerald-gradient text-white shadow-2xl shadow-island-emerald/30 border border-white/10' 
        : 'text-island-green/40 bg-transparent hover:bg-emerald-50/50 hover:text-island-green'
    }`}>
      <div className="flex items-center gap-5">
        <Icon size={22} strokeWidth={active ? 3 : 2.5} />
        {label}
      </div>
      {badge && badge > 0 && (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${active ? 'bg-white text-island-emerald shadow-lg' : 'bg-island-coral text-white shadow-xl shadow-rose-500/20'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
