'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '@/lib/client-api';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  ShoppingCart,
  Tag,
  CalendarRange,
  Package,
  LogOut,
  Anvil,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard',          label: 'Tableau de bord',   icon: LayoutDashboard },
  { href: '/admin/commandes',          label: 'Commandes',          icon: ClipboardList },
  { href: '/admin/produits',           label: 'Produits',           icon: Package },
  { href: '/admin/historique-mensuel', label: 'Historique',         icon: CalendarRange },
  { href: '/admin/vehicule',           label: 'Véhicule',           icon: Truck },
  { href: '/admin/achats',             label: 'Achats',             icon: ShoppingCart },
  { href: '/admin/categories',         label: 'Catégories',         icon: Tag },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await logout(); } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside
      className="hidden lg:flex lg:flex-col w-60 flex-shrink-0 relative"
      style={{ backgroundColor: '#FFFFFF', boxShadow: '2px 0 12px rgba(0,0,0,0.06)', zIndex: 9999 }}
    >
      {/* Right gradient border */}
      <div
        className="absolute inset-y-0 right-0 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.18) 30%, rgba(197,160,89,0.10) 70%, transparent)' }}
      />

      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(197,160,89,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C5A059, #A8863A)', boxShadow: '0 0 12px rgba(197,160,89,0.3)' }}
          >
            <Anvil size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-brand text-sm font-bold tracking-wide leading-none" style={{ color: '#1E293B' }}>
              FORGE
            </p>
            <p className="text-xs mt-0.5 tracking-wider" style={{ color: '#94A3B8' }}>ERP FERRONNIER</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || pathname.startsWith(`${item.href}?`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{
                color: isActive ? '#A8863A' : '#6B7280',
                backgroundColor: isActive ? 'rgba(197,160,89,0.08)' : 'transparent',
              }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 inset-y-0 w-0.5 rounded-r-full"
                    style={{ backgroundColor: '#C5A059', boxShadow: '0 0 8px rgba(197,160,89,0.5)' }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>
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
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t" style={{ borderColor: 'rgba(197,160,89,0.10)', paddingTop: '12px' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          style={{ color: '#9CA3AF' }}
        >
          <LogOut size={16} strokeWidth={1.8} className="group-hover:text-danger transition-colors" />
          <span className="group-hover:text-neutral-600 transition-colors">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
