import { create } from "zustand";

export const useToastStore = create((set) => ({
  toast: null,

  showToast: (message, type = "info") => {
    set({ toast: { message, type } });

    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  hideToast: () => set({ toast: null }),
}));