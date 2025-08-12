"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import type { CreateNotePayload } from "@/types/note";
import { useNoteStore } from "@/lib/store/noteStore";
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

  // Zustand store
  const { draft, setDraft, clearDraft } = useNoteStore();

  // Локальний стан для полів форми
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tag: "Todo",
  });

  // Ініціалізація форми при монтуванні компонента
  useEffect(() => {
    if (isEditing && initialData) {
      // Для редагування використовуємо дані нотатки
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        tag: initialData.tag || "Todo",
      });
    } else if (!isEditing) {
      // Для створення нової нотатки перевіряємо draft
      const hasDraft = draft.title || draft.content || draft.tag !== "Todo";
      if (hasDraft) {
        // Завантажуємо збережений draft
        setFormData(draft);
      } else {
        // Використовуємо початковий стан
        setFormData({
          title: "",
          content: "",
          tag: "Todo",
        });
      }
    }
  }, [isEditing, initialData, draft]);

  // Обробник зміни полів форми
  const handleFieldChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Зберігаємо в draft тільки для нових нотаток
    if (!isEditing) {
      setDraft({ [field]: value });
    }
  };

  const { mutate: createNoteMutation } = useMutation({
    mutationFn: createNote,
    onSuccess: (createdNote) => {
      // Очищуємо draft після успішного створення
      if (!isEditing) {
        clearDraft();
      }

      queryClient.invalidateQueries({
        queryKey: ["notes"],
        exact: false,
      });

      if (onClose) {
        onClose();
      } else {
        // Якщо редагуємо, переходимо до нотатки, інакше до списку
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
  const validateForm = (data: typeof formData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.title || data.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (data.title.trim().length > 50) {
      errors.title = "Title must be at most 50 characters";
    }

    if (!data.tag) {
      errors.tag = "Tag is required";
    }

    if (data.content && data.content.length > 500) {
      errors.content = "Content must be at most 500 characters";
    }

    return errors;
  };

  // Основна функція обробки форми
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Валідація
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const noteData: CreateNotePayload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tag: formData.tag as CreateNotePayload["tag"],
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

  // Функція збереження чернетки (додаткова кнопка)
  const handleSaveDraft = () => {
    if (!isEditing) {
      setDraft(formData);

      // Візуальний фідбек
      const draftButton = document.querySelector(
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
    }
  };

  const handleCancel = () => {
    // НЕ очищуємо draft при скасуванні
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
            value={formData.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
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
            value={formData.content}
            onChange={(e) => handleFieldChange("content", e.target.value)}
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
            value={formData.tag}
            onChange={(e) => handleFieldChange("tag", e.target.value)}
            className={css.select}
          >
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

          {!isEditing && (
            <button
              type="button"
              className={css.draftButton}
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              data-action="draft"
            >
              Save Draft
            </button>
          )}

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
