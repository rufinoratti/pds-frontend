import { create } from 'zustand';

const useUserStore = create((set) => ({  currentUser: (() => {
    try {
      const user = localStorage.getItem('currentUser');
      // Verificar que no sea null, undefined o string "undefined"
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Limpiar el localStorage si hay datos corruptos
      localStorage.removeItem('currentUser');
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
  },  logout: () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken'); // También limpiar el token
      set({ currentUser: null });
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    // Verificar que tanto el token como el usuario existan y no sean strings inválidos
    return token && token !== 'undefined' && token !== 'null' && 
           user && user !== 'undefined' && user !== 'null';
  },
}));

export default useUserStore; 