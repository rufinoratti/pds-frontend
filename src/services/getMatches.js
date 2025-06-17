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

    return data.data?.filter(match => match.estado === "NECESITAMOS_JUGADORES");
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
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/partidos/${matchId}/unirse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        usuarioId: userId,
        equipo: team
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

/**
 * Returns if the user left the match correctly or not
 * @param {string} matchId, userId, team - The ID of the match to fetch, the user id and the team
  returns 200 if the user left correctly or 400 if the user did not join correctly
 */
export const leaveMatch = async (matchId, userId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/partidos/${matchId}/abandonar`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        usuarioId: userId,
      })
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
    console.error("Error leaving match:", error);
    throw error;
  }
};


/**
 * Returns if the match was correctly created or not.
 * @param {string} data 
 * Returns 200 if the match was correctly created or 400 if the match was not created correctly
 */
export const createMatch = async (data) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const requestBody = {
      zonaId: data.zonaId,
      deporteId: data.deporteId,
      organizadorId: data.organizadorId,
      fecha: data.fecha,
      hora: data.hora,
      duracion: data.duracion,
      direccion: data.direccion,
      cantidadJugadores: data.cantidadJugadores,
      tipoEmparejamiento: "ZONA",
      nivelMinimo: 1,
      nivelMaximo: 3,
    }

    if (data.requiredLevel) {
      requestBody = {
        ...requestBody,
        nivelMinimo: data.levelRequired,
      }
    }

    const response = await fetch(`${API_URL}/partidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();    if (!responseData.success) {
      throw new Error(responseData.message);
    }

    const createdMatch = responseData.data;
    
    // Ejecutar emparejamiento después de crear el partido
    try {
      await executeMatching(createdMatch.id, data.tipoEmparejamiento);
      console.log("Emparejamiento ejecutado correctamente");
    } catch (matchingError) {
      console.error("Error ejecutando emparejamiento:", matchingError);
      // No lanzo el error para que la creación del partido no falle
      // El partido se creó correctamente, solo falló el emparejamiento
    }

    return createdMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
};

/**
 * Returns if the match was correctly updated or not.
 * @param {string} data 
 * Returns 200 if the match was correctly updated or 400 if the match was not updated correctly
 */
export const updateMatch = async (data) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const requestBody = {
      deporteId: data.sport,
      zonaId: data.zona,
      organizadorId: data.organizerId,
      cantidadJugadores: data.playersNeeded,
      fecha: data.fecha,
      hora: data.hora,
      duracion: data.duration / 60,
      direccion: data.direccion,
      tipoEmparejamiento: "ZONA",
    }

    const response = await fetch(`${API_URL}/partidos/${data.matchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('response', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message);
    }

    return responseData.data;
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
}


/**
 * Returns if the match was correctly ended or not.
 * @param {string} matchId 
 * Returns 200 if the match was correctly ended or 400 if the match was not ended correctly
 */
export const endMatch = async (matchId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/partidos/${matchId}/cambiar-estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nuevoEstado: "CANCELADO"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error) {
    console.error("Error ending match:", error);
    throw error;
  }
};

/**
 * Confirma un partido cambiando su estado de "ARMADO" a "CONFIRMADO"
 * @param {string} matchId - ID del partido a confirmar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const confirmMatch = async (matchId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/partidos/${matchId}/cambiar-estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nuevoEstado: "CONFIRMADO"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error) {
    console.error("Error confirming match:", error);
    throw error;
  }
};

/**
 * Ejecuta el emparejamiento para un partido específico
 * @param {string} matchId - ID del partido
 * @param {string} tipoEstrategia - Tipo de estrategia: ZONA, HISTORIAL, NIVEL
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const executeMatching = async (matchId, tipoEstrategia) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/emparejamiento/ejecutar/${matchId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tipoEstrategia: tipoEstrategia
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error) {
    console.error("Error executing matching:", error);
    throw error;
  }
};
