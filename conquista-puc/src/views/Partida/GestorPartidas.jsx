import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { partidasService } from '../../services/partidasService';
import { ESTADOS_PARTIDA } from '../../constants/gameConstants';
import './basepartida.css';

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
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id, vistaActual]);

  const cargarPartidas = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Por ahora usamos todas las partidas y filtramos
      // Más adelante se puede implementar el endpoint específico
      const resultado = await partidasService.obtenerPartidas();
      
      if (resultado.success) {
        // Filtrar partidas donde el usuario participa (esto se debería hacer en el backend)
        const todasPartidas = resultado.data;
        
        const activas = todasPartidas.filter(p => 
          (p.estado === ESTADOS_PARTIDA.EN_ESPERA || p.estado === ESTADOS_PARTIDA.EN_JUEGO) &&
          (p.creador_id === user.id) // Por ahora solo partidas creadas por el usuario
        );
        
        const finalizadas = todasPartidas.filter(p => 
          p.estado === ESTADOS_PARTIDA.FINALIZADA &&
          (p.creador_id === user.id) // Por ahora solo partidas creadas por el usuario
        );

        setPartidasActivas(activas);
        setPartidasFinalizadas(finalizadas);
        setError('');
      } else {
        setError(resultado.error || 'Error al cargar partidas');
      }
    } catch (error) {
      setError('Error inesperado al cargar partidas');
      console.error('Error loading partidas:', error);
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
        <div style={{ 
          maxWidth: '1200px', 
          margin: '2rem auto', 
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1>Cargando tus partidas...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="partida-container">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '2rem auto', 
        padding: '2rem',
        backgroundColor: 'rgba(248, 249, 250, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>Gestor de Partidas</h1>
          <p>Administra tus partidas activas y revisa tu historial</p>
        </div>

        {/* Navegación de pestañas */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setVistaActual('activas')}
            style={{
              padding: '12px 24px',
              backgroundColor: vistaActual === 'activas' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Partidas Activas ({partidasActivas.length})
          </button>
          <button
            onClick={() => setVistaActual('historial')}
            style={{
              padding: '12px 24px',
              backgroundColor: vistaActual === 'historial' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Historial ({partidasFinalizadas.length})
          </button>
        </div>

        {/* Acciones rápidas */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '3rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/crear-partida')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            ➕ Crear Nueva Partida
          </button>
          <button
            onClick={() => navigate('/unirse-partida')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🔍 Buscar Partida
          </button>
          <button
            onClick={cargarPartidas}
            disabled={loading}
            style={{
              padding: '15px 30px',
              backgroundColor: loading ? '#6c757d' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🔄 {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Vista de Partidas Activas */}
        {vistaActual === 'activas' && (
          <div>
            <h2>Partidas Activas</h2>
            {partidasActivas.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <h3>📝 No tienes partidas activas</h3>
                <p>Crea una nueva partida o únete a una existente para comenzar a jugar</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: '20px', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' 
              }}>
                {partidasActivas.map((partida) => (
                  <div key={partida.id} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <h3 style={{ margin: 0 }}>🎮 {partida.codigo_sala}</h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getEstadoColor(partida.estado)
                      }}>
                        {getEstadoTexto(partida.estado)}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6c757d' }}>
                      <p><strong>Jugadores:</strong> {partida.cantidad_jugadores || 0}/4</p>
                      <p><strong>Creada:</strong> {formatearFecha(partida.fecha_creacion)}</p>
                      {partida.estado === ESTADOS_PARTIDA.EN_JUEGO && partida.jugador_actual && (
                        <p><strong>Turno actual:</strong> {partida.jugador_actual}</p>
                      )}
                    </div>

                    <button
                      onClick={() => unirseAPartida(partida)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: partida.estado === ESTADOS_PARTIDA.EN_ESPERA ? '#007bff' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
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
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <h3>📚 No tienes partidas finalizadas</h3>
                <p>Cuando completes partidas, aparecerán aquí con sus resultados</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: '20px', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' 
              }}>
                {partidasFinalizadas.map((partida) => (
                  <div key={partida.id} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    opacity: 0.8
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <h3 style={{ margin: 0 }}>🏆 {partida.codigo_sala}</h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#6c757d'
                      }}>
                        Finalizada
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6c757d' }}>
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
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
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
          <div style={{
            padding: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginTop: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestorPartidas;
