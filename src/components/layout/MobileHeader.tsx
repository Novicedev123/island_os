import { Link, useLocation } from 'react-router-dom';
import { Compass, Bell, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export function MobileHeader() {
  const { user, profile } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    if (profile && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { ...profile, role }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    setIsRoleMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 h-16 flex items-center justify-between px-6 md:hidden">
        <Link to="/mobile?tab=explore" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Catarman eLaag Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
          <span className="text-xl font-display font-bold text-island-dark tracking-tight">
            Catarman <span className="text-island-secondary">eLaag</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <button 
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="p-2 text-island-emerald bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
            >
              <ShieldCheck size={20} />
            </button>
          )}
          <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
          </button>
          <Link to="/mobile?tab=profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-island-emerald/20">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                <UserIcon size={16} />
              </div>
            )}
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {isRoleMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoleMenuOpen(false)}
              className="absolute inset-0 bg-island-volcanic/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-20 left-6 right-6 bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Access Node Level</p>
              <div className="space-y-3">
                {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                      profile?.role === role 
                        ? 'bg-island-emerald text-white shadow-lg shadow-island-emerald/20' 
                        : 'bg-slate-50 text-slate-500 active:bg-slate-100'
                    }`}
                  >
                    {role}
                    {profile?.role === role && <CheckCircle2 size={18} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function CheckCircle2({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
