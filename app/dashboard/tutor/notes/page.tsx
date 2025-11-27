"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import NoteCard from "@/components/notes/NoteCard";
import CreateNoteModal from "@/components/notes/CreateNoteModal";
import DeleteNoteModal from "@/components/notes/DeleteNoteModal";
import PreviewNoteModal from "@/components/notes/PreviewNoteModal";
import EditNoteModal from "@/components/notes/EditNoteModal";

import {
  getMyNotes,
  createNote,
  deleteNote,
  updateNote,
} from "@/services/noteService";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function TutorNotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [previewNote, setPreviewNote] = useState<any | null>(null);
  const [deleteNoteItem, setDeleteNoteItem] = useState<any | null>(null);
  const [editNoteItem, setEditNoteItem] = useState<any | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  // ---- LOAD PAGINATED NOTES ----
  const load = async (pageToLoad: number, reset = false) => {
    try {
      setListLoading(true);
      const res = await getMyNotes(pageToLoad, 12);

      if (reset) {
        setItems(res.data || []);
      } else {
        setItems((prev) => [...prev, ...(res.data || [])]);
      }

      setTotal(res.pagination?.total || 0);
    } catch (e) {
      console.error("getMyNotes error", e);
      toast({
        title: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(1, true);
  }, []);

  // ---- CREATE ----
  const handleCreate = async (fd: FormData) => {
    try {
      const res = await createNote(fd);
      if (res.success) {
        toast({ title: "Note created successfully" });
        setPage(1);
        await load(1, true);
        return true;
      }
      toast({ title: "Failed to create note", variant: "destructive" });
      return false;
    } catch (err) {
      console.error("createNote error", err);
      toast({ title: "Failed to create note", variant: "destructive" });
      return false;
    }
  };

  // ---- DELETE ----
  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      toast({ title: "Deleted Successfully" });
      setPage(1);
      await load(1, true);
      setDeleteOpen(false);
    } catch (err) {
      console.error("deleteNote error", err);
      toast({ title: "Failed to delete note", variant: "destructive" });
    }
  };

  // ---- UPDATE ----
  const handleUpdate = async (id: string, fd: FormData) => {
    try {
      const res = await updateNote(id, fd);

      if (res.success) {
        toast({ title: "Note updated successfully" });
        setPage(1);
        await load(1, true);
        return true;
      }

      toast({ title: "Failed to update note", variant: "destructive" });
      return false;
    } catch (err) {
      console.error("updateNote error", err);
      toast({ title: "Failed to update note", variant: "destructive" });
      return false;
    }
  };

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} userRole="tutor" />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="tutor"
      />

      <div className="lg:pl-64">
        <Topbar
          title="Notes"
          subtitle="Upload and manage paid notes"
          action={<Button onClick={() => setCreateOpen(true)}>Add Note</Button>}
        />

        <main className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col gap-3">
              {items.map((n) => (
                <NoteCard
                  key={n._id}
                  note={n}
                  onPreview={() => {
                    setPreviewNote(n);
                    setPreviewOpen(true);
                  }}
                  onEdit={() => {
                    setEditNoteItem(n);
                    setEditOpen(true);
                  }}
                  onDelete={() => {
                    setDeleteNoteItem(n);
                    setDeleteOpen(true);
                  }}
                />
              ))}

              {items.length === 0 && !listLoading && (
                <p className="text-center text-sm text-gray-500">
                  No notes found. Click &quot;Add Note&quot; to upload your first
                  note.
                </p>
              )}
            </div>

            {/* LOAD MORE */}
            {items.length < total && (
              <div className="text-center pt-2">
                <Button
                  onClick={async () => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    await load(nextPage, false);
                  }}
                  disabled={listLoading}
                >
                  {listLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ----- MODALS ----- */}
      <CreateNoteModal
        open={createOpen}
        setOpen={setCreateOpen}
        onCreate={handleCreate}
      />

      <PreviewNoteModal
        open={previewOpen}
        setOpen={setPreviewOpen}
        note={previewNote}
      />

      <DeleteNoteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        note={deleteNoteItem}
        onConfirm={handleDelete}
      />

      <EditNoteModal
        open={editOpen}
        setOpen={setEditOpen}
        note={editNoteItem}
        onSave={handleUpdate}
      />
    </div>
  );
}
