import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from './Board';
import Card from './Card';
import PanelRefuerzos from './PanelRefuerzos';
import { AuthContext } from '../auth/AuthContext';
import { partidasService } from '../services/partidasService';
import { jugadasService } from '../services/jugadasService';
import { ESTADOS_PARTIDA } from '../constants/gameConstants';
import './Game.css';

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
      <div className="partida-container">
        <div className="loading-view">
          <h2>Cargando partida...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="partida-container">
        <div className="error-view">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="partida-container">
        <div className="game-container">
          <h1>Partida Demo</h1>
          <Board />
          <div className="demo-cards">
            <Card nombre="Facultad de Ingeniería" cantidad={3} />
            <Card nombre="Facultad de Derecho" cantidad={2} />
            <Card nombre="Facultad de Medicina" cantidad={5} />
          </div>
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
    <div className="partida-container">
      <div className="game-container">
        <div className="game-header">
          <div className="game-header-content">
            <div>
              <h1 className="game-title">Conquista PUC - {partidaData?.partida?.codigo_sala}</h1>
              <p className="game-status">
                Estado: <strong>{estadosPartida[partidaData?.partida?.estado] || partidaData?.partida?.estado}</strong>
              </p>
            </div>
            
            <div className="turn-info">
              {esMiTurno ? (
                <div>
                  <p className="my-turn">¡Es tu turno!</p>
                  <div className="turn-phase">
                    Fase: <strong>{faseActual}</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="other-turn">
                    Turno de: <strong>{jugadorActual?.nombre_usuario || 'Desconocido'}</strong>
                  </p>
                  <div className="turn-waiting">Esperando...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {esMiTurno && (
          <div className="controls-panel">
            <div className="phase-buttons">
              {['refuerzos', 'ataques', 'movimientos'].map((fase) => (
                <button
                  key={fase}
                  onClick={() => setFaseActual(fase)}
                  className={`phase-button ${faseActual === fase ? 'active' : 'inactive'}`}
                >
                  {fase}
                </button>
              ))}
              
              <button
                onClick={finalizarTurno}
                disabled={finalizandoTurno}
                className={`end-turn-button ${finalizandoTurno ? 'disabled' : 'enabled'}`}
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
              <div className="phase-panel not-implemented">
                <h3>Panel de Ataques</h3>
                <p className="warning-text">no implementado aun</p>
              </div>
            )}

            {faseActual === 'movimientos' && (
              <div className="phase-panel not-implemented">
                <h3>Panel de Movimientos</h3>
                <p className="warning-text">no implementado aun</p>
              </div>
            )}
          </div>
        )}

        <Board />
        
        {partidaData?.facultades && (
          <div className="facultades-section">
            <h3>Facultades en el Juego</h3>
            <div className="facultades-grid">
              {partidaData.facultades.map((facultad) => (
                <Card 
                  key={facultad.id}
                  nombre={facultad.nombre}
                  tropas={facultad.tropas}
                  controlador={facultad.controlada_por?.nombre_usuario}
                  color={facultad.controlada_por?.color}
                  campus={facultad.campus_nombre}
                />
              ))}
            </div>
          </div>
        )}

        {participantes.length > 0 && (
          <div className="players-section">
            <h3>Jugadores</h3>
            <div className="players-grid">
              {participantes.map((participante) => (
                <div 
                  key={participante.usuario_id}
                  className={`player-card ${
                    participante.usuario_id === user?.id ? 'current-player' : ''
                  } ${
                    participante.usuario_id === partidaData?.partida?.jugador_actual_id ? 'active-turn' : ''
                  }`}
                >
                  <div className="player-info">
                    <div 
                      className="player-color"
                      style={{ backgroundColor: participante.color || '#6c757d' }}
                    />
                    <div>
                      <div className="player-name">
                        {participante.nombre_usuario}
                        {participante.usuario_id === user?.id && ' (TÚ)'}
                        {participante.usuario_id === partidaData?.partida?.jugador_actual_id && ' 🎯'}
                      </div>
                      <div className="player-order">
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
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
