import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { partidasService } from '../../services/partidasService';
import { jugadasService } from '../../services/jugadasService';
import { ESTADOS_PARTIDA } from '../../constants/gameConstants';

function LobbyPartida() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iniciandoPartida, setIniciandoPartida] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      cargarEstadoPartida();
      // Actualizar cada 3 segundos para ver nuevos jugadores
      const interval = setInterval(cargarEstadoPartida, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const cargarEstadoPartida = async () => {
    try {
      // Obtener tanto el estado como los detalles de la partida para tener el creador_id
      const [resultadoEstado, resultadoPartida] = await Promise.all([
        partidasService.obtenerEstadoPartida(id),
        partidasService.obtenerPartidaPorId(id)
      ]);
      
      if (resultadoEstado.success && resultadoPartida.success) {
        // Combinar los datos para tener toda la información
        const datosCompletos = {
          ...resultadoEstado.data,
          partida: {
            ...resultadoEstado.data.partida,
            creador_id: resultadoPartida.data.creador_id
          }
        };
        
        setPartidaData(datosCompletos);
        
        // Si la partida ya está en juego, redirigir
        if (datosCompletos.partida.estado === ESTADOS_PARTIDA.EN_JUEGO) {
          navigate(`/juego/${id}`);
        }
      } else {
        setError(resultadoEstado.error || resultadoPartida.error || 'Error al cargar datos');
      }
    } catch (error) {
      setError('Error al cargar el estado de la partida');
    } finally {
      setLoading(false);
    }
  };

  const iniciarPartida = async () => {
    if (!partidaData || !user) return;

    const participantes = partidaData.resumen_jugadores || [];
    if (participantes.length < 2) {
      setError('Se necesitan al menos 2 jugadores para iniciar la partida');
      return;
    }

    setIniciandoPartida(true);
    setError('');
    setSuccess('');

    try {
      const id_jugadores = participantes.map(p => p.usuario_id);
      const resultado = await jugadasService.iniciarPartida(id_jugadores, user.id);

      if (resultado.success) {
        setSuccess('¡Partida iniciada exitosamente!');
        // Redirigir al juego después de un breve delay
        setTimeout(() => {
          navigate(`/juego/${id}`);
        }, 1500);
      } else {
        setError(resultado.error || 'Error al iniciar la partida');
      }
    } catch (error) {
      setError('Error inesperado al iniciar la partida');
    } finally {
      setIniciandoPartida(false);
    }
  };

  // Función para cancelar la partida (solo creador)
  const cancelarPartida = async () => {
    setError('');
    setSuccess('');
    try {
      const resultado = await partidasService.cancelarPartida(id);
      if (resultado.success) {
        setSuccess('La partida fue cancelada por el creador.');
        // Esperar un segundo y redirigir al home o historial
        setTimeout(() => {
          navigate('/partida', { state: { mensaje: 'La partida fue cancelada.' } });
        }, 1500);
      } else {
        setError(resultado.error || 'Error al cancelar la partida');
      }
    } catch (error) {
      // No mostrar mensaje de error si ocurre una redirección
    }
  };

  // Función para salir de la partida (jugador normal)
  const salirDePartida = async () => {
    setError('');
    setSuccess('');
    try {
      const resultado = await partidasService.salirDePartida(id);
      if (resultado.success) {
        setSuccess('Has salido de la partida.');
        setTimeout(() => {
          navigate('/partida', { state: { mensaje: 'Has salido de la partida.' } });
        }, 1500);
      } else {
        setError(resultado.error || 'Error al salir de la partida');
      }
    } catch (error) {
      // No mostrar mensaje de error si ocurre una redirección
    }
  };

  const copiarCodigoSala = () => {
    if (partidaData?.partida?.codigo_sala) {
      navigator.clipboard.writeText(partidaData.partida.codigo_sala);
      setSuccess('Código copiado al portapapeles');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="lobby-partida" style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2>Cargando partida...</h2>
      </div>
    );
  }

  if (error && !partidaData) {
    return (
      <div className="lobby-partida" style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  const participantes = partidaData?.resumen_jugadores || [];
  // Solo se considera que el usuario participa si está en estado 'jugando'
  const yaParticipa = participantes.some(
    p => Number(p.usuario_id) === Number(user?.id) && p.estado_en_partida === 'jugando'
  );
  const esCreador = user && Number(partidaData?.partida?.creador_id) === Number(user.id);
  const puedeIniciar = esCreador && participantes.length >= 2 && partidaData?.partida?.estado === ESTADOS_PARTIDA.EN_ESPERA;
  
  // Buscar el nombre del creador de forma más robusta
  const creadorNombre = (() => {
    const creadorId = Number(partidaData?.partida?.creador_id);
    
    // Primero buscar en la lista de participantes
    const creadorEnParticipantes = participantes.find(p => Number(p.usuario_id) === creadorId);
    
    if (creadorEnParticipantes?.nombre_usuario) {
      return creadorEnParticipantes.nombre_usuario;
    }
    
    // Si es el usuario actual y es el creador
    if (esCreador && user) {
      return user.nombre_usuario || user.username || user.nombre || user.email || 'Usuario Actual';
    }
    
    return 'Desconocido';
  })();

  return (
    <div className="lobby-partida" style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      {partidaData?.partida?.estado === 'cancelada' && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          La partida fue cancelada por el creador.
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Lobby de Partida</h1>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '10px 20px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px',
          fontSize: '18px',
          fontWeight: 'bold',
          marginTop: '1rem'
        }}>
          <span>Código: {partidaData?.partida?.codigo_sala}</span>
          <button 
            onClick={copiarCodigoSala}
            style={{
              padding: '5px 10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Copiar
          </button>
        </div>
      </div>

      {/* Estado de la partida */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Estado de la Partida</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Estado:</strong> {partidaData?.partida?.estado === ESTADOS_PARTIDA.EN_ESPERA ? 'Esperando jugadores' : partidaData?.partida?.estado}
          </div>
          <div>
            <strong>Jugadores:</strong> {participantes.length}/4
          </div>
          <div>
            <strong>Creador:</strong> {creadorNombre}
          </div>
        </div>
      </div>

      {/* Lista de jugadores */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Jugadores en la Partida</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {participantes.map((participante, index) => (
            <div 
              key={participante.usuario_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: Number(participante.usuario_id) === Number(user?.id) ? '#e8f5e8' : '#f8f9fa',
                borderRadius: '4px',
                border: Number(participante.usuario_id) === Number(user?.id) ? '2px solid #28a745' : '1px solid #dee2e6'
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
                <span style={{ fontWeight: 'bold' }}>{participante.nombre_usuario}</span>
                {Number(participante.usuario_id) === Number(user?.id) && (
                  <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>(TÚ)</span>
                )}
                {Number(participante.usuario_id) === Number(partidaData?.partida?.creador_id) && (
                  <span style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold' }}>(CREADOR)</span>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Orden: {participante.orden_turno || index + 1}
              </div>
            </div>
          ))}
          
          {/* Espacios vacíos */}
          {Array.from({ length: 4 - participantes.length }, (_, index) => (
            <div 
              key={`empty-${index}`}
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '2px dashed #dee2e6',
                textAlign: 'center',
                color: '#6c757d',
                fontStyle: 'italic'
              }}
            >
              Esperando jugador...
            </div>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        border: '1px solid #ffeeba'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Instrucciones:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
          <li>Comparte el código de la partida con otros jugadores</li>
          <li>Se necesitan al menos 2 jugadores para comenzar</li>
          <li>Máximo 4 jugadores por partida</li>
          {esCreador && <li style={{ fontWeight: 'bold' }}>Como creador, puedes iniciar la partida cuando estés listo</li>}
          {!esCreador && <li>Espera a que el creador inicie la partida</li>}
        </ul>
      </div>

      {/* Botón de iniciar partida */}
      {esCreador && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6c757d' }}>
            {!puedeIniciar && participantes.length < 2 && 'Se necesitan al menos 2 jugadores'}
            {!puedeIniciar && participantes.length >= 2 && partidaData?.partida?.estado !== ESTADOS_PARTIDA.EN_ESPERA && 'La partida ya no está en espera'}
            {puedeIniciar && 'Todo listo para iniciar la partida'}
          </div>
          <button
            onClick={iniciarPartida}
            disabled={!puedeIniciar || iniciandoPartida}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: puedeIniciar && !iniciandoPartida ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: puedeIniciar && !iniciandoPartida ? 'pointer' : 'not-allowed',
              minWidth: '200px'
            }}
          >
            {iniciandoPartida ? 'Iniciando...' : 
             !puedeIniciar ? 
               (participantes.length < 2 ? 'Necesitas más jugadores' : 'No se puede iniciar') : 
               '¡Iniciar Partida!'}
          </button>
        </div>
      )}

      {/* Botones de cancelar/salir */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {esCreador && partidaData?.partida?.estado === ESTADOS_PARTIDA.EN_ESPERA && (
          <button
            onClick={cancelarPartida}
            style={{
              padding: '12px 28px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Cancelar Partida
          </button>
        )}
        {!esCreador && partidaData?.partida?.estado === ESTADOS_PARTIDA.EN_ESPERA && (
          <button
            onClick={salirDePartida}
            style={{
              padding: '12px 28px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Salir de la Partida
          </button>
        )}
      </div>

      {!esCreador && participantes.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          border: '1px solid #ffeeba',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, color: '#856404', fontWeight: 'bold' }}>
            Esperando a que {creadorNombre} inicie la partida...
          </p>
        </div>
      )}

      {/* Mensajes de error y éxito */}
      {error && (
        <div style={{ 
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {success}
        </div>
      )}
    </div>
  );
}

export default LobbyPartida;
