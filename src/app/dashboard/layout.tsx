'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Warehouse },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          flexShrink: 0,
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--color-violet), var(--color-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              }}
            >
              <Zap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
                Urbano
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Commerce Engine
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-violet-glow)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                  color: isActive ? 'var(--color-violet-light)' : 'var(--color-text-secondary)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <item.icon size={18} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    style={{
                      position: 'absolute',
                      right: 12,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--color-text-muted)',
              fontSize: 14,
              cursor: 'pointer',
              width: '100%',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-rose)';
              e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: '32px 40px',
          minHeight: '100vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
