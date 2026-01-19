'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Users, User, Wallet, Calendar, TrendingUp, TrendingDown, Search, ShieldCheck, RotateCcw, Layers
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; 

type Trend = 'up' | 'down' | 'flat';

import { getDashboardStats, getDashboardActivity } from '@/services/adminService';

const kpisDefault = [
  { label: 'Total Users', value: '0', icon: Users, tone: 'primary' as const, delta: '0%', trend: 'flat' as Trend },
  { label: 'Active Tutors', value: '0', icon: User, tone: 'success' as const, delta: '0%', trend: 'flat' as Trend },
  { label: 'Monthly Revenue', value: '₹0', icon: Wallet, tone: 'primary' as const, delta: '0%', trend: 'flat' as Trend },
  { label: 'Sessions (7d)', value: '0', icon: Calendar, tone: 'warning' as const, delta: '0%', trend: 'flat' as Trend },
];

type ActivityEvent = {
  id: string;
  type: 'signup' | 'payment' | 'payout' | 'kyc' | 'refund' | 'session' | 'batch';
  name: string;
  role?: string;
  at: string;
};

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

function AdminDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kpiCards, setKpiCards] = useState(kpisDefault);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let mounted = true;
    getDashboardStats().then((stats) => {
      if (!mounted || !stats) return;
      const totalUsers = String(stats?.users?.total || 0);
      const activeTutors = String(stats?.users?.tutors || 0);
      const monthlyRevenue = (stats?.payments?.subscriptions?.totalAmount || 0) + (stats?.payments?.notes?.totalAmount || 0);
      const sessions7d = String(stats?.sessions?.upcoming7d || 0);
      const cards = [
        { label: 'Total Users', value: totalUsers, icon: Users, tone: 'primary' as const, delta: ' ', trend: 'flat' as Trend },
        { label: 'Active Tutors', value: activeTutors, icon: User, tone: 'success' as const, delta: ' ', trend: 'flat' as Trend },
        { label: 'Monthly Revenue', value: `₹${monthlyRevenue}`, icon: Wallet, tone: 'primary' as const, delta: ' ', trend: 'flat' as Trend },
        { label: 'Sessions (7d)', value: sessions7d, icon: Calendar, tone: 'warning' as const, delta: ' ', trend: 'flat' as Trend },
      ];
      setKpiCards(cards);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    getDashboardActivity(6)
      .then((events) => {
        if (!mounted) return;
        setRecentEvents(events);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={5}
        userRole="admin"
        userName="Admin"
      />

      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Analytics Overview"
          subtitle="Key platform metrics and recent activity"
          greeting
         
        />

        {/* MAIN CONTENT */}
        <main className="p-4 lg:p-6 space-y-6">
          {/* KPIs */}
          <div className="grid md:grid-cols-4 gap-4">
            {kpiCards.map((k) => {
              const Icon = k.icon;
              const toneClass =
                k.tone === 'success'
                  ? 'text-success bg-success/10'
                  : k.tone === 'warning'
                  ? 'text-warning bg-warning/10'
                  : 'text-primary bg-primary/10';

              return (
                <Card key={k.label} className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${toneClass} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">{k.value}</p>
                      <p className="text-sm text-muted">{k.label}</p>
                    </div>
                  </div>
                  {/* <div className="mt-4 flex items-center gap-2 text-sm">
                    {k.trend === 'up' ? (
                      <span className="inline-flex items-center text-success">
                        <TrendingUp className="w-4 h-4 mr-1" /> {k.delta}
                      </span>
                    ) : k.trend === 'down' ? (
                      <span className="inline-flex items-center text-danger">
                        <TrendingDown className="w-4 h-4 mr-1" /> {k.delta}
                      </span>
                    ) : (
                      <span className="text-muted">No change</span>
                    )}
                    <span className="text-muted">vs last 30 days</span>
                  </div> */}
                </Card>
              );
            })}
          </div>

          {/* Activity & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">Recent Activity</h2>
                <Link href="/dashboard/admin/users">
                  <Button variant="ghost" size="sm">View Users</Button>
                </Link>
              </div>

              {recentEvents.length === 0 && (
                <Card className="p-6 rounded-2xl shadow-soft bg-white">
                  <p className="text-sm text-muted">No recent activity yet.</p>
                </Card>
              )}

              {recentEvents.map((ev) => (
                <Card key={ev.id} className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {ev.type === 'signup' && <Users className="w-5 h-5 text-primary" />}
                        {(ev.type === 'payment' || ev.type === 'payout') && <Wallet className="w-5 h-5 text-primary" />}
                        {ev.type === 'kyc' && <ShieldCheck className="w-5 h-5 text-primary" />}
                        {ev.type === 'refund' && <RotateCcw className="w-5 h-5 text-primary" />}
                        {ev.type === 'session' && <Calendar className="w-5 h-5 text-primary" />}
                        {ev.type === 'batch' && <Layers className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{ev.name}</p>
                        <p className="text-sm text-muted capitalize">{ev.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {formatRelativeTime(ev.at)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-text">Quick Actions</h2>

              <Card className="p-6 rounded-2xl shadow-soft bg-gradient-to-br from-primary/10 to-primaryWeak hover:shadow-lg transition-base">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-text mb-2">Revenue Report</h3>
                <p className="text-sm text-muted mb-4">
                  Export month-wise earnings and payouts
                </p>
                <Link href="/dashboard/admin/revenue">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-text">
                    Go to Revenue
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                <Users className="w-10 h-10 text-success mb-4" />
                <h3 className="font-semibold text-text mb-2">Manage Tutors</h3>
                <p className="text-sm text-muted mb-4">
                  Approve KYC and monitor performance
                </p>
                <Link href="/dashboard/admin/tutors">
                  <Button variant="outline" className="w-full">
                    Open Tutors
                  </Button>
                </Link>
              </Card>

              {/* <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                <User className="w-10 h-10 text-warning mb-4" />
                <h3 className="font-semibold text-text mb-2">Subjects & Pricing</h3>
                <p className="text-sm text-muted mb-4">
                  Update catalog, subjects and rates
                </p>
                <Link href="/dashboard/admin/subjects">
                  <Button variant="outline" className="w-full">
                    Edit Subjects
                  </Button>
                </Link>
              </Card> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
