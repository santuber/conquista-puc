import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { partidasService } from '../services/partidasService';
import { ESTADOS_PARTIDA } from '../constants/gameConstants';

function CrearPartida() {
  const [codigoSala, setCodigoSala] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  //generar codigo de sala aleatorio
  const generarCodigoSala = () => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCodigoSala(codigo);
    
    setSuccess(`Codigo generado: ${codigo}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!codigoSala.trim()) {
      setError('El codigo de sala es requerido');
      return;
    }

    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario');
      console.error('❌ Usuario no disponible:', user);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const partidaData = {
        codigo_sala: codigoSala.trim(),
        estado: ESTADOS_PARTIDA.EN_ESPERA,
        creador_id: user.id,
        jugador_actual_id: user.id,
      };

      const resultado = await partidasService.crearPartida(partidaData);

      if (resultado.success) {
        setSuccess('Partida creada exitosamente');
        setTimeout(() => {
          navigate(`/partida/${resultado.data.id}`);
        }, 1500);
      } else {
        setError(resultado.error || 'Error desconocido al crear la partida');
      }
    } catch (error) {
      setError('Error inesperado al crear la partida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-partida" style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '2rem', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Crear Nueva Partida</h2>
      
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          backgroundColor: '#ffebee', 
          padding: '0.5rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#2e7d32', 
          backgroundColor: '#e8f5e8', 
          padding: '0.5rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="codigoSala" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Código de Sala:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              id="codigoSala"
              value={codigoSala}
              onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
              placeholder="Ingresa un código o genera uno"
              style={{ 
                flex: 1,
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
              maxLength={10}
              required
            />
            <button
              type="button"
              onClick={generarCodigoSala}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Generar
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creando partida...' : 'Crear Partida'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>Información:</strong></p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>El código de sala debe ser único</li>
          <li>Otros jugadores podrán unirse usando este código</li>
          <li>Serás el creador y primer jugador de la partida</li>
        </ul>
      </div>
    </div>
  );
}

export default CrearPartida;
