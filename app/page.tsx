'use client';

import { useEffect, useState } from 'react';
import { EmptyState, ErrorNote, PageHeader, Panel, TableWrap, Td, Th } from '../components/ui';
import { api, money } from '../lib/api';
import type { DashboardSummary } from '../lib/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardSummary>('/dashboard')
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const stats = data
    ? [
        { label: 'Products', value: String(data.productCount) },
        { label: 'Warehouses', value: String(data.warehouseCount) },
        { label: 'Units on hand', value: String(data.unitsOnHand) },
        { label: 'Low stock', value: String(data.lowStockCount) },
        { label: 'Sales', value: money(data.salesTotal) },
        { label: 'Purchases', value: money(data.purchaseTotal) },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Stock, sales, and purchases at a glance."
      />
      <ErrorNote message={error} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Panel key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </Panel>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Low stock">
          {!data || data.lowStock.length === 0 ? (
            <EmptyState>No low-stock items. Buy into a warehouse to get started.</EmptyState>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Warehouse</Th>
                  <Th>Qty</Th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((row) => (
                  <tr key={row.id}>
                    <Td>{row.product?.name ?? row.productId}</Td>
                    <Td>{row.warehouse?.name ?? row.warehouseId}</Td>
                    <Td>{row.quantity}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
        <Panel title="Recent sales">
          {!data || data.recentSales.length === 0 ? (
            <EmptyState>No sales yet.</EmptyState>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((row) => (
                  <tr key={row.id}>
                    <Td>{row.product?.name ?? row.id}</Td>
                    <Td>{row.quantity}</Td>
                    <Td>{money(row.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
        <Panel title="Recent purchases">
          {!data || data.recentPurchases.length === 0 ? (
            <EmptyState>No purchases yet.</EmptyState>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentPurchases.map((row) => (
                  <tr key={row.id}>
                    <Td>{row.product?.name ?? row.id}</Td>
                    <Td>{row.quantity}</Td>
                    <Td>{money(row.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>
    </div>
  );
}
