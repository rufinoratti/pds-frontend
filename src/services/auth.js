import { API_URL } from "./config.js";
import { requestFirebaseToken } from "./firebase.js";

/**
 * Authentication service to handle user registration, login, and token management
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.nombre - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {number} userData.nivel - User's skill level (1-5)
 * @param {string} userData.zonaId - Zone ID where the user is located
 * @param {string} userData.deporteId - Sport ID that the user practices
 * @returns {Promise<Object>} Registration response
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error en el registro');
    }

    return data;
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error en el login');
    }    // Store token in localStorage if login is successful
    // El token está en data.data.token según la estructura del backend
    if (data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      console.log("Token almacenado en localStorage:", data.data.token);
        // Generar y enviar token de Firebase para notificaciones push
      try {
        const firebaseToken = await requestFirebaseToken();
        if (firebaseToken && data.data && data.data.user && data.data.user.id) {
          console.log("Generando token de Firebase...");
          await updateFirebaseToken(firebaseToken, data.data.user.id);
          console.log("Token de Firebase actualizado en el backend");
        }
      } catch (firebaseError) {
        // No fallar el login si Firebase falla, solo logear el error
        console.warn("Error configurando Firebase token:", firebaseError);
      }
    }

    return data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

/**
 * Logout user by removing token from localStorage
 */
export const logout = () => {
  try {
    localStorage.removeItem('authToken');
    return { success: true, message: 'Sesión cerrada exitosamente' };
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

/**
 * Get stored authentication token
 * @returns {string|null} Authentication token or null if not found
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
};

/**
 * Make authenticated request to protected endpoint
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const finalOptions = {
    ...options,
    headers: defaultOptions.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
    
    // If token is invalid, logout user
    if (response.status === 401) {
      logout();
      throw new Error('Token inválido o expirado');
    }

    return response;
  } catch (error) {
    console.error("Error in authenticated request:", error);
    throw error;
  }
};

/**
 * Test protected endpoint access
 * @returns {Promise<Object>} Protected endpoint response
 */
export const testProtectedEndpoint = async () => {
  try {
    const response = await authenticatedRequest('/auth/protected');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error accessing protected endpoint:", error);
    throw error;
  }
};

/**
 * Update Firebase token in the backend
 * @param {string} firebaseToken - Firebase messaging token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update response
 */
export const updateFirebaseToken = async (firebaseToken, userId) => {
  try {
    // La ruta según el backend es PUT /usuarios/:usuarioId/firebase-token
    const response = await authenticatedRequest(`/usuarios/${userId}/firebase-token`, {
      method: 'PUT',
      body: JSON.stringify({ firebaseToken }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error actualizando token de Firebase');
    }

    return data;
  } catch (error) {
    console.error("Error updating Firebase token:", error);
    throw error;
  }
};
