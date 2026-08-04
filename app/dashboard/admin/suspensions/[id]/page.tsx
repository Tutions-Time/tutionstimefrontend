'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { getAdminSuspensionAppeal } from '@/services/adminService';
import { Topbar } from '@/components/layout/Topbar';

type Appeal = {
  _id: string;
  role: string;
  reason: string;
  explanation?: string;
  userReply?: string;
  repliedAt?: string;
  status: string;
  createdAt: string;
  userId: string;
};

export default function AdminSuspensionPage() {
  const params = useParams();
  const id = String(params.id || '');
  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getAdminSuspensionAppeal(id)
      .then((data) => alive && setAppeal(data))
      .catch((err) => alive && setError(err.message || 'Failed to load suspension case'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Suspension Reply" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-full bg-amber-50 p-2 text-amber-700"><MessageSquare className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Suspension case</h1>
              <p className="text-sm text-gray-600">View the admin reason and the user reply.</p>
            </div>
          </div>

          {loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
          {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          {appeal ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-md border bg-gray-50 p-4 text-sm md:grid-cols-3">
                <div><div className="text-gray-500">Role</div><div className="font-medium capitalize">{appeal.role}</div></div>
                <div><div className="text-gray-500">Status</div><div className="font-medium capitalize">{appeal.status}</div></div>
                <div><div className="text-gray-500">User ID</div><div className="font-mono text-xs">{appeal.userId}</div></div>
              </div>

              <div className="rounded-md border p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900"><AlertTriangle className="h-4 w-4 text-red-600" /> Admin message</div>
                <div className="text-sm"><span className="font-medium">Reason:</span> {appeal.reason}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{appeal.explanation || 'No additional explanation provided.'}</div>
              </div>

              <div className="rounded-md border p-4">
                <div className="mb-2 font-semibold text-gray-900">User reply</div>
                {appeal.userReply ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-800">{appeal.userReply}</div>
                ) : (
                  <div className="text-sm text-gray-500">No reply received yet.</div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

