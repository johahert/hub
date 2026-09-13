import { create } from "zustand";

interface SelectionState {
    currentNodeId: string | null,
    selectedCardId: string | null,
    setCurrentNode: (id: string | null) => void,
    setSelectedCard: (id: string | null) => void
}

export const useSelection = create<SelectionState>((set) => ({
    currentNodeId: null,
    selectedCardId: null,
    setCurrentNode: (id) => set({ currentNodeId: id, selectedCardId: null }),
    setSelectedCard: (id) => set({ selectedCardId: id })
}))