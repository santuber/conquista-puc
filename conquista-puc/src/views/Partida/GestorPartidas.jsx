import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { partidasService } from '../../services/partidasService';
import { ESTADOS_PARTIDA } from '../../constants/gameConstants';
import './basepartida.css';
import './gestorpartidas.css';

function GestorPartidas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [partidasActivas, setPartidasActivas] = useState([]);
  const [partidasFinalizadas, setPartidasFinalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vistaActual, setVistaActual] = useState('activas');

  useEffect(() => {
    cargarPartidas();
    // Actualizar cada 10 segundos para ver cambios en partidas activas
    const interval = setInterval(() => {
      if (vistaActual === 'activas') {
        cargarPartidas();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [user?.id, vistaActual]);

  const cargarPartidas = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resultado = await partidasService.obtenerPartidas();
      
      if (resultado.success) {
        const todasPartidas = resultado.data;
        
        // Función para verificar si el usuario participa en una partida
        const usuarioParticipa = (partida) => {
          // Es el creador
          if (partida.creador_id === user.id) {
            return true;
          }
          
          // Verificar en participantes (ajusta según la estructura real que viste)
          if (partida.participantes && Array.isArray(partida.participantes)) {
            return partida.participantes.some(part => 
              part.usuario_id === user.id || part.id === user.id
            );
          }
          
          // Verificar en resumen_jugadores (si existe)
          if (partida.resumen_jugadores && Array.isArray(partida.resumen_jugadores)) {
            return partida.resumen_jugadores.some(jugador => 
              jugador.usuario_id === user.id || jugador.id === user.id
            );
          }
          
          return false;
        };
        
        const activas = todasPartidas.filter(p => {
          const esActiva = p.estado === ESTADOS_PARTIDA.EN_ESPERA || p.estado === ESTADOS_PARTIDA.EN_JUEGO;
          const participa = usuarioParticipa(p);
          return esActiva && participa;
        });
        
        const finalizadas = todasPartidas.filter(p => {
          const esFinalizada = p.estado === ESTADOS_PARTIDA.FINALIZADA;
          const participa = usuarioParticipa(p);
          return esFinalizada && participa;
        });

        setPartidasActivas(activas);
        setPartidasFinalizadas(finalizadas);
        setError('');
      } else {
        console.error('Error del backend:', resultado.error);
        setError(resultado.error || 'Error al cargar partidas');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setError('Error inesperado al cargar partidas');
    } finally {
      setLoading(false);
    }
  };

  const unirseAPartida = (partida) => {
    if (partida.estado === ESTADOS_PARTIDA.EN_ESPERA) {
      navigate(`/partida/${partida.id}`);
    } else if (partida.estado === ESTADOS_PARTIDA.EN_JUEGO) {
      navigate(`/juego/${partida.id}`);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      [ESTADOS_PARTIDA.EN_ESPERA]: 'Esperando jugadores',
      [ESTADOS_PARTIDA.EN_JUEGO]: 'En juego',
      [ESTADOS_PARTIDA.FINALIZADA]: 'Finalizada'
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    const colores = {
      [ESTADOS_PARTIDA.EN_ESPERA]: '#ffc107',
      [ESTADOS_PARTIDA.EN_JUEGO]: '#28a745',
      [ESTADOS_PARTIDA.FINALIZADA]: '#6c757d'
    };
    return colores[estado] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="partida-container">
        <div className="gestor-loading-container">
          <h1>Cargando tus partidas...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="partida-container">
      <div className="gestor-main-container">
        <div className="gestor-header">
          <h1>Gestor de Partidas</h1>
          <p>Administra tus partidas activas y revisa tu historial</p>
        </div>

        {/* Navegación de pestañas */}
        <div className="gestor-tabs">
          <button
            onClick={() => setVistaActual('activas')}
            className={`gestor-tab-button ${vistaActual === 'activas' ? 'active' : 'inactive'}`}
          >
            Partidas Activas ({partidasActivas.length})
          </button>
          <button
            onClick={() => setVistaActual('historial')}
            className={`gestor-tab-button ${vistaActual === 'historial' ? 'active' : 'inactive'}`}
          >
            Historial ({partidasFinalizadas.length})
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="gestor-quick-actions">
          <button
            onClick={() => navigate('/crear-partida')}
            className="gestor-action-button create"
          >
            ➕ Crear Nueva Partida
          </button>
          <button
            onClick={() => navigate('/unirse-partida')}
            className="gestor-action-button search"
          >
            🔍 Buscar Partida
          </button>
          <button
            onClick={cargarPartidas}
            disabled={loading}
            className={`gestor-action-button refresh ${loading ? 'loading' : ''}`}
          >
            🔄 {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Vista de Partidas Activas */}
        {vistaActual === 'activas' && (
          <div>
            <h2>Partidas Activas</h2>
            {partidasActivas.length === 0 ? (
              <div className="gestor-empty-state">
                <h3>📝 No tienes partidas activas</h3>
                <p>Crea una nueva partida o únete a una existente para comenzar a jugar</p>
              </div>
            ) : (
              <div className="gestor-partidas-grid">
                {partidasActivas.map((partida) => (
                  <div key={partida.id} className="gestor-partida-card">
                    <div className="gestor-partida-header">
                      <h3>🎮 {partida.codigo_sala}</h3>
                      <span 
                        className="gestor-estado-badge"
                        style={{ backgroundColor: getEstadoColor(partida.estado) }}
                      >
                        {getEstadoTexto(partida.estado)}
                      </span>
                    </div>
                    
                    <div className="gestor-partida-info">
                      <p><strong>Jugadores:</strong> {partida.cantidad_jugadores || 0}/4</p>
                      <p><strong>Creada:</strong> {formatearFecha(partida.fecha_creacion)}</p>
                      {partida.estado === ESTADOS_PARTIDA.EN_JUEGO && partida.jugador_actual && (
                        <p><strong>Turno actual:</strong> {partida.jugador_actual}</p>
                      )}
                    </div>

                    <button
                      onClick={() => unirseAPartida(partida)}
                      className={`gestor-partida-button ${partida.estado === ESTADOS_PARTIDA.EN_ESPERA ? 'espera' : 'juego'}`}
                    >
                      {partida.estado === ESTADOS_PARTIDA.EN_ESPERA ? '🚪 Ir al Lobby' : '⚔️ Continuar Juego'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista de Historial */}
        {vistaActual === 'historial' && (
          <div>
            <h2>Historial de Partidas</h2>
            {partidasFinalizadas.length === 0 ? (
              <div className="gestor-empty-state">
                <h3>📚 No tienes partidas finalizadas</h3>
                <p>Cuando completes partidas, aparecerán aquí con sus resultados</p>
              </div>
            ) : (
              <div className="gestor-partidas-grid">
                {partidasFinalizadas.map((partida) => (
                  <div key={partida.id} className="gestor-partida-card finalizada">
                    <div className="gestor-partida-header">
                      <h3>🏆 {partida.codigo_sala}</h3>
                      <span className="gestor-estado-badge" style={{ backgroundColor: '#6c757d' }}>
                        Finalizada
                      </span>
                    </div>
                    
                    <div className="gestor-partida-info">
                      <p><strong>Jugadores:</strong> {partida.cantidad_jugadores || 0}</p>
                      <p><strong>Iniciada:</strong> {formatearFecha(partida.fecha_creacion)}</p>
                      {partida.fecha_finalizacion && (
                        <p><strong>Finalizada:</strong> {formatearFecha(partida.fecha_finalizacion)}</p>
                      )}
                      {partida.ganador && (
                        <p><strong>🥇 Ganador:</strong> {partida.ganador}</p>
                      )}
                    </div>

                    <button
                      onClick={() => console.log('Ver detalles:', partida)}
                      className="gestor-partida-button detalles"
                    >
                      📊 Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="gestor-error-message">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestorPartidas;
