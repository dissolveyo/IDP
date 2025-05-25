import { create } from 'zustand';

export const useChatStore = create((set) => ({
    unreadCount: 0,
    setUnreadCount: (count) => set({ unreadCount: count }),
    incrementCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    readByCount: (count) =>
        set((state) => ({
            unreadCount: Math.max(state.unreadCount - count, 0)
        }))
}));
