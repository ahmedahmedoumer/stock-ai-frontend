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
import type { Product, Sale, Warehouse } from '../../lib/types';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form, setForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: '1',
    unitPrice: '',
    customerName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [saleRows, productRows, warehouseRows] = await Promise.all([
      api<Sale[]>('/sales'),
      api<Product[]>('/products'),
      api<Warehouse[]>('/warehouses'),
    ]);
    setSales(saleRows);
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
      unitPrice: product ? String(product.unitPrice) : '',
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api('/sales', {
        method: 'POST',
        body: JSON.stringify({
          productId: Number(form.productId),
          warehouseId: Number(form.warehouseId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          customerName: form.customerName,
        }),
      });
      setForm({
        productId: '',
        warehouseId: form.warehouseId,
        quantity: '1',
        unitPrice: '',
        customerName: '',
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
        title="Sales"
        subtitle="Shipping stock out of a warehouse. Quantity is deducted immediately."
      />
      <ErrorNote message={error} />
      <Panel title="Record sale">
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
                  {product.name} ({product.totalQuantity ?? 0} on hand)
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
          <Field label="Unit price">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
            />
          </Field>
          <Field label="Customer">
            <input
              className={inputClass}
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </Field>
          <div className="flex items-end">
            <PrimaryButton disabled={saving}>Record sale</PrimaryButton>
          </div>
        </FormGrid>
      </Panel>
      <Panel title="History">
        {sales.length === 0 ? (
          <EmptyState>No sales recorded.</EmptyState>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Product</Th>
                <Th>Warehouse</Th>
                <Th>Customer</Th>
                <Th>Qty</Th>
                <Th>Total</Th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <Td>{new Date(sale.createdAt).toLocaleString()}</Td>
                  <Td>{sale.product?.name ?? sale.id}</Td>
                  <Td>{sale.warehouse?.name ?? '—'}</Td>
                  <Td>{sale.customerName || '—'}</Td>
                  <Td>{sale.quantity}</Td>
                  <Td>{money(sale.total)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </div>
  );
}
