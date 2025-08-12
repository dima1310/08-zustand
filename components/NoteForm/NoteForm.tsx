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
}

export default function NoteForm({ onClose, initialData }: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Zustand store - використовуємо НАПРЯМУ для управління формою
  const { draft, setDraft, clearDraft } = useNoteStore();

  // Ініціалізація draft при монтуванні компонента (тільки якщо draft порожній)
  useEffect(() => {
    if (initialData) {
      // Якщо є initialData (для редагування), ігноруємо draft
      return;
    }

    // Для нової нотатки: якщо draft порожній, ініціалізуємо початковими значеннями
    const isDraftEmpty = !draft.title && !draft.content && draft.tag === "Todo";
    if (isDraftEmpty) {
      // Draft вже має правильні початкові значення з initialDraft
      // Нічого робити не потрібно
    }
  }, [initialData, draft]);

  // Обробники зміни полів - напряму оновлюють draft
  const handleTitleChange = (value: string) => {
    setDraft({ title: value });
  };

  const handleContentChange = (value: string) => {
    setDraft({ content: value });
  };

  const handleTagChange = (value: string) => {
    setDraft({ tag: value });
  };

  const { mutate: createNoteMutation } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Очищуємо draft після успішного створення
      clearDraft();

      queryClient.invalidateQueries({
        queryKey: ["notes"],
        exact: false,
      });

      if (onClose) {
        onClose();
      } else {
        // Повертаємося на попередній маршрут
        router.back();
      }
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      setFormErrors({
        submit: "Failed to create note",
      });
      setIsSubmitting(false);
    },
  });

  // Валідація форми
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!draft.title || draft.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (draft.title.trim().length > 50) {
      errors.title = "Title must be at most 50 characters";
    }

    if (!draft.tag) {
      errors.tag = "Tag is required";
    }

    if (draft.content && draft.content.length > 500) {
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
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const noteData: CreateNotePayload = {
        title: draft.title.trim(),
        content: draft.content.trim(),
        tag: draft.tag as CreateNotePayload["tag"],
      };

      createNoteMutation(noteData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormErrors({ submit: "Failed to submit form" });
      setIsSubmitting(false);
    }
  };

  // Функція збереження чернетки (додаткова кнопка)
  const handleSaveDraft = () => {
    // Дані вже збережені в реальному часі, просто показуємо фідбек
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
  };

  const handleCancel = () => {
    // НЕ очищуємо draft при скасуванні
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Використовуємо значення напряму з draft (або initialData для редагування)
  const titleValue = initialData?.title ?? draft.title;
  const contentValue = initialData?.content ?? draft.content;
  const tagValue = initialData?.tag ?? draft.tag;

  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={titleValue}
            onChange={(e) => handleTitleChange(e.target.value)}
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
            value={contentValue}
            onChange={(e) => handleContentChange(e.target.value)}
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
            value={tagValue}
            onChange={(e) => handleTagChange(e.target.value)}
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

          <button
            type="button"
            className={css.draftButton}
            onClick={handleSaveDraft}
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
            {isSubmitting ? "Creating..." : "Create note"}
          </button>
        </div>
      </form>
    </div>
  );
}
