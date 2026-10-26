'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  EmptyState,
  ErrorNote,
  Field,
  FormGrid,
  PageHeader,
  Panel,
  PrimaryButton,
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ui';
import { api, money } from '../../lib/api';
import type { Product, Purchase, Warehouse } from '../../lib/types';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form, setForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: '1',
    unitCost: '',
    supplierName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [purchaseRows, productRows, warehouseRows] = await Promise.all([
      api<Purchase[]>('/purchases'),
      api<Product[]>('/products'),
      api<Warehouse[]>('/warehouses'),
    ]);
    setPurchases(purchaseRows);
    setProducts(productRows);
    setWarehouses(warehouseRows);
  };

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  const onProductChange = (productId: string) => {
    const product = products.find((item) => String(item.id) === productId);
    setForm({
      ...form,
      productId,
      unitCost: product ? String(product.costPrice) : '',
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          productId: Number(form.productId),
          warehouseId: Number(form.warehouseId),
          quantity: Number(form.quantity),
          unitCost: Number(form.unitCost),
          supplierName: form.supplierName,
        }),
      });
      setForm({
        productId: '',
        warehouseId: form.warehouseId,
        quantity: '1',
        unitCost: '',
        supplierName: '',
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        subtitle="Receiving stock into a warehouse. Quantity is added immediately."
      />
      <ErrorNote message={error} />
      <Panel title="Record purchase">
        <FormGrid onSubmit={onSubmit}>
          <Field label="Product">
            <select
              className={inputClass}
              value={form.productId}
              onChange={(e) => onProductChange(e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Warehouse">
            <select
              className={inputClass}
              value={form.warehouseId}
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantity">
            <input
              className={inputClass}
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </Field>
          <Field label="Unit cost">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              required
            />
          </Field>
          <Field label="Supplier">
            <input
              className={inputClass}
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
            />
          </Field>
          <div className="flex items-end">
            <PrimaryButton disabled={saving}>Record purchase</PrimaryButton>
          </div>
        </FormGrid>
      </Panel>
      <Panel title="History">
        {purchases.length === 0 ? (
          <EmptyState>No purchases recorded.</EmptyState>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Product</Th>
                <Th>Warehouse</Th>
                <Th>Supplier</Th>
                <Th>Qty</Th>
                <Th>Total</Th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <Td>{new Date(purchase.createdAt).toLocaleString()}</Td>
                  <Td>{purchase.product?.name ?? purchase.id}</Td>
                  <Td>{purchase.warehouse?.name ?? '—'}</Td>
                  <Td>{purchase.supplierName || '—'}</Td>
                  <Td>{purchase.quantity}</Td>
                  <Td>{money(purchase.total)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </div>
  );
}
