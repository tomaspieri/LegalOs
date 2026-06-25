"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatDateTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { TimelineEventWithAuthor } from "@/types";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface InternalNotesProps {
  caseId: string;
  notes: TimelineEventWithAuthor[];
}

export function InternalNotes({ caseId, notes: initialNotes }: InternalNotesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState(initialNotes);
  const [addingNew, setAddingNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  function openAdd() {
    setAddingNew(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function cancelAdd() {
    setAddingNew(false);
    setNewContent("");
  }

  async function submitAdd() {
    if (!newContent.trim()) return;
    const res = await fetch(`/api/cases/${caseId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent.trim() }),
    });
    if (res.ok) {
      setNewContent("");
      setAddingNew(false);
      startTransition(() => router.refresh());
    }
  }

  function openEdit(note: TimelineEventWithAuthor) {
    setEditingId(note.id);
    setEditContent(note.content ?? "");
    setTimeout(() => editRef.current?.focus(), 50);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function submitEdit() {
    if (!editContent.trim() || !editingId) return;
    const res = await fetch(`/api/cases/${caseId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: editingId, content: editContent.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      startTransition(() => router.refresh());
    }
  }

  async function confirmDelete(noteId: string) {
    const res = await fetch(`/api/cases/${caseId}/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    if (res.ok) {
      setDeletingId(null);
      startTransition(() => router.refresh());
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Internal Notes
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Add note
        </button>
      </div>

      {/* Add note form */}
      {addingNew && (
        <div className="mb-4 border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <textarea
            ref={textareaRef}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAdd();
              if (e.key === "Escape") cancelAdd();
            }}
            placeholder="Write a note... (Ctrl+Enter to save)"
            rows={3}
            className="w-full text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-transparent resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={cancelAdd}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            >
              <X size={12} />
              Cancel
            </button>
            <button
              type="button"
              onClick={submitAdd}
              disabled={!newContent.trim()}
              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              <Check size={12} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !addingNew ? (
        <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--color-text-muted)]">No internal notes yet.</p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-2 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            Add the first note
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
            >
              {editingId === note.id ? (
                <>
                  <textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    rows={3}
                    className="w-full text-sm text-[var(--color-text-primary)] bg-transparent resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitEdit}
                      disabled={!editContent.trim()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                    >
                      <Check size={12} />
                      Save
                    </button>
                  </div>
                </>
              ) : deletingId === note.id ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-danger)] font-medium">Delete this note?</p>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(note.id)}
                      className="text-xs font-medium text-white bg-[var(--color-danger)] hover:opacity-90 px-2.5 py-1 rounded-[var(--radius-sm)] transition-opacity cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      {note.author && (
                        <>
                          <Avatar
                            name={note.author.name}
                            src={note.author.avatarUrl}
                            size="sm"
                          />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {note.author.name}
                          </span>
                          <span className="text-[var(--color-border-strong)] text-xs">·</span>
                        </>
                      )}
                      <time className="text-xs text-[var(--color-text-muted)]">
                        {formatDateTime(note.occurredAt)}
                      </time>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity [.border:hover_&]:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(note)}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(note.id)}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
