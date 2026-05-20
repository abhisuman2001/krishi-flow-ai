'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  User,
  LayoutDashboard,
  Ticket,
  BarChart3,
  ChevronDown,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function ProfileDropdown() {
  const { officer, logout, isLoading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setOpen(false);
    router.push('/login');
  };

  // Not logged in — show login button
  if (!isLoading && !officer) {
    return (
      <Link
        href="/login"
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
      >
        <User className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
        <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
        <div className="hidden md:block space-y-1">
          <div className="w-20 h-2.5 rounded bg-slate-700 animate-pulse" />
          <div className="w-14 h-2 rounded bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tickets', icon: Ticket, label: 'My Tickets' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-white/10 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {officer?.initials ?? 'AO'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-medium text-white leading-tight">{officer?.name ?? 'Officer'}</p>
          <p className="text-xs text-slate-500 leading-tight">{officer?.district}, {officer?.state}</p>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform hidden md:block', open && 'rotate-180')} />
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Officer card */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-br from-green-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                {officer?.initials ?? 'AO'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-white text-sm truncate">{officer?.name}</p>
                  <BadgeCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-400 truncate">{officer?.email}</p>
                <span className={cn('inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium', getRoleBadgeColor(officer!.role))}>
                  {getRoleLabel(officer!.role)}
                </span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-slate-500">Department</p>
                <p className="text-white font-medium truncate">{officer?.department}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-slate-500">District</p>
                <p className="text-white font-medium">{officer?.district}</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
