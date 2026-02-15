'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse,
  RefreshCw,
  Edit3,
  Check,
  X,
  Radio,
} from 'lucide-react';
import { inventoryApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { TableSkeleton } from '@/components/Skeleton';
import type { InventoryItem } from '@/lib/types';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const prevCountRef = useRef<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');

  const { data: inventory, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
    refetchInterval: 2000,
  });

  // Detect new inventory items appearing (from event-driven initialization)
  useEffect(() => {
    if (!inventory) return;
    const currentCount = inventory.length;
    if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
      const newItems = currentCount - prevCountRef.current;
      addToast({
        type: 'success',
        title: 'Stock Initialized!',
        message: `${newItems} new inventory record${newItems > 1 ? 's' : ''} appeared — event-driven sync complete.`,
        duration: 5000,
      });
    }
    prevCountRef.current = currentCount;
  }, [inventory, addToast]);

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      inventoryApi.updateStock(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setEditingId(null);
      addToast({ type: 'success', title: 'Stock updated' });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    },
  });

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditQty(String(item.quantity));
  }

  function saveEdit(id: number) {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty) || qty < 0) {
      addToast({ type: 'error', title: 'Invalid quantity' });
      return;
    }
    updateMutation.mutate({ id, quantity: qty });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQty('');
  }

  const timeSinceUpdate = dataUpdatedAt
    ? `Last sync: ${new Date(dataUpdatedAt).toLocaleTimeString()}`
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Monitor</h1>
          <p className="page-subtitle">
            Real-time inventory tracking — auto-refreshes every 2 seconds
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Live indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-emerald)',
            }}
          >
            <Radio size={14} style={{ animation: 'processingPulse 1.2s ease-in-out infinite' }} />
            LIVE
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {timeSinceUpdate}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['inventory'] })}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : !inventory || inventory.length === 0 ? (
        <div className="card empty-state">
          <Warehouse size={48} />
          <h3>No inventory records</h3>
          <p>
            Create a product in the Products page. The inventory will appear
            here automatically through the event-driven system.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Variation</th>
                <th>Product</th>
                <th>Country</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {inventory.map((item, index) => {
                  const isNew =
                    Date.now() - new Date(item.createdAt).getTime() < 10000;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -30, backgroundColor: 'rgba(124,58,237,0.08)' }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        backgroundColor: 'transparent',
                      }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                        backgroundColor: { duration: 2, delay: 0.5 },
                      }}
                    >
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        #{item.id}
                      </td>
                      <td>
                        <span className="badge badge-info">
                          Var #{item.productVariationId}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {item.productVariation?.product?.title || `Product →  Var #${item.productVariationId}`}
                      </td>
                      <td>
                        <span className="badge badge-violet">{item.countryCode}</span>
                      </td>
                      <td>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            className="input"
                            style={{ width: 80, padding: '6px 10px', fontSize: 14 }}
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(item.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            min={0}
                          />
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              fontSize: 15,
                              color:
                                item.quantity === 0
                                  ? 'var(--color-amber)'
                                  : 'var(--color-emerald)',
                            }}
                          >
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td>
                        {isNew ? (
                          <span className="badge badge-warning">
                            <span className="processing-dot" />
                            Just Synced
                          </span>
                        ) : item.quantity === 0 ? (
                          <span className="badge badge-warning">
                            Awaiting Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {editingId === item.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-primary btn-icon btn-sm"
                              onClick={() => saveEdit(item.id)}
                              disabled={updateMutation.isPending}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={cancelEdit}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => startEdit(item)}
                            title="Edit stock"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
