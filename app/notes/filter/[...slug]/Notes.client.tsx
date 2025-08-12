"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./NotesPage.module.css";

interface NotesClientProps {
  tag: string;
  initialData: FetchNotesResponse;
}

export default function NotesClient({ tag, initialData }: NotesClientProps) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, error, isFetching } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", page, debouncedSearch, tag],
    queryFn: () =>
      fetchNotes({
        page,
        search: debouncedSearch,
        tag: tag === "All" ? undefined : tag,
      }),
    initialData: page === 1 && debouncedSearch === "" ? initialData : undefined,
    placeholderData: () => ({
      notes: [],
      totalPages: 1,
    }),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNoteCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    closeModal();
  };

  return (
    <div className={css.app}>
      <div className={css.header}>
        <h1 className={css.title}>
          {tag === "All" ? "All Notes" : `${tag} Notes`}
        </h1>
      </div>

      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        <button className={css.button} onClick={openModal}>
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading...</p>}

      {error && (
        <div className={css.error}>
          Error:{" "}
          {error instanceof Error ? error.message : "Something went wrong"}
        </div>
      )}

      {data?.notes.length ? (
        <>
          <NoteList notes={data.notes} />
          {data.totalPages > 1 && (
            <Pagination
              pageCount={data.totalPages}
              onPageChange={handlePageChange}
              currentPage={page - 1}
            />
          )}
        </>
      ) : (
        !isLoading && <div className={css.noNotes}>No notes found</div>
      )}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={handleNoteCreated} />
        </Modal>
      )}

      {isFetching && !isLoading && <p>Updating...</p>}
    </div>
  );
}
