import { API_URL } from "./config.js";

/**
 * Authentication service to handle user registration, login, and token management
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.name - User's name
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
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error en el login');
    }

    // Store token in localStorage if login is successful
    if (data.token) {
      localStorage.setItem('authToken', data.token);
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
    const response = await authenticatedRequest('/api/auth/protected');
    
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
