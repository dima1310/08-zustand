import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Створити нову замітку - NoteHub",
  description:
    "Створіть нову замітку з підтримкою тегів та категорій. Простий та зручний редактор для ваших ідей та нотаток.",
  openGraph: {
    title: "Створити нову замітку - NoteHub",
    description:
      "Створіть нову замітку з підтримкою тегів та категорій. Простий та зручний редактор для ваших ідей та нотаток.",
    url: "https://notehub.com/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Створити нову замітку - NoteHub",
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
