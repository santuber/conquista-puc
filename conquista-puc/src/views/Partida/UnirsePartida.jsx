import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { partidasService } from '../../services/partidasService';
import './Unirse.css';

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
    <div className="partida-container">
      <div className="unirse-partida">
        <h2>Unirse a Partida</h2>

        {/* Buscar partida */}
        <div className="form-group">
          <h3>Buscar Partida</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Codigo de partida (ej: ABC123)"
              value={codigoSala}
              onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
              className="codigo-input"
              maxLength={6}
            />
            <button 
              onClick={buscarPartida}
              disabled={loading || !codigoSala.trim()}
              className="unirse-button"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button 
              onClick={resetearBusqueda}
              className="unirse-button"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Informacion de la partida encontrada */}
        {partidaEncontrada && (
          <div className="partida-encontrada">
            <h3>Partida Encontrada</h3>
            
            <div className="partida-info">
              <div><strong>Codigo:</strong> {partidaEncontrada.codigo_sala}</div>
              <div><strong>Estado:</strong> {partidaEncontrada.estado}</div>
              <div><strong>Creador:</strong> {partidaEncontrada.creador}</div>
              <div><strong>Jugadores:</strong> {partidaEncontrada.jugadores_actuales}/{partidaEncontrada.jugadores_maximo}</div>
            </div>

            {/* Lista de jugadores actuales */}
            {partidaEncontrada.participantes && partidaEncontrada.participantes.length > 0 && (
              <div className="jugadores-actuales">
                <strong>Jugadores actuales:</strong>
                <ul>
                  {partidaEncontrada.participantes.map((participante, index) => (
                    <li key={index}>
                      {participante.nombre_usuario} {participante.usuario_id === user?.id && '(TU)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Boton para unirse */}
            <div className="unirse-action">
              {partidaEncontrada.estado === 'en_espera' && 
               partidaEncontrada.jugadores_actuales < partidaEncontrada.jugadores_maximo &&
               !partidaEncontrada.participantes.some(
                 p => p.usuario_id === user?.id && p.estado_en_partida === 'jugando'
               ) ? (
                <button 
                  onClick={unirseAPartida}
                  disabled={loading}
                  className="unirse-button main-action"
                >
                  {loading ? 'Uniendo...' : 'Unirse a Partida'}
                </button>
              ) : (
                <div className="unirse-status">
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
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Informacion adicional */}
        <div className="info-section">
          <strong>Como funciona:</strong>
          <ul>
            <li>Ingresa el codigo de 6 caracteres de la partida</li>
            <li>Verifica la informacion de la partida</li>
            <li>Unete si hay espacio disponible</li>
            <li>Espera a que el creador inicie la partida</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UnirsePartida;
