import { API_URL } from "./config.js";

/**
 * Service to handle zones data
 */

/**
 * Get all available zones
 * @returns {Promise<Array>} Array of zones
 */
export const getAllZones = async () => {
  try {
    const response = await fetch(`${API_URL}/zonas`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener las zonas');
    }
    
    return data.data;
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw error;
  }
};
