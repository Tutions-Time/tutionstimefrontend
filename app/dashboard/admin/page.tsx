'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage users, tutors, and platform settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <p className="text-3xl font-bold">123</p>
            <p className="text-sm text-gray-500 mt-1">Total registered users</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Tutors</h3>
            <p className="text-3xl font-bold">45</p>
            <p className="text-sm text-gray-500 mt-1">Active tutors</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Bookings</h3>
            <p className="text-3xl font-bold">67</p>
            <p className="text-sm text-gray-500 mt-1">Total bookings today</p>
          </Card>
        </div>

        {/* Add more admin dashboard content here */}
      </div>
    </ProtectedRoute>
  );
}