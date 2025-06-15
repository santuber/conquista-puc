import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const jugadasService = {
  async iniciarPartida(id_jugadores, id_creador) {
    try {
      const response = await apiClient.post('/jugadas/start-game', {
        id_jugadores,
        id_creador
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar la partida',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  async aplicarRefuerzos(id_juego, id_jugador, refuerzos, lanzar_dado = false) {
    try {
      const response = await apiClient.post('/jugadas/reinforce', {
        id_juego,
        id_jugador,
        refuerzos,
        lanzar_dado
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al aplicar refuerzos',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  async realizarAtaque(id_juego, id_jugador, facultad_origen_id, facultad_objetivo) {
    try {
      const response = await apiClient.post('/jugadas/attack', {
        id_juego,
        id_jugador,
        facultad_origen_id,
        facultad_objetivo
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al realizar ataque',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  async moverTropas(id_juego, id_jugador, facultad_origen_id, facultad_destino_id, cantidad) {
    try {
      const response = await apiClient.post('/jugadas/move', {
        id_juego,
        id_jugador,
        facultad_origen_id,
        facultad_destino_id,
        cantidad
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al mover tropas',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  async finalizarTurno(id_juego, id_jugador) {
    try {
      const response = await apiClient.post('/jugadas/end-turn', {
        id_juego,
        id_jugador
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al finalizar turno',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  async ejecutarJugada(accion, datos) {
    try {
      const response = await apiClient.post('/jugadas', {
        accion,
        ...datos
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al ejecutar jugada',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  }
};
