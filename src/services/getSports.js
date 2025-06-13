import { API_URL } from "./config";

/**
 * Returns a list of all available sports in the application
 * @returns {Promise<string[]>} A promise that resolves to an array of sport names
 */
export const getSports = async () => {
  console.log(`${API_URL}/deportes`);
    try {
    const response = await fetch(`${API_URL}/deportes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching sports:", error);
    throw error;
  }
};
