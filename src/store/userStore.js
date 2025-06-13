import { create } from 'zustand';

const useUserStore = create((set) => ({
  currentUser: (() => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  })(),

  setUser: (user) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      set({ currentUser: user });
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('currentUser');
      set({ currentUser: null });
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  },
}));

export default useUserStore; 