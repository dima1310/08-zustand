import Link from "next/link";
import { NoteTag } from "@/types/note";
import css from "./SidebarNotes.module.css";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export default function SidebarNotes() {
  return (
    <div className={css.sidebar}>
      <h3 className={css.title}>Filter by Tag</h3>
      <ul className={css.menuList}>
        {TAGS.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link href={`/notes/filter/${tag}`} className={css.menuLink}>
              {tag === "All" ? "All notes" : tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
