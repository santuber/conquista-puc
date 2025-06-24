import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { partidasService } from '../../services/partidasService';

function UnirsePartida() {
  const [codigoSala, setCodigoSala] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [partidaEncontrada, setPartidaEncontrada] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  //buscar partida por codigo
  const buscarPartida = async () => {
    if (!codigoSala.trim()) {
      setError('El codigo de sala es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setPartidaEncontrada(null);

    try {
      const resultado = await partidasService.buscarPartidaPorCodigo(codigoSala);
      
      if (resultado.success) {
        const estadoResultado = await partidasService.obtenerEstadoPartida(resultado.data.id);
        
        if (estadoResultado.success) {
          const partida = estadoResultado.data.partida;
          const participantes = estadoResultado.data.resumen_jugadores || [];
          
          setPartidaEncontrada({
            id: partida.id,
            codigo_sala: partida.codigo_sala,
            estado: partida.estado,
            creador_id: partida.creador_id,
            creador: participantes.find(p => p.usuario_id === partida.creador_id)?.nombre_usuario || 'Desconocido',
            jugadores_actuales: participantes.length,
            jugadores_maximo: 4,
            participantes: participantes
          });
          setSuccess('Partida encontrada');
        } else {
          setError('Error al obtener detalles de la partida');
        }
      } else {
        setError(resultado.error || 'Partida no encontrada');
      }
    } catch (error) {
      setError('Error inesperado al buscar la partida');
    } finally {
      setLoading(false);
    }
  };

  //unirse a la partida encontrada
  const unirseAPartida = async () => {
    if (!partidaEncontrada || !user) {
      setError('No hay partida seleccionada o usuario no autenticado');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const resultado = await partidasService.unirseAPartida(partidaEncontrada.id, user.id);
      
      if (resultado.success) {
        setSuccess('Te has unido exitosamente a la partida');
        setTimeout(() => {
          navigate(`/partida/${partidaEncontrada.id}`);
        }, 1500);
      } else {
        setError(resultado.error || 'Error al unirse a la partida');
      }
    } catch (error) {
      setError('Error inesperado al unirse a la partida');
    } finally {
      setLoading(false);
    }
  };

  //resetear busqueda
  const resetearBusqueda = () => {
    setCodigoSala('');
    setPartidaEncontrada(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="unirse-partida" style={{ 
      maxWidth: '600px', 
      margin: '2rem auto', 
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        Unirse a Partida
      </h2>

      {/* Buscar partida */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#555' }}>Buscar Partida</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Codigo de partida (ej: ABC123)"
            value={codigoSala}
            onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              textAlign: 'center',
              letterSpacing: '2px',
              fontWeight: 'bold'
            }}
            maxLength={6}
          />
          <button 
            onClick={buscarPartida}
            disabled={loading || !codigoSala.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button 
            onClick={resetearBusqueda}
            style={{
              padding: '12px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Informacion de la partida encontrada */}
      {partidaEncontrada && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          border: '2px solid #d4edda'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#155724' }}>
            Partida Encontrada
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
            <div><strong>Codigo:</strong> {partidaEncontrada.codigo_sala}</div>
            <div><strong>Estado:</strong> {partidaEncontrada.estado}</div>
            <div><strong>Creador:</strong> {partidaEncontrada.creador}</div>
            <div><strong>Jugadores:</strong> {partidaEncontrada.jugadores_actuales}/{partidaEncontrada.jugadores_maximo}</div>
          </div>

          {/* Lista de jugadores actuales */}
          {partidaEncontrada.participantes && partidaEncontrada.participantes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Jugadores actuales:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '20px' }}>
                {partidaEncontrada.participantes.map((participante, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    {participante.nombre_usuario} {participante.usuario_id === user?.id && '(TU)'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Boton para unirse */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {partidaEncontrada.estado === 'en_espera' && 
             partidaEncontrada.jugadores_actuales < partidaEncontrada.jugadores_maximo &&
             !partidaEncontrada.participantes.some(
               p => p.usuario_id === user?.id && p.estado_en_partida === 'jugando'
             ) ? (
              <button 
                onClick={unirseAPartida}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Uniendo...' : 'Unirse a Partida'}
              </button>
            ) : (
              <div style={{ color: '#721c24', fontWeight: 'bold' }}>
                {partidaEncontrada.participantes.some(
                  p => p.usuario_id === user?.id && p.estado_en_partida === 'jugando'
                ) 
                  ? 'Ya estas en esta partida' 
                  : partidaEncontrada.estado !== 'en_espera'
                  ? 'La partida ya ha comenzado'
                  : 'La partida esta llena'
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensajes de error y exito */}
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

      {/* Informacion adicional */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#856404'
      }}>
        <strong>Como funciona:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Ingresa el codigo de 6 caracteres de la partida</li>
          <li>Verifica la informacion de la partida</li>
          <li>Unete si hay espacio disponible</li>
          <li>Espera a que el creador inicie la partida</li>
        </ul>
      </div>
    </div>
  );
}

export default UnirsePartida;
