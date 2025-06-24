import { API_URL } from "./config";

/**
 * Returns a list of all available sports in the application
 * @returns {Matches[]} An array of sport names
 */
export const getAllMatches = async () => {
    try {
    const response = await fetch(`${API_URL}/partidos`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }
    console.log('data', data.data);
    return data.data?.filter(match => match.estado !== "FINALIZADO" && match.estado !== "CANCELADO");
  } catch (error) {
    console.error("Error fetching all matches:", error);
    throw error;
  }
};
