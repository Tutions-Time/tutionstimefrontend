'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserById } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(id as string);
        if (res) {
          setUser(res);
        } else {
          toast({ title: 'User not found', variant: 'destructive' });
        }
      } catch (error: any) {
        toast({
          title: 'Failed to load user details',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={2}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar
        userRole="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="User Details"
          subtitle="Full profile information"
          greeting={false}
          actionPosition="left"
          action={
            <Link href="/admin/users">
              <Button variant="outline" size="icon" aria-label="Back to Users">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          }
        />

        <main className="p-6">
          <Card className="p-6 rounded-2xl bg-white shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-6 mb-6">
              {user.photoUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace(
                    '/api',
                    ''
                  )}/${user.photoUrl}`}
                  alt="User Photo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {user.name ? user.name.charAt(0) : user.role.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold">{user.name || 'N/A'}</h2>
                <p className="text-muted">{user.email || 'No email provided'}</p>
                <p className="text-sm text-muted mt-1">{user.phone || 'No phone'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted">Role</p>
                <p className="font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Status</p>
                <Badge
                  className={
                    user.status === 'active'
                      ? 'bg-success/10 text-success border-success/20 border'
                      : 'bg-danger/10 text-danger border-danger/20 border'
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Profile</p>
                <Badge
                  className={
                    user.isProfileComplete
                      ? 'bg-success/10 text-success border-success/20 border'
                      : 'bg-danger/10 text-danger border-danger/20 border'
                  }
                >
                  {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Created At</p>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Last Login</p>
                <p className="font-semibold">
                  {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>

            {user.role === 'tutor' && user.tutorProfile && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Tutor Profile</h3>
                <p><strong>Qualification:</strong> {user.tutorProfile.qualification}</p>
                <p><strong>Experience:</strong> {user.tutorProfile.experience}</p>
                <p><strong>Subjects:</strong> {user.tutorProfile.subjects?.join(', ')}</p>
                <p><strong>Bio:</strong> {user.tutorProfile.bio}</p>
              </div>
            )}

            {user.role === 'student' && user.studentProfile && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Student Profile</h3>
                <p><strong>Class Level:</strong> {user.studentProfile.classLevel}</p>
                <p><strong>Subjects:</strong> {user.studentProfile.subjects?.join(', ')}</p>
                <p><strong>Goals:</strong> {user.studentProfile.goals}</p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
