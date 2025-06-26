import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from './Board';
import Card from './Card';
import PanelRefuerzos from './PanelRefuerzos';
import PanelAtaques from './PanelAtaques';
import PanelMovimientos from './PanelMovimientos';
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
  const [fasesCompletadas, setFasesCompletadas] = useState({
    refuerzos: false,
    accion: false
  });
  const [accionRealizada, setAccionRealizada] = useState(null);
  const [ataquesRealizados, setAtaquesRealizados] = useState(0);
  const [maxAtaques] = useState(5);

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
        
        const jugadorAnterior = partidaData?.partida?.jugador_actual_id;
        const jugadorActual = resultado.data.partida?.jugador_actual_id;
        
        if (jugadorAnterior && jugadorAnterior !== jugadorActual) {
          setFaseActual('refuerzos');
          setFasesCompletadas({
            refuerzos: false,
            accion: false
          });
          setAccionRealizada(null);
          setAtaquesRealizados(0);
        }
        
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
        setFasesCompletadas({
          refuerzos: false,
          accion: false
        });
        setAccionRealizada(null);
        setAtaquesRealizados(0);
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
    setFasesCompletadas(prev => ({
      ...prev,
      refuerzos: true
    }));
    setFaseActual('ataques');
    cargarEstadoPartida();
  };

  const onAtaqueRealizado = (resultado) => {
    setAtaquesRealizados(prev => prev + 1);
    setFasesCompletadas(prev => ({
      ...prev,
      accion: true
    }));
    setAccionRealizada('attack');
    cargarEstadoPartida();
  };

  const onMovimientoRealizado = (resultado) => {
    setFasesCompletadas(prev => ({
      ...prev,
      accion: true
    }));
    setAccionRealizada('move');
    cargarEstadoPartida();
  };

  const cambiarFase = (nuevaFase) => {
    if (nuevaFase === 'refuerzos' && fasesCompletadas.refuerzos) {
      setError('Ya completaste la fase de refuerzos en este turno');
      return;
    }
    
    if (nuevaFase === 'ataques' && !fasesCompletadas.refuerzos) {
      setError('Debes completar la fase de refuerzos primero');
      return;
    }
    
    if (nuevaFase === 'ataques' && accionRealizada === 'move') {
      setError('Ya realizaste un movimiento en este turno. Solo puedes atacar O mover, no ambos.');
      return;
    }
    
    if (nuevaFase === 'movimientos' && !fasesCompletadas.refuerzos) {
      setError('Debes completar la fase de refuerzos primero');
      return;
    }
    
    if (nuevaFase === 'movimientos' && ataquesRealizados > 0) {
      setError('Ya realizaste ataques en este turno. Solo puedes atacar O mover, no ambos.');
      return;
    }
    
    setError('');
    setFaseActual(nuevaFase);
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
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h1>🎮 Conquista PUC</h1>
            <p>Necesitas especificar un ID de partida para jugar.</p>
            <button
              onClick={() => navigate('/partida')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              ← Volver al Gestor de Partidas
            </button>
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
              <button
                onClick={() => cambiarFase('refuerzos')}
                disabled={fasesCompletadas.refuerzos}
                className={`phase-button ${faseActual === 'refuerzos' ? 'active' : ''} ${fasesCompletadas.refuerzos ? 'completed' : ''}`}
              >
                Refuerzos {fasesCompletadas.refuerzos ? '✓' : ''}
              </button>
              
              <button
                onClick={() => cambiarFase('ataques')}
                disabled={!fasesCompletadas.refuerzos || accionRealizada === 'move'}
                className={`phase-button ${faseActual === 'ataques' ? 'active' : ''} ${
                  !fasesCompletadas.refuerzos || accionRealizada === 'move' ? 'disabled' : ''
                } ${ataquesRealizados > 0 ? 'completed' : ''}`}
              >
                Ataques ({ataquesRealizados}/{maxAtaques}) {ataquesRealizados > 0 ? '⚔️' : ''}
                {accionRealizada === 'move' ? ' (Bloqueado)' : ''}
              </button>
              
              <button
                onClick={() => cambiarFase('movimientos')}
                disabled={!fasesCompletadas.refuerzos || ataquesRealizados > 0}
                className={`phase-button ${faseActual === 'movimientos' ? 'active' : ''} ${
                  !fasesCompletadas.refuerzos || ataquesRealizados > 0 ? 'disabled' : ''
                } ${accionRealizada === 'move' ? 'completed' : ''}`}
              >
                Movimientos {accionRealizada === 'move' ? '✓' : ''}
                {ataquesRealizados > 0 ? ' (Bloqueado)' : ''}
              </button>
              
              <button
                onClick={finalizarTurno}
                disabled={finalizandoTurno}
                className={`end-turn-button ${finalizandoTurno ? 'disabled' : 'enabled'}`}
              >
                {finalizandoTurno ? 'Finalizando...' : 'Finalizar Turno'}
              </button>
            </div>

            {faseActual === 'refuerzos' && !fasesCompletadas.refuerzos && (
              <PanelRefuerzos
                partidaId={id}
                jugadorId={user.id}
                facultadesControladas={facultadesControladas}
                esMiTurno={esMiTurno}
                onRefuerzosAplicados={onRefuerzosAplicados}
              />
            )}

            {faseActual === 'refuerzos' && fasesCompletadas.refuerzos && (
              <div className="phase-panel completed">
                <h3>Refuerzos Completados</h3>
                <p>Ya completaste la fase de refuerzos en este turno.</p>
              </div>
            )}

            {faseActual === 'ataques' && fasesCompletadas.refuerzos && accionRealizada !== 'move' && (
              <PanelAtaques
                partidaId={id}
                jugadorId={user.id}
                facultadesControladas={facultadesControladas}
                todasLasFacultades={partidaData?.facultades}
                esMiTurno={esMiTurno}
                onAtaqueRealizado={onAtaqueRealizado}
                ataquesRealizados={ataquesRealizados}
                maxAtaques={maxAtaques}
              />
            )}

            {faseActual === 'ataques' && !fasesCompletadas.refuerzos && (
              <div className="phase-panel blocked">
                <h3>Fase de Ataques</h3>
                <p>Debes completar la fase de refuerzos primero.</p>
              </div>
            )}

            {faseActual === 'ataques' && accionRealizada === 'move' && (
              <div className="phase-panel blocked">
                <h3>Fase de Ataques</h3>
                <p>Ya realizaste un movimiento en este turno. Solo puedes atacar O mover, no ambos.</p>
              </div>
            )}

            {faseActual === 'movimientos' && fasesCompletadas.refuerzos && ataquesRealizados === 0 && accionRealizada !== 'move' && (
              <PanelMovimientos
                partidaId={id}
                jugadorId={user.id}
                facultadesControladas={facultadesControladas}
                esMiTurno={esMiTurno}
                onMovimientoRealizado={onMovimientoRealizado}
                accionYaRealizada={accionRealizada === 'move'}
              />
            )}

            {faseActual === 'movimientos' && !fasesCompletadas.refuerzos && (
              <div className="phase-panel blocked">
                <h3>Fase de Movimientos</h3>
                <p>Debes completar la fase de refuerzos primero.</p>
              </div>
            )}

            {faseActual === 'movimientos' && ataquesRealizados > 0 && (
              <div className="phase-panel blocked">
                <h3>Fase de Movimientos</h3>
                <p>Ya realizaste {ataquesRealizados} ataque{ataquesRealizados > 1 ? 's' : ''} en este turno. Solo puedes atacar O mover, no ambos.</p>
              </div>
            )}

            {faseActual === 'movimientos' && accionRealizada === 'move' && (
              <div className="phase-panel completed">
                <h3>Movimiento Completado</h3>
                <p>Ya realizaste un movimiento en este turno.</p>
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
                        {participante.usuario_id === partidaData?.partida?.jugador_actual_id && ' (TURNO ACTUAL)'}
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
