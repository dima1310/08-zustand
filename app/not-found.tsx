import type { Metadata } from "next";
import css from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Сторінку не знайдено - NoteHub",
  description:
    "Запитувана сторінка не існує або була видалена. Поверніться на головну сторінку NoteHub для пошуку потрібної інформації.",
  openGraph: {
    title: "Сторінку не знайдено - NoteHub",
    description:
      "Запитувана сторінка не існує або була видалена. Поверніться на головну сторінку NoteHub для пошуку потрібної інформації.",
    url: "https://notehub.com/404",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Сторінку не знайдено - NoteHub",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <div className={css.container}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
