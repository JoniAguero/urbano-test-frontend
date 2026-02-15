'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Warehouse, Activity, Zap } from 'lucide-react';
import { catalogApi, inventoryApi } from '@/lib/api';
import { StatCardSkeleton } from '@/components/Skeleton';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardOverview() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: catalogApi.getAll,
  });

  const { data: inventory, isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
  });

  const totalStock =
    inventory?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const activeItems = inventory?.filter((item) => item.quantity > 0).length ?? 0;

  const stats = [
    {
      label: 'Total Products',
      value: products?.length ?? 0,
      icon: Package,
      color: 'var(--color-violet)',
      bg: 'var(--color-violet-glow)',
    },
    {
      label: 'Inventory Records',
      value: inventory?.length ?? 0,
      icon: Warehouse,
      color: 'var(--color-cyan)',
      bg: 'var(--color-cyan-glow)',
    },
    {
      label: 'Total Stock Units',
      value: totalStock,
      icon: Activity,
      color: 'var(--color-emerald)',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'Active Stock Items',
      value: activeItems,
      icon: Zap,
      color: 'var(--color-amber)',
      bg: 'rgba(245,158,11,0.12)',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time overview of your e-commerce platform
          </p>
        </div>
      </div>

      {loadingProducts || loadingInventory ? (
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="stats-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="stat-card">
              <div
                className="stat-card-icon"
                style={{ background: stat.bg }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Architecture Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
        style={{
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)',
          border: '1px solid rgba(124,58,237,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-violet), var(--color-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: '-0.01em',
              }}
            >
              Event-Driven Architecture
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              This platform demonstrates a decoupled Hexagonal Architecture.
              When you create a product in the <strong>Catalog</strong> module, a{' '}
              <span
                style={{
                  color: 'var(--color-violet-light)',
                  fontFamily: 'monospace',
                  fontSize: 13,
                }}
              >
                ProductCreatedEvent
              </span>{' '}
              is emitted and the <strong>Inventory</strong> module reacts
              asynchronously, initializing stock with 0 units. Watch it happen
              in real-time on the Inventory page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
