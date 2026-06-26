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
    <div
      style={{
        background: "#F7F9FC",
        border: "1px solid #DDE4EF",
        borderLeft: "3px solid #1D4ED8",
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#5A6A80",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
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
            padding: "4px 10px",
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
        <div style={{ marginBottom: 10, padding: "10px 12px", background: "white", border: "1px solid #DDE4EF", borderRadius: 7 }}>
          <textarea
            ref={textareaRef}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAdd();
              if (e.key === "Escape") cancelAdd();
            }}
            placeholder="Write a note… (Ctrl+Enter to save)"
            rows={2}
            style={{
              width: "100%",
              fontSize: 13,
              color: "#0C1628",
              background: "transparent",
              resize: "none",
              outline: "none",
              lineHeight: 1.55,
              fontFamily: "inherit",
              border: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid #EEF1F8" }}>
            <button
              type="button"
              onClick={cancelAdd}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9AAAB8", background: "none", border: "none", cursor: "pointer", padding: "3px 6px" }}
            >
              <X size={12} />
              Cancel
            </button>
            <button
              type="button"
              onClick={submitAdd}
              disabled={!newContent.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
                color: "white",
                background: "#1D4ED8",
                border: "none",
                borderRadius: 5,
                padding: "4px 10px",
                cursor: newContent.trim() ? "pointer" : "not-allowed",
                opacity: newContent.trim() ? 1 : 0.5,
              }}
            >
              <Check size={12} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !addingNew ? (
        <div style={{ textAlign: "center", padding: "16px 0", border: "1px dashed #C5D2E8", borderRadius: 7 }}>
          <p style={{ fontSize: 12, color: "#9AAAB8", margin: "0 0 6px" }}>No internal notes yet.</p>
          <button
            type="button"
            onClick={openAdd}
            style={{ fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Add the first note
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{ background: "white", border: "1px solid #E5EAF4", borderRadius: 7, padding: "12px 14px" }}
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
                    rows={2}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      color: "#0C1628",
                      background: "transparent",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.55,
                      fontFamily: "inherit",
                      border: "none",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid #EEF1F8" }}>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9AAAB8", background: "none", border: "none", cursor: "pointer", padding: "3px 6px" }}
                    >
                      <X size={12} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitEdit}
                      disabled={!editContent.trim()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "white",
                        background: "#1D4ED8",
                        border: "none",
                        borderRadius: 5,
                        padding: "4px 10px",
                        cursor: editContent.trim() ? "pointer" : "not-allowed",
                        opacity: editContent.trim() ? 1 : 0.5,
                      }}
                    >
                      <Check size={12} />
                      Save
                    </button>
                  </div>
                </>
              ) : deletingId === note.id ? (
                <div>
                  <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 500, margin: "0 0 4px" }}>Delete this note?</p>
                  <p style={{ fontSize: 12, color: "#9AAAB8", margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {note.content}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      style={{ fontSize: 12, color: "#9AAAB8", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(note.id)}
                      style={{ fontSize: 12, fontWeight: 500, color: "white", background: "#DC2626", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#0C1628", lineHeight: 1.6, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
                    {note.content}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                          <span style={{ fontSize: 12, color: "#5A6A80" }}>{note.author.name}</span>
                        </>
                      )}
                      <time style={{ fontSize: 11, color: "#9AAAB8" }}>{formatDateTime(note.occurredAt)}</time>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <button
                        type="button"
                        onClick={() => openEdit(note)}
                        title="Edit note"
                        style={{ display: "flex", padding: 5, borderRadius: 4, color: "#9AAAB8", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#1D4ED8"; e.currentTarget.style.background = "#EEF3FF"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#9AAAB8"; e.currentTarget.style.background = "none"; }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(note.id)}
                        title="Delete note"
                        style={{ display: "flex", padding: 5, borderRadius: 4, color: "#9AAAB8", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.background = "#FFF5F5"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#9AAAB8"; e.currentTarget.style.background = "none"; }}
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
