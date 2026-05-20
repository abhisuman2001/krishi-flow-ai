'use client';

import { useState } from 'react';
import {
  Settings,
  X,
  Save,
  Loader2,
  User,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun,
  Bell,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'preferences' | 'security';

export default function SettingsPanel() {
  const { officer, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form state
  const [name, setName] = useState(officer?.name ?? '');
  const [phone, setPhone] = useState(officer?.phone ?? '');
  const [department, setDepartment] = useState(officer?.department ?? '');
  const [district, setDistrict] = useState(officer?.district ?? '');

  // Preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const openPanel = () => {
    // Sync form with current officer data each time panel opens
    setName(officer?.name ?? '');
    setPhone(officer?.phone ?? '');
    setDepartment(officer?.department ?? '');
    setDistrict(officer?.district ?? '');
    setSaveStatus('idle');
    setOpen(true);
  };

  const saveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, department, district }),
      });
      const data = await res.json();
      if (data.officer) {
        updateProfile(data.officer);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Panel */}
      {open && (
        <div className="fixed right-4 top-20 z-50 w-[420px] max-h-[600px] flex flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-white">Settings</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2',
                    tab === t.id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* ── Profile tab ── */}
            {tab === 'profile' && (
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {officer?.initials ?? 'AO'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{officer?.name ?? 'Officer'}</p>
                    <p className="text-xs text-slate-400">{officer?.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Member since {officer?.joinedAt ? new Date(officer.joinedAt).getFullYear() : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Department
                  </label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Plant Protection" />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> District
                  </label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Nashik" />
                </div>

                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Profile updated successfully
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to save. Please try again.
                  </div>
                )}

                <Button
                  variant="gradient"
                  className="w-full gap-2"
                  onClick={saveProfile}
                  disabled={saving || !name.trim()}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}

            {/* ── Preferences tab ── */}
            {tab === 'preferences' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-2">Notification & display preferences</p>

                {[
                  {
                    label: 'Email Notifications',
                    desc: 'Receive ticket updates via email',
                    value: emailNotifs,
                    set: setEmailNotifs,
                    icon: Bell,
                  },
                  {
                    label: 'Critical Alerts',
                    desc: 'Instant alerts for critical severity tickets',
                    value: criticalAlerts,
                    set: setCriticalAlerts,
                    icon: AlertTriangle,
                  },
                  {
                    label: 'Weekly Report',
                    desc: 'Receive weekly analytics summary',
                    value: weeklyReport,
                    set: setWeeklyReport,
                    icon: Shield,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => item.set((v) => !v)}
                        className={cn(
                          'relative w-10 h-5 rounded-full transition-colors shrink-0',
                          item.value ? 'bg-green-600' : 'bg-slate-700'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                            item.value ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>
                  );
                })}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Sun className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Appearance</p>
                      <p className="text-xs text-slate-500">Currently using dark mode</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 border border-white/10 text-xs text-white font-medium">
                      <Moon className="w-3.5 h-3.5" /> Dark
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                      <Sun className="w-3.5 h-3.5" /> Light
                    </button>
                  </div>
                </div>

                <Button variant="gradient" className="w-full gap-2" onClick={() => setSaveStatus('success')}>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            )}

            {/* ── Security tab ── */}
            {tab === 'security' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-2">Account security settings</p>

                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Account Secured</span>
                  </div>
                  <p className="text-xs text-slate-400">Your account is protected with a strong password.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Confirm New Password</label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                </div>

                <Button variant="gradient" className="w-full gap-2">
                  <Shield className="w-4 h-4" />
                  Update Password
                </Button>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-white mb-1">Active Sessions</p>
                  <p className="text-xs text-slate-500 mb-3">You are currently signed in on this device.</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300">Current browser</p>
                      <p className="text-xs text-slate-600">Last active: just now</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
