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
import { api } from '../../lib/api';
import type { Warehouse } from '../../lib/types';

const emptyForm = { name: '', location: '' };

export default function WarehousesPage() {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api<Warehouse[]>('/warehouses')
      .then(setItems)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await api(`/warehouses/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await api('/warehouses', { method: 'POST', body: JSON.stringify(form) });
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

  const remove = async (id: number) => {
    setError(null);
    try {
      await api(`/warehouses/${id}`, { method: 'DELETE' });
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
        title="Warehouses"
        subtitle="Locations that hold product stock."
      />
      <ErrorNote message={error} />
      <Panel title={editingId ? 'Edit warehouse' : 'New warehouse'}>
        <FormGrid onSubmit={onSubmit}>
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Location">
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <PrimaryButton disabled={saving}>
              {editingId ? 'Save changes' : 'Add warehouse'}
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
      <Panel title="Locations">
        {items.length === 0 ? (
          <EmptyState>No warehouses yet.</EmptyState>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Location</Th>
                <Th>Units</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((warehouse) => (
                <tr key={warehouse.id}>
                  <Td>{warehouse.name}</Td>
                  <Td>{warehouse.location || '—'}</Td>
                  <Td>{warehouse.totalQuantity ?? 0}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <GhostButton
                        onClick={() => {
                          setEditingId(warehouse.id);
                          setForm({
                            name: warehouse.name,
                            location: warehouse.location,
                          });
                        }}
                      >
                        Edit
                      </GhostButton>
                      <GhostButton onClick={() => remove(warehouse.id)}>Delete</GhostButton>
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
