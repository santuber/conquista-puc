import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

//reutilizar el cliente configurado
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

export const participantesService = {
  //obtener participantes de una partida
  async obtenerParticipantesPorPartida(partidaId) {
    try {
      const response = await apiClient.get(`/participantes/partida/${partidaId}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener participantes',
      };
    }
  },

  //obtener participantes de un usuario
  async obtenerParticipantesPorUsuario(usuarioId) {
    try {
      const response = await apiClient.get(`/participantes?usuario_id=${usuarioId}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener participaciones',
      };
    }
  },

  //crear nuevo participante (unirse a partida)
  async crearParticipante(participanteData) {
    try {
      const response = await apiClient.post('/participantes', participanteData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al unirse a la partida',
        details: error.response?.data?.details || null,
      };
    }
  },

  //salir de una partida (eliminar participante)
  async salirDePartida(participanteId, usuarioId) {
    try {
      const response = await apiClient.delete(`/participantes/${participanteId}`, {
        data: { usuarioId }
      });
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al salir de la partida',
      };
    }
  },

  //verificar si un usuario ya esta en una partida
  async verificarParticipacion(partidaId, usuarioId) {
    try {
      const resultado = await this.obtenerParticipantesPorPartida(partidaId);
      
      if (resultado.success) {
        const yaParticipa = resultado.data.some(p => p.usuario_id === usuarioId);
        
        return {
          success: true,
          yaParticipa: yaParticipa,
          participantes: resultado.data
        };
      } else {
        return {
          success: false,
          error: resultado.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al verificar participacion',
      };
    }
  },

  //generar color aleatorio para el participante
  generarColorAleatorio() {
    const colores = [
      '#FF5722', '#E91E63', '#9C27B0', '#673AB7',
      '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFC107', '#FF9800', '#795548', '#607D8B'
    ];
    
    return colores[Math.floor(Math.random() * colores.length)];
  },

  //calcular proximo orden de turno
  calcularProximoOrdenTurno(participantesExistentes) {
    if (!participantesExistentes || participantesExistentes.length === 0) {
      return 1;
    }
    
    const maxOrden = Math.max(...participantesExistentes.map(p => p.orden_turno || 0));
    return maxOrden + 1;
  }
};
