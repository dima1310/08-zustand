"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import type { CreateNotePayload } from "@/types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose?: () => void;
  initialData?: {
    title?: string;
    content?: string;
    tag?: string;
  };
  isEditing?: boolean;
  noteId?: string;
}

export default function NoteForm({
  onClose,
  initialData,
  isEditing = false,
  noteId,
}: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: createNoteMutation } = useMutation({
    mutationFn: createNote,
    onSuccess: (createdNote) => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
        exact: false,
      });
      if (onClose) {
        onClose();
      } else {
        // Якщо редагуємо, переходимо до нотатки, інакше до списку
        // Для нової нотатки використовуємо ID з відповіді сервера
        const redirectPath =
          isEditing && noteId
            ? `/notes/${noteId}`
            : createdNote?.id
            ? `/notes/${createdNote.id}`
            : "/notes/filter/All";
        router.push(redirectPath);
      }
    },
    onError: (error) => {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} note:`,
        error
      );
      setFormErrors({
        submit: `Failed to ${isEditing ? "update" : "create"} note`,
      });
      setIsSubmitting(false);
    },
  });

  // Валідація форми
  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    const title = formData.get("title") as string;
    const tag = formData.get("tag") as string;
    const content = formData.get("content") as string;

    if (!title || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 50) {
      errors.title = "Title must be at most 50 characters";
    }

    if (!tag) {
      errors.tag = "Tag is required";
    }

    if (content && content.length > 500) {
      errors.content = "Content must be at most 500 characters";
    }

    return errors;
  };

  // Основна функція обробки форми
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);

    // Валідація
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const tag = formData.get("tag") as string;

      const noteData: CreateNotePayload = {
        title: title.trim(),
        content: content.trim(),
        tag: tag as CreateNotePayload["tag"],
      };

      // Якщо редагуємо, додаємо ID нотатки для майбутньої логіки оновлення
      if (isEditing && noteId) {
        console.log(`Updating note with ID: ${noteId}`, noteData);
        // Тут буде логіка виклику updateNote API
        // updateNoteMutation({ id: noteId, ...noteData });
      }

      createNoteMutation(noteData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormErrors({ submit: "Failed to submit form" });
      setIsSubmitting(false);
    }
  };

  // Функція збереження чернетки
  const handleSaveDraft = (form: HTMLFormElement) => {
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tag = formData.get("tag") as string;

    const draftData = {
      id: noteId, // Використовуємо noteId для ідентифікації чернетки
      title: title.trim(),
      content: content.trim(),
      tag,
      isEditing,
      savedAt: new Date().toISOString(),
    };

    // Тут буде інтеграція з Zustand для збереження чернетки
    console.log("Draft saved:", draftData);

    // Тимчасове повідомлення користувачу
    const draftButton = form.querySelector(
      '[data-action="draft"]'
    ) as HTMLButtonElement;
    if (draftButton) {
      const originalText = draftButton.textContent;
      draftButton.textContent = "Saved!";
      draftButton.style.background = "#10b981";

      setTimeout(() => {
        draftButton.textContent = originalText;
        draftButton.style.background = "";
      }, 2000);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={initialData?.title || ""}
            className={css.input}
            placeholder="Enter note title..."
          />
          {formErrors.title && (
            <span className={css.error}>{formErrors.title}</span>
          )}
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            rows={8}
            defaultValue={initialData?.content || ""}
            className={css.textarea}
            placeholder="Write your note content here..."
          />
          {formErrors.content && (
            <span className={css.error}>{formErrors.content}</span>
          )}
        </div>

        <div className={css.formGroup}>
          <label htmlFor="tag">Tag</label>
          <select
            id="tag"
            name="tag"
            className={css.select}
            defaultValue={initialData?.tag || ""}
          >
            <option value="" disabled>
              Select a tag
            </option>
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </select>
          {formErrors.tag && (
            <span className={css.error}>{formErrors.tag}</span>
          )}
        </div>

        {formErrors.submit && (
          <div className={css.error}>{formErrors.submit}</div>
        )}

        <div className={css.actions}>
          <button
            type="button"
            className={css.cancelButton}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={css.draftButton}
            onClick={(e) => {
              const form = e.currentTarget.closest("form") as HTMLFormElement;
              if (form) {
                handleSaveDraft(form);
              }
            }}
            disabled={isSubmitting}
            data-action="draft"
          >
            Save Draft
          </button>

          <button
            type="submit"
            className={css.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update note"
              : "Create note"}
          </button>
        </div>
      </form>
    </div>
  );
}
