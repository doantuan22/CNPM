import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

/**
 * Global UI Client State Store (Zustand)
 * Note: Used exclusively for client-side UI states per TECH-0.
 * Server data MUST be managed by TanStack Query.
 */
export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
