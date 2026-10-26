'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  EmptyState,
  ErrorNote,
  Field,
  FormGrid,
  GhostButton,
  PageHeader,
  Panel,
  PrimaryButton,
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ui';
import { api, money } from '../../lib/api';
import type { Product } from '../../lib/types';

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  unitPrice: '',
  costPrice: '',
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api<Product[]>('/products')
      .then(setItems)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      sku: form.sku,
      name: form.name,
      description: form.description,
      unitPrice: Number(form.unitPrice || 0),
      costPrice: Number(form.costPrice || 0),
    };
    try {
      if (editingId) {
        await api(`/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description,
      unitPrice: String(product.unitPrice),
      costPrice: String(product.costPrice),
    });
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Catalog items. Stock stays at zero until you record a purchase."
      />
      <ErrorNote message={error} />
      <Panel title={editingId ? 'Edit product' : 'New product'}>
        <FormGrid onSubmit={onSubmit}>
          <Field label="SKU">
            <input
              className={inputClass}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </Field>
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Description">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Selling price">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            />
          </Field>
          <Field label="Cost price">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <PrimaryButton disabled={saving}>
              {editingId ? 'Save changes' : 'Add product'}
            </PrimaryButton>
            {editingId ? (
              <GhostButton
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </GhostButton>
            ) : null}
          </div>
        </FormGrid>
      </Panel>
      <Panel title="Catalog">
        {items.length === 0 ? (
          <EmptyState>No products yet.</EmptyState>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>SKU</Th>
                <Th>Name</Th>
                <Th>Sell</Th>
                <Th>Cost</Th>
                <Th>On hand</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id}>
                  <Td>{product.sku}</Td>
                  <Td>
                    <div>{product.name}</div>
                    {product.description ? (
                      <div className="text-xs text-slate-500">{product.description}</div>
                    ) : null}
                  </Td>
                  <Td>{money(product.unitPrice)}</Td>
                  <Td>{money(product.costPrice)}</Td>
                  <Td>{product.totalQuantity ?? 0}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <GhostButton onClick={() => startEdit(product)}>Edit</GhostButton>
                      <GhostButton onClick={() => remove(product.id)}>Delete</GhostButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </div>
  );
}
