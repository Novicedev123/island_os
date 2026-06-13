import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  X
} from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Business Modules
import AnalyticsModule from '../components/business/AnalyticsModule';
import BookingsModule from '../components/business/BookingsModule';
import InventoryModule from '../components/business/InventoryModule';
import ReviewsModule from '../components/business/ReviewsModule';
import SettingsModule from '../components/business/SettingsModule';
import ToursModule from '../components/business/ToursModule';

export default function BusinessDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  
  const SidebarItem = ({ icon: Icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) => (
    <Link 
      to={to}
      className={`w-full flex items-center gap-5 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
      active 
        ? 'emerald-gradient text-white shadow-2xl shadow-island-emerald/30 border border-white/10' 
        : 'text-island-green/40 bg-transparent hover:bg-emerald-50/50 hover:text-island-green'
    }`}>
      <Icon size={22} strokeWidth={active ? 3 : 2.5} />
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#FDFDFB] selection:bg-island-emerald/20">
      {/* Sidebar */}
      <aside className="w-[320px] bg-white border-r border-slate-100 hidden lg:flex flex-col shadow-2xl relative z-20">
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-5 mb-16 px-4">
            <div className="w-14 h-14 rounded-2xl lush-gradient flex items-center justify-center text-white shadow-2xl border border-white/10">
              <TrendingUp size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter leading-none mb-1">Catarman</h3>
              <span className="text-[10px] text-island-emerald font-black uppercase tracking-[0.4em]">Partner Hub</span>
            </div>
          </div>

          <nav className="space-y-4">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/business" active={location.pathname === '/business'} />
            <SidebarItem icon={Calendar} label="Bookings" to="/business/bookings" active={location.pathname.startsWith('/business/bookings')} />
            <SidebarItem icon={Package} label="Inventory" to="/business/inventory" active={location.pathname.startsWith('/business/inventory')} />
            <SidebarItem icon={Sparkles} label="Tours" to="/business/tours" active={location.pathname.startsWith('/business/tours')} />
            <SidebarItem icon={MessageSquare} label="Reviews" to="/business/reviews" active={location.pathname.startsWith('/business/reviews')} />
            <SidebarItem icon={BarChart3} label="Analytics" to="/business/analytics" active={location.pathname.startsWith('/business/analytics')} />
          </nav>
        </div>
        
        <div className="p-10 border-t-2 border-slate-50 space-y-4">
          <SidebarItem icon={Settings} label="Settings" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest text-slate-400 bg-stone-50 hover:bg-rose-50 hover:text-island-coral transition-all duration-300 border border-transparent hover:border-rose-100"
          >
            <LogOut size={22} strokeWidth={3} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-island-cream/5">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px] mb-3 block">Welcome back, {profile?.businessName || 'Partner'}</span>
            <h1 className="text-5xl font-black text-island-volcanic tracking-tighter leading-none">Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-green">Command.</span></h1>
            <p className="text-slate-500 font-semibold text-lg mt-3">Manage your island operations and guest experiences.</p>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-island-emerald transition-colors" size={20} strokeWidth={3} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-14 pr-6 py-4 bg-white border-2 border-emerald-50 rounded-2xl outline-none focus:ring-8 focus:ring-island-emerald/5 focus:border-island-emerald/20 transition-all w-full md:w-80 shadow-2xl"
              />
            </div>
            <button className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-2xl text-island-volcanic flex items-center justify-center relative shadow-2xl hover:bg-emerald-50 active:scale-90 transition-all group">
              <Bell size={24} strokeWidth={2.5} className="group-hover:text-island-emerald transition-colors" />
              <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-island-coral rounded-full border-2 border-white ring-4 ring-rose-500/10"></span>
            </button>
            <div className="w-14 h-14 rounded-2xl border-2 border-emerald-50 bg-white shadow-2xl overflow-hidden flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-emerald-100" size={32} />
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<AnalyticsModule />} />
          <Route path="/bookings" element={<BookingsModule />} />
          <Route path="/inventory" element={<InventoryModule />} />
          <Route path="/tours" element={<ToursModule />} />
          <Route path="/reviews" element={<ReviewsModule />} />
          <Route path="/analytics" element={<AnalyticsModule />} />
          <Route path="/settings" element={<SettingsModule />} />
        </Routes>
      </main>
    </div>
  );
}
