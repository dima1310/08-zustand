"use client";

import { useState } from "react";
import Link from "next/link";
import { NoteTag } from "@/types/note";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

const menuStyles = {
  menuContainer: {
    position: "relative" as const,
    display: "inline-block",
  },
  menuButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
  },
  menuList: {
    position: "absolute" as const,
    top: "100%",
    left: "0",
    background: "white",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    minWidth: "160px",
    zIndex: 1000,
    listStyle: "none",
    margin: 0,
    padding: "8px 0",
  },
  menuItem: {
    margin: 0,
  },
  menuLink: {
    display: "block",
    padding: "8px 16px",
    color: "#212529",
    textDecoration: "none",
    transition: "background-color 0.2s ease",
  },
};

export default function TagsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={menuStyles.menuContainer}>
      <button
        style={menuStyles.menuButton}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Notes ▾
      </button>
      {isOpen && (
        <ul style={menuStyles.menuList}>
          {TAGS.map((tag) => (
            <li key={tag} style={menuStyles.menuItem}>
              <Link
                href={`/notes/filter/${tag}`}
                style={menuStyles.menuLink}
                onClick={() => setIsOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {tag === "All" ? "All notes" : tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
