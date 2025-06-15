import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Board from './Board';
import Card from './Card';
import { AuthContext } from '../auth/AuthContext';
import { partidasService } from '../services/partidasService';

const estadosPartida = {
  'en_espera': 'En Espera',
  'en_juego': 'En Juego',
  'finalizada': 'Finalizada'
};

function Game() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarEstadoPartida();
    } else {
      setLoading(false);
    }
  }, [id]);

  const cargarEstadoPartida = async () => {
    try {
      const resultado = await partidasService.obtenerEstadoPartida(id);
      
      if (resultado.success) {
        setPartidaData(resultado.data);
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

  return (
    <div className="view">
      <div style={{ marginBottom: '1rem' }}>
        <h1>Partida: {partidaData?.partida?.codigo_sala}</h1>
        <p>Estado: <strong>{estadosPartida[partidaData?.partida?.estado] || partidaData?.partida?.estado}</strong></p>
        {user && partidaData?.partida?.jugador_actual_id === user.id && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>¡Es tu turno!</p>
        )}
      </div>

      <Board />
      
      {partidaData?.facultades && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Facultades Controladas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {partidaData.facultades.map((facultad) => (
              <Card 
                key={facultad.id}
                nombre={facultad.nombre}
                cantidad={Object.values(facultad.tropas).reduce((total, count) => total + count, 0)}
                controlador={facultad.controlada_por?.nombre_usuario}
                color={facultad.controlada_por?.color}
              />
            ))}
          </div>
        </div>
      )}

      {partidaData?.resumen_jugadores && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Jugadores</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {partidaData.resumen_jugadores.map((jugador) => (
              <div 
                key={jugador.usuario_id}
                style={{ 
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: jugador.color || '#f5f5f5'
                }}
              >
                <h4>{jugador.nombre_usuario}</h4>
                <p>Estado: {jugador.estado_en_partida}</p>
                <p>Tropas totales: {Object.values(jugador.tropas_totales).reduce((total, count) => total + count, 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={cargarEstadoPartida}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Actualizar Estado
        </button>
      </div>
    </div>
  );
}

export default Game;
