'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, Anvil, LogOut,
  LayoutDashboard, ClipboardList, Truck,
  ShoppingCart, Tag, CalendarRange, Package,
} from 'lucide-react';
import { logout } from '@/lib/client-api';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/commandes',          label: 'Commandes',        icon: ClipboardList },
  { href: '/produits',           label: 'Produits',         icon: Package },
  { href: '/historique-mensuel', label: 'Historique',       icon: CalendarRange },
  { href: '/vehicule',           label: 'Véhicule',         icon: Truck },
  { href: '/achats',             label: 'Achats',           icon: ShoppingCart },
  { href: '/categories',         label: 'Catégories',       icon: Tag },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    try { await logout(); } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
      {/* ── Top header bar (mobile + tablet only) ── */}
      <header
        className="lg:hidden flex items-center justify-between px-4 h-14 flex-shrink-0"
        style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(197,160,89,0.12)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C5A059, #A8863A)', boxShadow: '0 0 10px rgba(197,160,89,0.25)' }}
          >
            <Anvil size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <p className="font-bold text-sm tracking-wide" style={{ color: '#1E293B' }}>FORGE</p>
            <p className="text-xs tracking-wider" style={{ color: '#94A3B8' }}>ERP</p>
          </div>
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ backgroundColor: 'rgba(197,160,89,0.07)', border: '1px solid rgba(197,160,89,0.14)' }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} style={{ color: '#A8863A' }} strokeWidth={2} />
        </button>
      </header>

      {/* ── Animated drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(197,160,89,0.10)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #C5A059, #A8863A)', boxShadow: '0 0 12px rgba(197,160,89,0.3)' }}
                  >
                    <Anvil size={15} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-wide leading-none" style={{ color: '#1E293B' }}>FORGE</p>
                    <p className="text-xs tracking-wider mt-0.5" style={{ color: '#94A3B8' }}>ERP FERRONNIER</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-100"
                  aria-label="Fermer le menu"
                >
                  <X size={16} style={{ color: '#6B7280' }} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
                        style={{
                          color: isActive ? '#A8863A' : '#6B7280',
                          backgroundColor: isActive ? 'rgba(197,160,89,0.08)' : 'transparent',
                        }}
                      >
                        {isActive && (
                          <div
                            className="absolute left-0 w-0.5 h-5 rounded-r-full"
                            style={{ backgroundColor: '#C5A059' }}
                          />
                        )}
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          style={{ color: isActive ? '#C5A059' : undefined }}
                          className={!isActive ? 'group-hover:text-neutral-700 transition-colors' : ''}
                        />
                        <span className={!isActive ? 'group-hover:text-neutral-800 transition-colors' : ''}>
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="px-3 pb-6" style={{ borderTop: '1px solid rgba(197,160,89,0.10)', paddingTop: '12px' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
                  style={{ color: '#9CA3AF' }}
                >
                  <LogOut size={16} strokeWidth={1.8} className="group-hover:text-neutral-600 transition-colors" />
                  <span className="group-hover:text-neutral-600 transition-colors">Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
