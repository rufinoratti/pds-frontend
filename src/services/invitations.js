import { API_URL } from './config';

/**
 * Obtiene todas las invitaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de invitaciones del usuario
 */
export const getUserInvitations = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/invitaciones/usuario/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    throw error;
  }
};

/**
 * Acepta una invitación a un partido
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const acceptInvitation = async (invitationId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/invitaciones/${invitationId}/aceptar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

/**
 * Rechaza una invitación a un partido
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const rejectInvitation = async (invitationId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/invitaciones/${invitationId}/rechazar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    throw error;
  }
};
