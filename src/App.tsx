import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Building2, 
  Smartphone, 
  Menu, 
  X, 
  MapPin, 
  Calendar, 
  Search, 
  Star, 
  User as UserIcon,
  Compass,
  Hotel,
  Ship,
  Sparkles,
  Ticket,
  CreditCard,
  Bell,
  LogOut,
  LogIn,
  BarChart3,
  ShieldCheck,
  Map as MapIcon
} from 'lucide-react';
import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

// Views
import LandingView from './views/LandingView';
import StayView from './views/StayView';
import TransportView from './views/TransportView';
import TouristPassView from './views/TouristPassView';
import MyBookingsView from './views/MyBookingsView';
import BusinessDashboard from './views/BusinessDashboard';
import GovernmentDashboard from './views/GovernmentDashboard';
import TripPlannerView from './views/TripPlannerView';
import ClaimBusinessView from './views/ClaimBusinessView';
import ShopsView from './views/ShopsView';
import LocationsView from './views/LocationsView';
import MobileAppView from './views/MobileAppView';

export type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function RoleSwitcher({ currentRole, onRoleChange }: { currentRole: UserRole, onRoleChange: (role: UserRole) => void }) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Protection logic: If mobile but not on /mobile, redirect to /mobile
    if (isMobile && currentPath !== '/mobile' && !currentPath.startsWith('/planner')) {
      navigate('/mobile');
      return;
    }

    // Auto-switch role based on path
    if (currentPath.startsWith('/business')) {
      if (currentRole !== 'BUSINESS') onRoleChange('BUSINESS');
    } else if (currentPath.startsWith('/government')) {
      if (currentRole !== 'LGU') onRoleChange('LGU');
    } else {
      if (currentRole !== 'TOURIST') onRoleChange('TOURIST');
    }
  }, [location.pathname, isMobile, onRoleChange, currentRole, navigate]);

  return null;
}

function MobileHeader() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-emerald-100 h-16 flex items-center justify-between px-6 md:hidden shadow-sm">
      <Link to="/mobile?tab=explore" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 forest-gradient rounded-lg flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform">
          <Compass size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-serif font-bold text-island-green tracking-tight italic">
          Isle<span className="not-italic text-island-emerald">GO</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-island-green bg-emerald-50 rounded-full transition-colors active:bg-emerald-100">
          <Bell size={20} strokeWidth={2.5} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-island-coral rounded-full border-2 border-white ring-4 ring-island-coral/10"></span>
        </button>
        <Link to="/mobile?tab=profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-emerald-100 group-active:scale-90 transition-transform">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-island-green">
              <UserIcon size={18} strokeWidth={2.5} />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';
  
  const navItems = [
    { path: '/mobile?tab=explore', label: 'Explore', icon: Compass },
    { path: '/mobile?tab=map', label: 'Map', icon: MapIcon },
    { path: '/planner', label: 'Planner', icon: Sparkles },
    { path: '/mobile?tab=pass', label: 'Pass', icon: CreditCard },
    { path: '/mobile?tab=profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-3xl border-t border-emerald-100 px-4 pb-safe-offset-4 pt-3 flex items-center justify-around md:hidden shadow-[0_-4px_20px_-10px_rgba(6,78,59,0.1)]">
      {navItems.map((item) => {
        const itemPath = item.path.split('?')[0];
        const itemTab = new URLSearchParams(item.path.split('?')[1]).get('tab');
        
        const isActive = location.pathname === itemPath && (itemTab ? currentTab === itemTab : location.pathname === item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1.5 min-w-[64px] group"
          >
            <motion.div
              whileTap={{ scale: 0.85 }}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-island-emerald bg-emerald-50' : 'text-slate-400 hover:text-island-green'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-island-emerald rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
            <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
              isActive ? 'text-island-emerald' : 'text-slate-400 group-hover:text-island-green'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Navigation({ currentRole, onRoleChange }: { currentRole: UserRole, onRoleChange: (role: UserRole) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const touristItems = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/stay', label: 'Stay', icon: Hotel },
    { path: '/transport', label: 'Transport', icon: Ship },
    { path: '/shops', label: 'Shops', icon: Building2 },
    { path: '/locations', label: 'Locations', icon: MapIcon },
    { path: '/planner', label: 'AI Planner', icon: Sparkles },
    { path: '/pass', label: 'Tourist Pass', icon: Ticket },
    { path: '/my-bookings', label: 'My Bookings', icon: Calendar },
  ];

  const businessItems = [
    { path: '/business', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/business/bookings', label: 'Bookings', icon: Calendar },
    { path: '/business/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const lguItems = [
    { path: '/government', label: 'Analytics', icon: LayoutDashboard },
    { path: '/government/map', label: 'Island Map', icon: MapIcon },
    { path: '/government/reports', label: 'Reports', icon: Ticket },
  ];

  const getNavItems = () => {
    switch (currentRole) {
      case 'BUSINESS': return businessItems;
      case 'LGU': return lguItems;
      default: return touristItems;
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    if (profile && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { ...profile, role }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    
    setIsRoleMenuOpen(false);
    setIsMenuOpen(false);
    
    // Navigate to the appropriate dashboard/home
    if (role === 'BUSINESS') {
      navigate('/business');
    } else if (role === 'LGU') {
      navigate('/government');
    } else {
      navigate('/');
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-emerald-100 h-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 forest-gradient rounded-xl flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-500">
              <Compass size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-serif font-bold text-island-green tracking-tight italic">
              Isle<span className="not-italic text-island-emerald">GO</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
                
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    isActive ? 'text-island-green' : 'text-slate-400 hover:text-island-emerald'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="navUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-island-emerald rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* User & Role Controls */}
            <div className="flex items-center gap-5 ml-4 pl-4 border-l border-emerald-100">
              {user ? (
                <div className="flex items-center gap-5">
                  {/* Role Switcher */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                      className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-widest text-island-green transition-all border border-emerald-100"
                    >
                      <ShieldCheck size={14} className="text-island-emerald" strokeWidth={3} />
                      {currentRole}
                      <motion.div animate={{ rotate: isRoleMenuOpen ? 180 : 0 }}>
                        <Compass size={10} strokeWidth={4} className="opacity-60" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isRoleMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl p-2 z-50 ring-1 ring-emerald-100 border border-emerald-50"
                        >
                          <div className="px-4 py-2.5 mb-1 border-b border-emerald-50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Workspace</span>
                          </div>
                          {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleSwitch(role)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                currentRole === role ? 'emerald-gradient text-white shadow-lg' : 'text-slate-600 hover:bg-emerald-50'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Profile */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="relative group p-0.5 rounded-full ring-2 ring-emerald-100 hover:ring-island-emerald/50 transition-all"
                    >
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full object-cover shadow-md" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-island-emerald border-2 border-white rounded-full shadow-sm"></div>
                    </button>
                    
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(6,78,59,0.15)] p-6 z-50 ring-1 ring-emerald-100 border border-emerald-50"
                        >
                          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-emerald-50">
                            <img src={user.photoURL || ''} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" />
                            <div className="overflow-hidden">
                              <p className="text-sm font-black text-island-volcanic truncate">{user.displayName}</p>
                              <p className="text-[10px] text-slate-500 font-bold truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Link
                              to="/claim-business"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-island-green bg-emerald-50 hover:bg-emerald-100 transition-all"
                            >
                              <Building2 size={18} className="text-island-emerald" strokeWidth={2.5} />
                              Claim Business
                            </Link>
                            <button
                              onClick={() => { logout(); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-island-coral bg-rose-50/50 hover:bg-rose-50 transition-all"
                            >
                              <LogOut size={18} strokeWidth={2.5} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="btn-primary px-8 py-3.5 rounded-full"
                >
                  <LogIn size={16} strokeWidth={3} />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <button 
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="p-2.5 text-island-green bg-emerald-50 rounded-xl active:bg-emerald-100 transition-colors"
              >
                <ShieldCheck size={22} strokeWidth={2.5} />
              </button>
            )}
            <button className="p-2.5 text-island-green bg-emerald-50 rounded-xl active:bg-emerald-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={26} strokeWidth={3} /> : <Menu size={26} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-3xl border-b border-emerald-100 shadow-2xl z-40 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-12 space-y-2.5">
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);
                  
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-5 p-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                      isActive ? 'emerald-gradient text-white shadow-lg' : 'text-island-green bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-6 mt-6 border-t border-emerald-100 flex flex-col gap-4">
                {!user ? (
                  <button 
                    onClick={login}
                    className="btn-primary h-16 rounded-[1.75rem]"
                  >
                    <LogIn size={22} strokeWidth={3} />
                    Sign In
                  </button>
                ) : (
                  <button 
                    onClick={logout}
                    className="w-full h-16 flex items-center justify-center gap-4 rounded-[1.75rem] bg-rose-50 text-island-coral text-xs font-black uppercase tracking-[0.2em]"
                  >
                    <LogOut size={22} strokeWidth={3} />
                    Terminate Session
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Role Switcher (Overlaid) */}
      <AnimatePresence>
        {isRoleMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-3xl border-b border-emerald-100 shadow-2xl z-40 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-12 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 mb-4 text-center">Switch Operational Mode</p>
              {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center gap-5 p-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                    currentRole === role ? 'emerald-gradient text-white shadow-lg' : 'text-island-green bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldCheck size={22} strokeWidth={3} />
                  {role}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function AppRoutes({ role, setRole, isMobile }: { role: UserRole, setRole: (role: UserRole) => void, isMobile: boolean }) {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/mobile" element={
        <>
          <MobileHeader />
          <main className="pt-16 pb-24">
            <MobileAppView />
          </main>
          <MobileBottomNav />
        </>
      } />
      <Route path="*" element={
        <>
          {!isMobile ? (
            <Navigation currentRole={role} onRoleChange={setRole} />
          ) : (
            <MobileHeader />
          )}
          <main className={!isMobile ? "pt-20" : "pt-16 pb-24"}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<LandingView />} />
                  <Route path="/stay" element={<StayView />} />
                  <Route path="/transport" element={<TransportView />} />
                  <Route path="/pass" element={<TouristPassView />} />
                  <Route path="/my-bookings" element={<MyBookingsView />} />
                  <Route path="/business/*" element={<BusinessDashboard />} />
                  <Route path="/government/*" element={<GovernmentDashboard />} />
                  <Route path="/planner" element={<TripPlannerView />} />
                  <Route path="/claim-business" element={<ClaimBusinessView />} />
                  <Route path="/shops" element={<ShopsView />} />
                  <Route path="/locations" element={<LocationsView />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          {isMobile && <MobileBottomNav />}
        </>
      } />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Anonymous',
              role: 'TOURIST'
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            setRole('TOURIST');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.READ, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
        setRole('TOURIST');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleFirestoreError(error, OperationType.AUTH, 'google-signin');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      handleFirestoreError(error, OperationType.AUTH, 'signout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <Router>
        <RoleSwitcher currentRole={role} onRoleChange={setRole} />
        <div className="min-h-screen bg-island-cream font-sans text-island-green selection:bg-island-emerald/20">
          <AppRoutes role={role} setRole={setRole} isMobile={isMobile} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
