'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Plus, Save, X, Pencil, Trash2, ToggleLeft, ToggleRight, FileDown, Search as SearchIcon, Layers } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/* ------------------------------- Types ----------------------------------- */
type CategoryRow = {
  id: string;
  name: string;
  slug: string;        // unique, url-safe
  isActive: boolean;
  subjectsUsing: number; // used for delete guard
};

/* ------------------------------ Mock Data -------------------------------- */
const MOCK_CATEGORIES: CategoryRow[] = [
  { id: 'c1', name: 'STEM',       slug: 'stem',       isActive: true,  subjectsUsing: 12 },
  { id: 'c2', name: 'Languages',  slug: 'languages',  isActive: true,  subjectsUsing: 7 },
  { id: 'c3', name: 'Commerce',   slug: 'commerce',   isActive: false, subjectsUsing: 0 },
];

/* -------------------------------- Utils ---------------------------------- */
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function exportCsv(rows: CategoryRow[]) {
  const header = ['id', 'name', 'slug', 'isActive', 'subjectsUsing'];
  const body = rows.map(r => [r.id, r.name, r.slug, String(r.isActive), String(r.subjectsUsing)]);
  const csv = [header, ...body].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'categories.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------------------- Page ---------------------------------- */
export default function AdminCategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rows, setRows] = useState<CategoryRow[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState('');

  // Drawer state (Create/Edit)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<Omit<CategoryRow, 'id' | 'subjectsUsing'>>({
    name: '',
    slug: '',
    isActive: true,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q)
    );
  }, [rows, search]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', slug: '', isActive: true });
    setDrawerOpen(true);
  }

  function openEdit(row: CategoryRow) {
    setEditing(row);
    setForm({ name: row.name, slug: row.slug, isActive: row.isActive });
    setDrawerOpen(true);
  }

  function saveForm() {
    // basic validation
    if (!form.name.trim()) return alert('Name is required');
    if (!form.slug.trim()) return alert('Slug is required');

    // ensure unique slug (mock check)
    const slugUsedBy = rows.find(r => r.slug === form.slug && (!editing || r.id !== editing.id));
    if (slugUsedBy) return alert('Slug must be unique');

    if (editing) {
      setRows(prev => prev.map(r => (r.id === editing.id ? { ...r, ...form } : r)));
    } else {
      const newRow: CategoryRow = {
        id: `c${Date.now()}`,
        name: form.name,
        slug: form.slug,
        isActive: form.isActive,
        subjectsUsing: 0,
      };
      setRows(prev => [newRow, ...prev]);
    }
    setDrawerOpen(false);
  }

  function toggleActive(id: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  }

  function remove(id: string) {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    if (row.subjectsUsing > 0) {
      return alert(`Cannot delete. "${row.name}" is used by ${row.subjectsUsing} subject(s). Deactivate instead.`);
    }
    if (window.confirm(`Delete category "${row.name}"?`)) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={1}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Categories"
          subtitle="Organize subjects into catalogs"
          greeting
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportCsv(filtered)}>
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-text" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </Button>
            </div>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Search */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-md">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input
                  placeholder="Search category or slug…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Subjects Using</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-primary" />
                        </div>
                        <div className="font-medium text-text">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{c.slug}</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {c.subjectsUsing}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          'border',
                          c.isActive
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted/40 text-muted border-muted/40'
                        )}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleActive(c.id)}>
                          {c.isActive ? (
                            <ToggleLeft className="w-4 h-4 mr-2" />
                          ) : (
                            <ToggleRight className="w-4 h-4 mr-2" />
                          )}
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => remove(c.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {/* Drawer / SlideOver */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editing ? 'Edit Category' : 'Create Category'}</h3>
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
                      placeholder="e.g., STEM"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                      placeholder="stem"
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
