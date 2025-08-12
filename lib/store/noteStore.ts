import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NoteDraft {
  title: string;
  content: string;
  tag: string;
}

interface NoteStore {
  draft: NoteDraft;
  setDraft: (note: Partial<NoteDraft>) => void;
  clearDraft: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,

      setDraft: (note: Partial<NoteDraft>) =>
        set((state) => ({
          draft: { ...state.draft, ...note },
        })),

      clearDraft: () =>
        set(() => ({
          draft: initialDraft,
        })),

      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "note-draft-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }

        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        draft: state.draft,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
