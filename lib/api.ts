import axios from "axios";
import type { Note, NoteTag } from "../types/note";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

const api = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`,
  },
});

export async function fetchNotes({
  page = 1,
  search = "",
  tag,
}: {
  page?: number;
  search?: string;
  tag?: string;
}): Promise<FetchNotesResponse> {
  const params: Record<string, string | number> = { page };

  if (search) {
    params.search = search;
  }

  // Только если тег не "All" и не пустой, добавляем его к параметрам
  if (tag && tag !== "All") {
    params.tag = tag;
  }

  const response = await api.get<FetchNotesResponse>("/notes", { params });
  return response.data;
}

export const getNotes = fetchNotes;

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const response = await api.post<Note>("/notes", payload);
  return response.data;
}

export async function deleteNote(id: number | string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
}

export async function fetchNoteById(id: number | string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export const getNoteById = fetchNoteById;
