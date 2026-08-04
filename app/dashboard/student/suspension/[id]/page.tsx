'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSuspensionAppeal, replyToSuspensionAppeal } from '@/services/notificationService';
import { Topbar } from '@/components/layout/Topbar';

type Appeal = {
  _id: string;
  reason: string;
  explanation?: string;
  userReply?: string;
  repliedAt?: string;
  status: string;
  createdAt: string;
};

export default function SuspensionReplyPage() {
  const params = useParams();
  const id = String(params.id || '');
  const { toast } = useToast();
  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    getSuspensionAppeal(id)
      .then((data) => {
        if (!alive) return;
        setAppeal(data);
        setReply(data?.userReply || '');
      })
      .catch((error) => toast({ title: 'Unable to load suspension notice', description: error.message, variant: 'destructive' }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, toast]);

  const submit = async () => {
    const clean = reply.trim();
    if (clean.length < 10) {
      toast({ title: 'Reply is too short', description: 'Please explain your side in at least 10 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await replyToSuspensionAppeal(id, clean);
      setAppeal(res.data);
      toast({ title: 'Reply sent', description: res.message || 'Admin has been notified.' });
    } catch (error: any) {
      toast({ title: 'Failed to send reply', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Suspension Reply" />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-full bg-red-50 p-2 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Account suspension notice</h1>
              <p className="text-sm text-gray-600">Review the admin message and submit your explanation.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : appeal ? (
            <div className="space-y-5">
              <div className="grid gap-4 rounded-md border bg-gray-50 p-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Reason</div>
                  <div className="mt-1 text-gray-900">{appeal.reason}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Admin message</div>
                  <div className="mt-1 whitespace-pre-wrap text-gray-900">{appeal.explanation || 'No additional explanation provided.'}</div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Your reply to admin</label>
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={8} placeholder="Explain your side clearly..." />
              </div>

              {appeal.userReply && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  Your reply has already been sent. You can update it and submit again if needed.
                </div>
              )}

              <Button onClick={submit} disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Send reply to admin'}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Suspension case not found.</div>
          )}
        </section>
      </main>
    </div>
  );
}

