'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Plus, Save, X, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Level = 'K-12' | 'UG' | 'PG' | 'Competitive';

type SubjectRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultRate: number; // INR/hr
  level: Level;
  tags: string[];
  isActive: boolean;
};

const MOCK_SUBJECTS: SubjectRow[] = [
  { id: 's1', name: 'Mathematics', slug: 'mathematics', category: 'STEM', defaultRate: 450, level: 'K-12', tags: ['algebra','calculus'], isActive: true },
  { id: 's2', name: 'Physics', slug: 'physics', category: 'STEM', defaultRate: 550, level: 'UG', tags: ['mechanics','optics'], isActive: true },
  { id: 's3', name: 'English', slug: 'english', category: 'Languages', defaultRate: 400, level: 'K-12', tags: ['grammar','writing'], isActive: false },
];

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function AdminSubjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rows, setRows] = useState<SubjectRow[]>(MOCK_SUBJECTS);
  const [search, setSearch] = useState('');

  // form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [form, setForm] = useState<Omit<SubjectRow, 'id'>>({
    name: '',
    slug: '',
    category: '',
    defaultRate: 0,
    level: 'K-12',
    tags: [],
    isActive: true,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.join(' ').toLowerCase().includes(q)
    );
  }, [rows, search]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', slug: '', category: '', defaultRate: 0, level: 'K-12', tags: [], isActive: true });
    setDrawerOpen(true);
  }

  function openEdit(row: SubjectRow) {
    setEditing(row);
    setForm({ ...row });
    setDrawerOpen(true);
  }

  function saveForm() {
    // basic validation
    if (!form.name.trim()) return alert('Name is required');
    if (!form.slug.trim()) return alert('Slug is required');
    if (form.defaultRate < 0) return alert('Rate must be ≥ 0');

    if (editing) {
      setRows(prev => prev.map(r => (r.id === editing.id ? { ...editing, ...form } : r)));
    } else {
      const newRow: SubjectRow = { id: `s${Date.now()}`, ...form };
      setRows(prev => [newRow, ...prev]);
    }
    setDrawerOpen(false);
  }

  function remove(id: string) {
    // guard: pretend if subject has dependencies we block delete
    const inUse = false; // flip to 'true' to see the guard message
    if (inUse) return alert('This subject is used by active listings. Deactivate instead.');
    if (window.confirm('Delete subject?')) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  }

  function toggleActive(id: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={1} userRole="admin" userName="Admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Subjects"
          subtitle="Catalog & default pricing"
          greeting
          action={
            <Button className="bg-primary hover:bg-primary/90 text-text" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Subject
            </Button>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Search */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <Input placeholder="Search subject, slug, category, tag…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Default Rate</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-text">{s.name}</div>
                          <div className="text-muted text-xs">{s.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{s.category}</td>
                    <td className="px-4 py-4">{s.level}</td>
                    <td className="px-4 py-4">₹{s.defaultRate.toLocaleString('en-IN')}/hr</td>
                    <td className="px-4 py-4">
                      {s.tags.length ? (
                        <div className="flex flex-wrap gap-1">
                          {s.tags.map(tag => (
                            <Badge key={tag} className="bg-primary/10 text-primary border-primary/20">{tag}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn('border', s.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted/40 text-muted border-muted/40')}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                          <Pencil className="w-4 h-4 mr-2" /> 
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleActive(s.id)}>
                          {s.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                          {/* {s.isActive ? 'Deactivate' : 'Activate'} */}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => remove(s.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> 
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      No subjects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {/* Drawer / SlideOver (simple panel) */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editing ? 'Edit Subject' : 'Create Subject'}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
                      }}
                      placeholder="e.g., Mathematics"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                      placeholder="mathematics"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="e.g., STEM"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Default Rate (₹/hr)</label>
                    <Input
                      type="number"
                      min={0}
                      value={form.defaultRate}
                      onChange={(e) => setForm((f) => ({ ...f, defaultRate: Number(e.target.value) }))}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Level</label>
                    <select
                      className="h-10 w-full rounded-md border px-3 text-sm"
                      value={form.level}
                      onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as any }))}
                    >
                      <option value="K-12">K-12</option>
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                      <option value="Competitive">Competitive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <Input
                      value={form.tags.join(', ')}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                      placeholder="algebra, calculus"
                    />
                  </div>

                  <div className="flex items-center justify-between border rounded-md p-3">
                    <span className="text-sm">Active</span>
                    <Button variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}>
                      {form.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                      {form.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-text" onClick={saveForm}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
