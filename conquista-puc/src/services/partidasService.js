import axios from 'axios';
import { participantesService } from './participantesService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

//configurar interceptor para incluir el token automaticamente
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

export const partidasService = {
  //crear una nueva partida
  async crearPartida(partidaData) {
    try {
      const response = await apiClient.post('/partidas', partidaData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Error al crear la partida',
        details: error.response?.data?.details || null,
        status: error.response?.status
      };
    }
  },

  //obtener todas las partidas
  async obtenerPartidas() {
    try {
      const response = await apiClient.get('/partidas');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener las partidas',
      };
    }
  },

  //obtener una partida por ID
  async obtenerPartidaPorId(partidaId) {
    try {
      const response = await apiClient.get(`/partidas/${partidaId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener la partida',
      };
    }
  },

  //obtener el estado de una partida
  async obtenerEstadoPartida(partidaId) {
    try {
      const response = await apiClient.get(`/partidas/${partidaId}/estado`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el estado de la partida',
      };
    }
  },

  //obtener tropas de una partida
  async obtenerTropasPartida(partidaId) {
    try {
      const response = await apiClient.get(`/partidas/${partidaId}/tropas`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener las tropas de la partida',
      };
    }
  },

  //actualizar partida
  async actualizarPartida(partidaId, datos) {
    try {
      const response = await apiClient.put(`/partidas/${partidaId}`, datos);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar la partida',
        details: error.response?.data?.details || null,
      };
    }
  },

  //buscar partida por codigo de sala
  async buscarPartidaPorCodigo(codigoSala) {
    try {
      const response = await apiClient.get('/partidas');
      const partidas = response.data;
      const partidaEncontrada = partidas.find(p => p.codigo_sala === codigoSala.toUpperCase());
      
      if (!partidaEncontrada) {
        return {
          success: false,
          error: 'No se encontro ninguna partida con ese codigo'
        };
      }
      
      return {
        success: true,
        data: partidaEncontrada,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al buscar la partida',
      };
    }
  },

  //unirse a una partida
  async unirseAPartida(partidaId, usuarioId) {
    try {
      //verificar si ya esta participando
      const verificacion = await participantesService.verificarParticipacion(partidaId, usuarioId);
      
      if (!verificacion.success) {
        return {
          success: false,
          error: 'Error al verificar participacion existente'
        };
      }
      
      if (verificacion.yaParticipa) {
        return {
          success: false,
          error: 'Ya estas participando en esta partida'
        };
      }
      
      //obtener informacion de la partida
      const partidaInfo = await this.obtenerPartidaPorId(partidaId);
      if (!partidaInfo.success) {
        return {
          success: false,
          error: 'No se pudo obtener informacion de la partida'
        };
      }
      
      //verificar que la partida este en estado "en_espera"
      if (partidaInfo.data.estado !== 'en_espera') {
        return {
          success: false,
          error: 'La partida ya ha comenzado o ha finalizado'
        };
      }
      
      //verificar limite de jugadores (maximo 4)
      const participantesActuales = verificacion.participantes;
      if (participantesActuales.length >= 4) {
        return {
          success: false,
          error: 'La partida esta llena (maximo 4 jugadores)'
        };
      }
      
      //crear el participante
      const participanteData = {
        usuario_id: usuarioId,
        partida_id: partidaId,
        estado_en_partida: 'jugando',
        color: participantesService.generarColorAleatorio(),
        orden_turno: participantesService.calcularProximoOrdenTurno(participantesActuales)
      };
      
      const resultado = await participantesService.crearParticipante(participanteData);
      
      if (resultado.success) {
        return {
          success: true,
          data: resultado.data,
          message: 'Te has unido exitosamente a la partida'
        };
      } else {
        return {
          success: false,
          error: resultado.error || 'Error al unirse a la partida'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado al unirse a la partida',
      };
    }
  },

  //obtener participantes de una partida
  async obtenerParticipantes(partidaId) {
    try {
      const response = await apiClient.get(`/partidas/${partidaId}/estado`);
      
      return {
        success: true,
        data: response.data.resumen_jugadores || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener participantes',
      };
    }
  },

  // cancelar una partida (solo creador)
  async cancelarPartida(partidaId) {
    try {
      const response = await apiClient.post(`/partidas/${partidaId}/cancelar`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cancelar la partida',
        details: error.response?.data?.details || null,
        status: error.response?.status,
      };
    }
  },

  // salir de una partida (jugador normal)
  async salirDePartida(partidaId) {
    try {
      const response = await apiClient.post(`/partidas/${partidaId}/salir`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al salir de la partida',
        details: error.response?.data?.details || null,
        status: error.response?.status,
      };
    }
  },
};
