'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Package,
  X,
  Tag,
  FileText,
  Hash,
  Layers,
} from 'lucide-react';
import { catalogApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { TableSkeleton } from '@/components/Skeleton';
import type { CreateProductRequest } from '@/lib/types';

const categories = [
  { id: 1, name: 'Computers' },
  { id: 2, name: 'Fashion' },
];

const variationTypes = ['NONE', 'OnlySize', 'OnlyColor', 'SizeAndColor'];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: catalogApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: catalogApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast({ type: 'success', title: 'Product deleted' });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            Manage your product catalog. New products trigger automatic inventory initialization.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          New Product
        </button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : !products || products.length === 0 ? (
        <div className="card empty-state">
          <Package size={48} />
          <h3>No products yet</h3>
          <p>Create your first product to see the event-driven inventory system in action.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Code</th>
                <th>Category</th>
                <th>Variation</th>
                <th>Created</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {products.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                      #{product.id}
                    </td>
                    <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                      {product.title}
                    </td>
                    <td>
                      <span className="badge badge-violet">{product.code}</span>
                    </td>
                    <td>
                      {categories.find((c) => c.id === product.categoryId)?.name || `Cat ${product.categoryId}`}
                    </td>
                    <td style={{ fontSize: 13 }}>{product.variationType || 'NONE'}</td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => {
                          if (confirm('Delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Create Product Modal */}
      <AnimatePresence>
        {showForm && (
          <CreateProductModal
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['products'] });
              queryClient.invalidateQueries({ queryKey: ['inventory'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Product Modal ───────────────────────────────
function CreateProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addToast } = useToast();
  const [form, setForm] = useState<CreateProductRequest>({
    title: '',
    code: '',
    description: '',
    variationType: 'NONE',
    categoryId: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.code.trim()) errs.code = 'Code is required';
    if (!form.categoryId) errs.categoryId = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const product = await catalogApi.create(form);
      addToast({
        type: 'success',
        title: 'Product Created!',
        message: `"${product.title}" has been added. Inventory is being initialized asynchronously...`,
        duration: 5000,
      });
      addToast({
        type: 'info',
        title: 'Event Dispatched',
        message: 'ProductCreatedEvent → Inventory module will react automatically.',
        duration: 6000,
      });
      onSuccess();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create Product</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="title">
                  <Tag size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Title *
                </label>
                <input
                  id="title"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="MacBook Pro"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  autoFocus
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>
              <div className="form-group">
                <label className="label" htmlFor="code">
                  <Hash size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Code *
                </label>
                <input
                  id="code"
                  className={`input ${errors.code ? 'input-error' : ''}`}
                  placeholder="MBP-2024"
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                />
                {errors.code && <p className="form-error">{errors.code}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="description">
                <FileText size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Description
              </label>
              <textarea
                id="description"
                className="input"
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Product description (optional)"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="categoryId">
                  Category *
                </label>
                <select
                  id="categoryId"
                  className="select"
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', Number(e.target.value))}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="variationType">
                  <Layers size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Variation Type
                </label>
                <select
                  id="variationType"
                  className="select"
                  value={form.variationType}
                  onChange={(e) => updateField('variationType', e.target.value)}
                >
                  {variationTypes.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <Plus size={18} />
                  Create Product
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
