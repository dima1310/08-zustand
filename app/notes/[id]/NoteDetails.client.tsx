"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchNoteById, deleteNote } from "@/lib/api";
import css from "./NoteDetails.module.css";

interface NoteDetailsClientProps {
  noteId: string;
}

export default function NoteDetailsClient({ noteId }: NoteDetailsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
    enabled: !!noteId,
  });

  const { mutate: removeNote, isPending: isDeleting } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/All");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Delete this note? This action cannot be undone.")) {
      removeNote(noteId);
    }
  };

  if (!noteId) {
    return <p>Invalid note ID.</p>;
  }

  if (isLoading) return <p>Loading, please wait...</p>;

  if (error || !note) {
    return (
      <div className={css.container}>
        <p>Something went wrong.</p>
        <Link href="/notes/filter/All" className={css.backLink}>
          ← Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <Link href="/notes/filter/All" className={css.backLink}>
          ← Back to notes
        </Link>
        <button
          onClick={handleDelete}
          className={css.deleteButton}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className={css.item}>
        <div className={css.noteHeader}>
          <h2 className={css.title}>{note.title}</h2>
          {note.tag && <span className={css.tag}>{note.tag}</span>}
        </div>
        <p className={css.content}>{note.content}</p>
        <p className={css.date}>
          Created: {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
