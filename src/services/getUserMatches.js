import { API_URL } from './config';

/**
 * Obtiene los partidos en los que el usuario participa (como organizador o participante)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de partidos del usuario
 */
export const getUserMatches = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/partidos/usuario/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener partidos del usuario');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error obteniendo partidos del usuario:', error);
    throw error;
  }
};
