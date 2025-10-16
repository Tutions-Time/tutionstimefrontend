'use client';

import { useState } from 'react';
import { ShieldCheck, Upload, Save } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function TutorKycPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<'pending'|'submitted'|'approved'|'rejected'>('pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" userName="Dr. Meera"/>
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Verification" subtitle="Upload your KYC documents" />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-6 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary"/>
                </div>
                <div>
                  <div className="font-semibold">KYC Status</div>
                  <div className="text-sm text-muted">Aadhaar / PAN / Bank Proof</div>
                </div>
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/20 capitalize">{status}</Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="text-sm font-medium">Aadhaar (front/back)</label>
                <Input type="file" multiple />
              </div>
              <div>
                <label className="text-sm font-medium">PAN Card</label>
                <Input type="file" />
              </div>
              <div>
                <label className="text-sm font-medium">Bank Proof (Passbook/Cheque)</label>
                <Input type="file" />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={()=>setStatus('submitted')}>
                <Upload className="w-4 h-4 mr-2"/>Submit for Review
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-text"><Save className="w-4 h-4 mr-2"/>Save Draft</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
