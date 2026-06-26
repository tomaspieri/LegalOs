"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime, getInitials } from "@/lib/utils";
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
    <div style={{ background: "#FFFDF0", border: "1px solid #EDD770", borderRadius: 10, padding: "18px 22px" }}>
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#856404",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Internal Notes
        </h2>
        <button
          type="button"
          onClick={openAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#1D4ED8",
            color: "white",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            border: "none",
          }}
        >
          <Plus size={11} />
          Add note
        </button>
      </div>

      {/* Add note form */}
      {addingNew && (
        <div className="mb-3 p-3" style={{ background: "white", border: "1px solid #EDD770", borderRadius: 7 }}>
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
        <div className="text-center py-6" style={{ border: "1px dashed #EDD770", borderRadius: 7 }}>
          <p className="text-sm" style={{ color: "#9AAAB8" }}>No internal notes yet.</p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-2 text-xs hover:underline cursor-pointer"
            style={{ color: "#1D4ED8" }}
          >
            Add the first note
          </button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 10 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3"
              style={{ background: "white", border: "1px solid #EDD770", borderRadius: 7, padding: "13px 15px" }}
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
                  <p
                    className="whitespace-pre-wrap"
                    style={{ fontSize: 13, color: "#0C1628", lineHeight: 1.6, marginBottom: 10 }}
                  >
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: 6 }}>
                      {note.author && (
                        <>
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "#1D4ED8",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 7,
                              fontWeight: 700,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(note.author.name)}
                          </span>
                          <span style={{ fontSize: 12, color: "#5A6A80" }}>
                            {note.author.name}
                          </span>
                        </>
                      )}
                      <time style={{ fontSize: 11, color: "#9AAAB8" }}>
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
