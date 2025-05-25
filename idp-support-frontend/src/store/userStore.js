import { create } from 'zustand';

export const useUserStore = create((set) => ({
    user: null,

    setUser: (user) => set({ user }),
    sessionChecked: false,
    setSessionChecked: (value) => set({ sessionChecked: value }),

    clearUser: () => {
        localStorage.removeItem('token');
        set({ user: null, sessionChecked: true });
    }
}));
