import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NoteDraft {
  title: string;
  content: string;
  tag: string;
}

interface NoteStore {
  draft: NoteDraft;
  setDraft: (note: Partial<NoteDraft>) => void;
  clearDraft: () => void;
}

const initialDraft: NoteDraft = {
  title: "",
  content: "",
  tag: "Todo",
};

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      draft: initialDraft,

      setDraft: (note: Partial<NoteDraft>) =>
        set((state) => ({
          draft: { ...state.draft, ...note },
        })),

      clearDraft: () =>
        set(() => ({
          draft: initialDraft,
        })),
    }),
    {
      name: "note-draft-storage", // localStorage key
      // Можна додати конфігурацію для кращого контролю
      partialize: (state) => ({ draft: state.draft }),
    }
  )
);
