import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from './Board';
import Card from './Card';
import PanelRefuerzos from './PanelRefuerzos';
import { AuthContext } from '../auth/AuthContext';
import { partidasService } from '../services/partidasService';
import { jugadasService } from '../services/jugadasService';
import { ESTADOS_PARTIDA } from '../constants/gameConstants';

const estadosPartida = {
  'en_espera': 'En Espera',
  'en_juego': 'En Juego',
  'finalizada': 'Finalizada'
};

function Game() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalizandoTurno, setFinalizandoTurno] = useState(false);
  const [faseActual, setFaseActual] = useState('refuerzos');

  useEffect(() => {
    if (id) {
      cargarEstadoPartida();
      const interval = setInterval(cargarEstadoPartida, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [id]);

  const cargarEstadoPartida = async () => {
    try {
      const resultado = await partidasService.obtenerEstadoPartida(id);
      
      if (resultado.success) {
        console.log('DEBUG: Estado completo de la partida:', resultado.data);
        console.log('DEBUG: Facultades controladas raw:', resultado.data.facultades_controladas);
        console.log('DEBUG: User ID:', user?.id);
        setPartidaData(resultado.data);
        
        if (resultado.data.partida.estado === ESTADOS_PARTIDA.EN_ESPERA) {
          navigate(`/partida/${id}`);
        }
      } else {
        setError(resultado.error);
      }
    } catch (error) {
      setError('Error al cargar el estado de la partida');
      console.error('Error loading game state:', error);
    } finally {
      setLoading(false);
    }
  };

  const finalizarTurno = async () => {
    if (!user || partidaData?.partida?.jugador_actual_id !== user.id) {
      setError('No es tu turno');
      return;
    }

    setFinalizandoTurno(true);
    setError('');

    try {
      const resultado = await jugadasService.finalizarTurno(id, user.id);

      if (resultado.success) {
        setFaseActual('refuerzos');
        await cargarEstadoPartida();
      } else {
        setError(resultado.error || 'Error al finalizar turno');
      }
    } catch (error) {
      setError('Error inesperado al finalizar turno');
    } finally {
      setFinalizandoTurno(false);
    }
  };

  const onRefuerzosAplicados = (resultado) => {
    cargarEstadoPartida();
    setFaseActual('ataques');
  };

  if (loading) {
    return (
      <div className="view" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Cargando partida...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="view">
        <h1>Partida Demo</h1>
        <Board />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem', gap: '1rem' }}>
          <Card nombre="Facultad de Ingeniería" cantidad={3} />
          <Card nombre="Facultad de Derecho" cantidad={2} />
          <Card nombre="Facultad de Medicina" cantidad={5} />
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="view">
        <h1>Partida Demo</h1>
        <Board />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem', gap: '1rem' }}>
          <Card nombre="Facultad de Ingeniería" cantidad={3} />
          <Card nombre="Facultad de Derecho" cantidad={2} />
          <Card nombre="Facultad de Medicina" cantidad={5} />
        </div>
      </div>
    );
  }

  const esMiTurno = user && partidaData?.partida?.jugador_actual_id === user.id;
  const participantes = partidaData?.resumen_jugadores || [];
  const jugadorActual = participantes.find(p => p.usuario_id === partidaData?.partida?.jugador_actual_id);
  
  let facultadesControladas = [];
  
  if (partidaData?.facultades_controladas) {
    facultadesControladas = partidaData.facultades_controladas.filter(
      fc => fc.participante_usuario_id === user?.id || 
            fc.usuario_id === user?.id || 
            fc.controlada_por_usuario_id === user?.id ||
            fc.participante?.usuario_id === user?.id
    );
  } else if (partidaData?.facultades) {
    facultadesControladas = partidaData.facultades.filter(
      f => f.controlada_por?.usuario_id === user?.id ||
           f.participante_usuario_id === user?.id ||
           f.usuario_id === user?.id
    );
  }

  return (
    <div className="view">
      <div style={{ 
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Conquista PUC - {partidaData?.partida?.codigo_sala}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
              Estado: <strong>{estadosPartida[partidaData?.partida?.estado] || partidaData?.partida?.estado}</strong>
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            {esMiTurno ? (
              <div>
                <p style={{ 
                  margin: '0 0 10px 0', 
                  color: '#28a745', 
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  ¡Es tu turno!
                </p>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  Fase: <strong>{faseActual}</strong>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 5px 0', color: '#dc3545' }}>
                  Turno de: <strong>{jugadorActual?.nombre_usuario || 'Desconocido'}</strong>
                </p>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  Esperando...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {esMiTurno && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '1rem',
            padding: '10px',
            backgroundColor: '#e9ecef',
            borderRadius: '6px'
          }}>
            {['refuerzos', 'ataques', 'movimientos'].map((fase) => (
              <button
                key={fase}
                onClick={() => setFaseActual(fase)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: faseActual === fase ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {fase}
              </button>
            ))}
            
            <button
              onClick={finalizarTurno}
              disabled={finalizandoTurno}
              style={{
                padding: '8px 16px',
                backgroundColor: finalizandoTurno ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: finalizandoTurno ? 'not-allowed' : 'pointer',
                marginLeft: 'auto'
              }}
            >
              {finalizandoTurno ? 'Finalizando...' : 'Finalizar Turno'}
            </button>
          </div>

          {faseActual === 'refuerzos' && (
            <PanelRefuerzos
              partidaId={id}
              jugadorId={user.id}
              facultadesControladas={facultadesControladas}
              esMiTurno={esMiTurno}
              onRefuerzosAplicados={onRefuerzosAplicados}
            />
          )}

          {faseActual === 'ataques' && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeeba',
              textAlign: 'center'
            }}>
              <h3>Panel de Ataques</h3>
              <p style={{ color: '#856404' }}>no implementado aun</p>
            </div>
          )}

          {faseActual === 'movimientos' && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeeba',
              textAlign: 'center'
            }}>
              <h3>Panel de Movimientos</h3>
              <p style={{ color: '#856404' }}>no implementado aun</p>
            </div>
          )}
        </div>
      )}

      <Board />
      
      {partidaData?.facultades && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Facultades en el Juego</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {partidaData.facultades.map((facultad) => (
              <Card 
                key={facultad.id}
                nombre={facultad.nombre}
                cantidad={Object.values(facultad.tropas || {}).reduce((total, count) => total + count, 0)}
                controlador={facultad.controlada_por?.nombre_usuario}
                color={facultad.controlada_por?.color}
                campus={facultad.campus_nombre}
              />
            ))}
          </div>
        </div>
      )}

      {participantes.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Jugadores</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {participantes.map((participante) => (
              <div 
                key={participante.usuario_id}
                style={{
                  padding: '12px',
                  backgroundColor: participante.usuario_id === user?.id ? '#e8f5e8' : '#f8f9fa',
                  borderRadius: '6px',
                  border: participante.usuario_id === partidaData?.partida?.jugador_actual_id 
                    ? '3px solid #ffc107' 
                    : '1px solid #dee2e6'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: participante.color || '#6c757d'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {participante.nombre_usuario}
                      {participante.usuario_id === user?.id && ' (TÚ)'}
                      {participante.usuario_id === partidaData?.partida?.jugador_actual_id && ' 🎯'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Orden: {participante.orden_turno}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          margin: '1rem 0',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default Game;
