'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SupportChat } from './SupportChat';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/warehouses', label: 'Warehouses' },
  { href: '/purchases', label: 'Purchases' },
  { href: '/sales', label: 'Sales' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-full max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <p className="mb-6 text-sm font-bold tracking-tight text-slate-900">
            Stock Manager
          </p>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <p className="mb-2 text-sm font-bold">Stock Manager</p>
            <nav className="flex flex-wrap gap-2">
              {NAV.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
      <SupportChat />
    </div>
  );
}
