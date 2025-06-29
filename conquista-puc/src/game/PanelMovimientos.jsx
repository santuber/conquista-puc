import { useState, useEffect } from 'react';
import { jugadasService } from '../services/jugadasService';
import './PanelMovimientos.css';

const MATRIZ_ADYACENCIA = {
  1: [4,5,7],
  2: [14,21],
  3: [6,10,13,15,16,17,19,20,23],
  6: [3,10,13,15,19],
  10: [3,6,13,15,20],
  13: [3,6,10,15,20],
  15: [3,6,10,13,20],
  16: [17,23],
  17: [16,23],
  19: [3,6],
  20: [3,10,13,15],
  23: [16,17],
  4: [1,5,7,11,12,14,21,22],
  5: [1,4,7,12],
  7: [1,4,5,12],
  11: [4,12,14,21],
  12: [4,5,7,11,14,22],
  14: [2,4,11,12,21],
  21: [2,4,11,14],
  22: [4,12],
  8: [9,18],
  9: [8,18],
  18: [8,9],
};


function PanelMovimientos({ 
  partidaId, 
  jugadorId, 
  facultadesControladas,
  esMiTurno, 
  onMovimientoRealizado,
  accionYaRealizada = false
}) {
  const [facultadOrigen, setFacultadOrigen] = useState(null);
  const [facultadDestino, setFacultadDestino] = useState(null);
  const [tropasSeleccionadas, setTropasSeleccionadas] = useState({
    estudiante: 0,
    ayudante: 0,
    profesor: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultadoMovimiento, setResultadoMovimiento] = useState(null);

  useEffect(() => {
    setTropasSeleccionadas({
      estudiante: 0,
      ayudante: 0,
      profesor: 0
    });
    setError('');
    setSuccess('');
    setResultadoMovimiento(null);
  }, [facultadOrigen, facultadDestino]);

  const getTropasDisponibles = (facultad) => {
    if (!facultad || !facultad.tropas) return 0;
    
    const totalTropas = Object.values(facultad.tropas).reduce((total, count) => total + count, 0);
    return Math.max(0, totalTropas - 1);
  };

  const getTropasTotal = (facultad) => {
    if (!facultad || !facultad.tropas) return 0;
    return Object.values(facultad.tropas).reduce((total, count) => total + count, 0);
  };

  const getTropasPorTipo = (facultad, tipo) => {
    if (!facultad || !facultad.tropas) return 0;
    return facultad.tropas[tipo] || 0;
  };

  const getTropasDisponiblesPorTipo = (facultad, tipo) => {
    if (!facultad) return 0;
    
    const tropasDelTipo = getTropasPorTipo(facultad, tipo);
    const totalTropas = getTropasTotal(facultad);
    const totalSeleccionadas = Object.values(tropasSeleccionadas).reduce((sum, count) => sum + count, 0);
    
    if (totalTropas - totalSeleccionadas <= 1) {
      return 0;
    }
    
    return tropasDelTipo;
  };

  const getTotalTropasSeleccionadas = () => {
    return Object.values(tropasSeleccionadas).reduce((sum, count) => sum + count, 0);
  };

  const actualizarTropasSeleccionadas = (tipo, cantidad) => {
    setTropasSeleccionadas(prev => ({
      ...prev,
      [tipo]: Math.max(0, Math.min(cantidad, getTropasDisponiblesPorTipo(facultadOrigen, tipo)))
    }));
  };

  const getFacultadesPropias = () => {
    return facultadesControladas.filter(facultad => 
      facultad.tropas &&
      getTropasTotal(facultad) > 1
    );
  };

  const getFacultadesDestino = () => {
    if (!facultadOrigen) {
      // Si no hay origen, mostramos todas las que controlas excepto ella misma (por si acaso)
      return facultadesControladas;
    }

    const adyacentesIds = MATRIZ_ADYACENCIA[facultadOrigen.id] || [];
    return facultadesControladas.filter(f => 
      adyacentesIds.includes(f.id)
    );
  };

  const moverTropas = async () => {
    if (accionYaRealizada) {
      setError('Ya realizaste un movimiento en este turno');
      return;
    }

    if (!facultadOrigen || !facultadDestino) {
      setError('Debes seleccionar facultad de origen y destino');
      return;
    }

    const totalSeleccionadas = getTotalTropasSeleccionadas();
    if (totalSeleccionadas === 0) {
      setError('Debes seleccionar al menos una tropa para mover');
      return;
    }

    const tropasDisponibles = getTropasDisponibles(facultadOrigen);
    if (totalSeleccionadas > tropasDisponibles) {
      setError(`Solo puedes mover máximo ${tropasDisponibles} tropas de esta facultad`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tropasEspecificas = {};
      Object.entries(tropasSeleccionadas).forEach(([tipo, cantidad]) => {
        if (cantidad > 0) {
          tropasEspecificas[tipo] = cantidad;
        }
      });

      const resultado = await jugadasService.moverTropas(
        partidaId,
        jugadorId,
        facultadOrigen.id,
        facultadDestino.id,
        totalSeleccionadas,
        Object.keys(tropasEspecificas).length > 0 ? tropasEspecificas : null
      );

      if (resultado.success) {
        setSuccess(resultado.data.mensaje || 'Tropas movidas exitosamente');
        setResultadoMovimiento(resultado.data);
        
        setFacultadOrigen(null);
        setFacultadDestino(null);
        setTropasSeleccionadas({
          estudiante: 0,
          ayudante: 0,
          profesor: 0
        });
        
        if (onMovimientoRealizado) {
          onMovimientoRealizado(resultado);
        }
      } else {
        setError(resultado.error || 'Error al mover tropas');
      }
    } catch (error) {
      setError('Error inesperado al mover tropas');
      console.error('Error movimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetear = () => {
    setFacultadOrigen(null);
    setFacultadDestino(null);
    setTropasSeleccionadas({
      estudiante: 0,
      ayudante: 0,
      profesor: 0
    });
    setError('');
    setSuccess('');
    setResultadoMovimiento(null);
  };

  if (!esMiTurno) {
    return (
      <div className="panel-movimientos">
        <h3>Panel de Movimientos</h3>
        <p className="info-text">Esperando tu turno...</p>
      </div>
    );
  }

  const facultadesPropias = getFacultadesPropias();
  const facultadesDestino = getFacultadesDestino();

  return (
    <div className="panel-movimientos">
      <h3>Panel de Movimientos</h3>
      <p className="info-text">
        Mueve tropas entre tus facultades adyacentes. Recuerda que debes dejar al menos una tropa en la facultad de origen.
      </p>

      {facultadesPropias.length === 0 && (
        <div className="no-options">
          <p>No tienes facultades con tropas suficientes para mover (necesitas más de 1 tropa).</p>
        </div>
      )}

      {facultadesPropias.length > 0 && (
        <div className="movimiento-form">
          <div className="form-group">
            <label>Facultad de Origen:</label>
            <div className="facultades-grid">
              {facultadesPropias.map((facultad) => (
                <div
                  key={facultad.id}
                  className={`facultad-card ${
                    facultadOrigen?.id === facultad.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    if (facultadOrigen?.id === facultad.id) {
                      setFacultadOrigen(null);
                      setFacultadDestino(null);
                    } else {
                      setFacultadOrigen(facultad);
                      setFacultadDestino(null);
                    }
                  }}>
                  <div className="facultad-name">{facultad.nombre}</div>
                  <div className="facultad-tropas">
                    Tropas: {getTropasTotal(facultad)}
                  </div>
                  <div className="facultad-movibles">
                    Movibles: {getTropasDisponibles(facultad)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {facultadOrigen && (
            <div className="form-group">
              <label>Facultad de Destino:</label>

              <p className="info">
                Mostrando solo facultades adyacentes a <strong>{facultadOrigen.nombre}</strong>.
              </p>

              {facultadesDestino.length === 0 ? (
            <p className="no-facultades">
              {facultadOrigen
                ? 'No hay facultades adyacentes disponibles para mover tropas.'
                : 'No hay facultades adyacentes disponibles.'}
            </p>
          ) : (
                <div className="facultades-grid">
                  {facultadesDestino.map((facultad) => (
                    <div
                      key={facultad.id}
                      className={`facultad-card ${
                        facultadDestino?.id === facultad.id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        if (facultadDestino?.id === facultad.id) {
                          setFacultadDestino(null);
                        } else {
                          setFacultadDestino(facultad);
                        }
                      }}
                    >
                      <div className="facultad-name">{facultad.nombre}</div>
                      <div className="facultad-tropas">
                        Tropas: {getTropasTotal(facultad)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {facultadOrigen && facultadDestino && (
            <div className="form-group">
              <label>Selecciona las Tropas a Mover:</label>
              <div className="tropas-selection">
                <div className="tropas-disponibles">
                  <h4>Tropas Disponibles en {facultadOrigen.nombre}:</h4>
                  <div className="tropas-info">
                    <div className="tropa-info">
                      <span>Estudiantes: {getTropasPorTipo(facultadOrigen, 'estudiante')}</span>
                    </div>
                    <div className="tropa-info">
                      <span>Ayudantes: {getTropasPorTipo(facultadOrigen, 'ayudante')}</span>
                    </div>
                    <div className="tropa-info">
                      <span>Profesores: {getTropasPorTipo(facultadOrigen, 'profesor')}</span>
                    </div>
                  </div>
                </div>

                <div className="tropas-seleccion">
                  <h4>Tropas a Mover:</h4>
                  
                  {['estudiante', 'ayudante', 'profesor'].map((tipo) => {
                    const disponibles = getTropasPorTipo(facultadOrigen, tipo);
                    const maxPosibles = getTropasDisponiblesPorTipo(facultadOrigen, tipo);
                    
                    if (disponibles === 0) return null;
                    
                    return (
                      <div key={tipo} className="tropa-selector">
                        <div className="tropa-label">
                          <span className={`tropa-icon ${tipo}`}>
                            {tipo === 'estudiante' ? '🎓' : tipo === 'ayudante' ? '👨‍🏫' : '👨‍🎓'}
                          </span>
                          <span className="tropa-name">
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}s:
                          </span>
                        </div>
                        <div className="cantidad-controls">
                          <button
                            type="button"
                            onClick={() => actualizarTropasSeleccionadas(tipo, tropasSeleccionadas[tipo] - 1)}
                            disabled={tropasSeleccionadas[tipo] === 0}
                            className="quantity-btn minus"
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {tropasSeleccionadas[tipo]}
                          </span>
                          <button
                            type="button"
                            onClick={() => actualizarTropasSeleccionadas(tipo, tropasSeleccionadas[tipo] + 1)}
                            disabled={tropasSeleccionadas[tipo] >= maxPosibles || 
                                     (getTotalTropasSeleccionadas() >= getTropasDisponibles(facultadOrigen))}
                            className="quantity-btn plus"
                          >
                            +
                          </button>
                          <span className="max-info">
                            (máx: {maxPosibles})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="total-seleccionadas">
                    <strong>Total a mover: {getTotalTropasSeleccionadas()}</strong>
                    <span className="total-limit">
                      (Máximo posible: {getTropasDisponibles(facultadOrigen)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="actions">
            <button
              onClick={moverTropas}
              disabled={loading || !facultadOrigen || !facultadDestino || getTotalTropasSeleccionadas() < 1 || accionYaRealizada}
              className={`action-button move-button ${
                loading || !facultadOrigen || !facultadDestino || getTotalTropasSeleccionadas() < 1 || accionYaRealizada ? 'disabled' : 'enabled'
              }`}
            >
              {loading ? 'Moviendo...' : accionYaRealizada ? 'Ya moviste en este turno' : 'Mover Tropas'}
            </button>

            <button
              onClick={resetear}
              disabled={loading}
              className="action-button reset-button"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      {resultadoMovimiento && (
        <div className="resultado-movimiento">
          <h4>Resultado del Movimiento</h4>
          <div className="resultado-details">
            <p><strong>Tropas movidas:</strong> {resultadoMovimiento.tropas_movidas?.length || getTotalTropasSeleccionadas()}</p>
            {resultadoMovimiento.tropas_movidas && (
              <div className="tropas-movidas">
                <strong>Detalle de tropas:</strong>
                <ul>
                  {resultadoMovimiento.tropas_movidas.map((tropa, index) => (
                    <li key={index}>
                      <span className={`tropa-icon ${tropa.nivel}`}>
                        {tropa.nivel === 'estudiante' ? '🎓' : tropa.nivel === 'ayudante' ? '👨‍🏫' : '👨‍🎓'}
                      </span>
                      {tropa.nivel.charAt(0).toUpperCase() + tropa.nivel.slice(1)} (ID: {tropa.tropa_id})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelMovimientos;
