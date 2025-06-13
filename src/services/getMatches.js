import { API_URL } from "./config";

/**
 * Returns all matches from the API
 * @returns {Promise<Array>} A promise that resolves to an array of matches
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

    return data.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

/**
 * Returns a specific match by ID
 * @param {string} matchId - The ID of the match to fetch
 * @returns {Promise<Object>} A promise that resolves to a match object
 */
export const getMatchById = async (matchId) => {
  try {
    const response = await fetch(`${API_URL}/partidos/${matchId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching match:", error);
    throw error;
  }
}; 


/**
 * Returns if the user joined correctly or not
 * @param {string} matchId, userId, team - The ID of the match to fetch, the user id and the team
  returns 200 if the user joined correctly or 400 if the user did not join correctly
 */
export const joinMatch = async (matchId, userId, team) => {
  try {
    const response = await fetch(`${API_URL}/partidos/${matchId}/unirse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuarioId:userId,
        equipo:team
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message); 
    }

    return data.data;
  } catch (error) {
    console.error("Error joining match:", error);
    throw error;
  }
};
