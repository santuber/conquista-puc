import { useState, useEffect } from 'react';
import { jugadasService } from '../services/jugadasService';
import DiceRoller from './DiceRoller';
import './PanelRefuerzos.css';

function PanelRefuerzos({ 
  partidaId, 
  jugadorId, 
  facultadesControladas, 
  esMiTurno, 
  onRefuerzosAplicados 
}) {
  const [lanzarDado, setLanzarDado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tropasDisponibles, setTropasDisponibles] = useState([]);
  const [tropasAsignadas, setTropasAsignadas] = useState([]);
  const [resultadoDado, setResultadoDado] = useState(null);
  const [dadoLanzado, setDadoLanzado] = useState(false);

  const calcularTropasDisponibles = (dadoResultado = null) => {
    const tropas = [];
    let cantidadBase = 3;
    let mejoras = [];

    if (lanzarDado && dadoResultado) {
      if (dadoResultado % 2 === 1) {
        cantidadBase = 2;
      } else if (dadoResultado === 2 || dadoResultado === 4) {
        mejoras.push('ayudante');
      } else if (dadoResultado === 6) {
        mejoras.push('profesor');
      }
    }

    for (let i = 0; i < cantidadBase; i++) {
      const nivel = mejoras.length > 0 ? mejoras.shift() : 'estudiante';
      tropas.push({
        id: `tropa_${Date.now()}_${i}`,
        nivel: nivel,
        asignada: false,
        facultad_id: null
      });
    }

    return tropas;
  };

  const actualizarTropasDisponibles = (dadoResultado = null) => {
    const nuevasTropas = calcularTropasDisponibles(dadoResultado);
    setTropasDisponibles(nuevasTropas);
    setTropasAsignadas([]);
  };

  useEffect(() => {
    if (!lanzarDado) {
      actualizarTropasDisponibles();
      setResultadoDado(null);
      setDadoLanzado(false);
    }
  }, [lanzarDado]);

  const asignarTropa = (tropaId, facultadId) => {
    setTropasDisponibles(prev => 
      prev.map(tropa => 
        tropa.id === tropaId 
          ? { ...tropa, asignada: true, facultad_id: facultadId }
          : tropa
      )
    );

    setTropasAsignadas(prev => {
      const nuevaAsignacion = { tropa_id: tropaId, facultad_id: facultadId };
      return [...prev.filter(a => a.tropa_id !== tropaId), nuevaAsignacion];
    });

    setError('');
  };

  const desasignarTropa = (tropaId) => {
    setTropasDisponibles(prev => 
      prev.map(tropa => 
        tropa.id === tropaId 
          ? { ...tropa, asignada: false, facultad_id: null }
          : tropa
      )
    );

    setTropasAsignadas(prev => prev.filter(a => a.tropa_id !== tropaId));
    setError('');
  };

  useEffect(() => {
    actualizarTropasDisponibles();
  }, []);

  const handleDiceResult = (resultado) => {
    setResultadoDado(resultado);
    setDadoLanzado(true);
    actualizarTropasDisponibles(resultado);
  };

  const handleDiceToggle = (enabled) => {
    if (dadoLanzado && enabled !== lanzarDado) {
      setError('No puedes cambiar la opción del dado después de haberlo lanzado');
      return;
    }
    
    setLanzarDado(enabled);
    setError('');
  };

  const aplicarRefuerzos = async () => {
    if (!esMiTurno) {
      setError('No es tu turno');
      return;
    }

    const tropasNoAsignadas = tropasDisponibles.filter(t => !t.asignada);
    if (tropasNoAsignadas.length > 0) {
      setError('Debes asignar todas las tropas antes de aplicar los refuerzos');
      return;
    }

    const refuerzosParaBackend = facultadesControladas.map(facultad => {
      const tropasEnFacultad = tropasAsignadas.filter(a => a.facultad_id === facultad.id);
      return {
        facultad_id: facultad.id,
        cantidad: tropasEnFacultad.length
      };
    }).filter(r => r.cantidad > 0);

    if (refuerzosParaBackend.length === 0) {
      setError('Debes asignar al menos una tropa');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const resultado = await jugadasService.aplicarRefuerzos(
        partidaId, 
        jugadorId, 
        refuerzosParaBackend,
        lanzarDado,
        dadoLanzado ? resultadoDado : null
      );

      if (resultado.success) {
        let mensaje = 'Refuerzos aplicados correctamente';
        
        if (dadoLanzado && resultadoDado) {
          if (resultadoDado % 2 === 1) {
            mensaje += ` - Dado: ${resultadoDado} (Se perdió 1 refuerzo)`;
          } else if (resultadoDado === 2 || resultadoDado === 4) {
            mensaje += ` - Dado: ${resultadoDado} (1 tropa mejorada a Ayudante)`;
          } else if (resultadoDado === 6) {
            mensaje += ` - Dado: ${resultadoDado} (1 tropa mejorada a Profesor)`;
          }
        }
        
        setSuccess(mensaje);
        setTimeout(() => {
          onRefuerzosAplicados(resultado);
        }, 2000);
      } else {
        setError(resultado.error || 'Error al aplicar refuerzos');
      }
    } catch (error) {
      console.error('Error al aplicar refuerzos:', error);
      setError('Error inesperado al aplicar refuerzos');
    } finally {
      setLoading(false);
    }
  };

  const resetearRefuerzos = () => {
    if (dadoLanzado) {
      actualizarTropasDisponibles(resultadoDado);
    } else {
      setTropasDisponibles([]);
      setTropasAsignadas([]);
      setResultadoDado(null);
      setDadoLanzado(false);
      handleDiceToggle(false);
    }
    setError('');
    setSuccess('');
  };

  const getTropaText = (nivel) => {
    switch (nivel) {
      case 'estudiante': return 'Estudiante';
      case 'ayudante': return 'Ayudante';
      case 'profesor': return 'Profesor';
      default: return 'Desconocido';
    }
  };

  if (!esMiTurno) {
    return (
      <div className="no-turno-message">
        <p>No es tu turno para aplicar refuerzos</p>
      </div>
    );
  }

  const tropasNoAsignadas = tropasDisponibles.filter(t => !t.asignada);
  const todasAsignadas = tropasDisponibles.length > 0 && tropasNoAsignadas.length === 0;

  return (
    <div className="panel-refuerzos">
      <h3>Panel de Refuerzos</h3>

      <DiceRoller
        onDiceResult={handleDiceResult}
        isRolling={loading}
        diceEnabled={lanzarDado}
        onToggleDice={handleDiceToggle}
        diceResult={dadoLanzado ? resultadoDado : null}
        dadoLanzado={dadoLanzado}
      />

      {lanzarDado && !dadoLanzado && (
        <div className="dado-info dado-activado">
          <h5>Dado Activado</h5>
          <p>Presiona el botón "Lanzar Dado" para ver tus tropas de refuerzo.</p>
        </div>
      )}

      {dadoLanzado && resultadoDado && (
        <div className={`dado-info dado-resultado ${resultadoDado % 2 === 1 ? 'dado-resultado-malo' : 'dado-resultado-bueno'}`}>
          <h5>Resultado del Dado: {resultadoDado}</h5>
          <p>
            {resultadoDado % 2 === 1 && 'Se perdió 1 refuerzo - Solo tienes 2 tropas disponibles'}
            {resultadoDado === 2 || resultadoDado === 4 ? 'Una tropa se mejoró a Ayudante' : ''}
            {resultadoDado === 6 && 'Una tropa se mejoró a Profesor'}
          </p>
        </div>
      )}

      {tropasDisponibles.length > 0 && ((!lanzarDado) || (lanzarDado && dadoLanzado)) && (
        <div className="tropas-disponibles">
          <h4>Tropas Disponibles para Refuerzo:</h4>
          
          <div className="tropas-badges">
            {tropasDisponibles.map((tropa) => (
              <div
                key={tropa.id}
                className={`tropa-badge ${tropa.nivel} ${tropa.asignada ? 'asignada' : ''}`}
                onClick={() => tropa.asignada && desasignarTropa(tropa.id)}
                title={tropa.asignada ? 'Click para desasignar' : ''}
              >
                {getTropaText(tropa.nivel)}
                {tropa.asignada && ' (Asignada)'}
              </div>
            ))}
          </div>

          <div className="tropas-stats">
            <strong>Total disponibles:</strong> {tropasDisponibles.length} | 
            <strong> Asignadas:</strong> {tropasDisponibles.filter(t => t.asignada).length} | 
            <strong> Pendientes:</strong> {tropasNoAsignadas.length}
          </div>
        </div>
      )}

      {tropasDisponibles.length > 0 && ((!lanzarDado) || (lanzarDado && dadoLanzado)) && (
        <div className="facultades-asignacion">
          <h4>Asignar a tus Facultades:</h4>
          <div className="facultades-grid">
            {facultadesControladas.map((facultad) => {
              const tropasEnFacultad = tropasAsignadas.filter(a => a.facultad_id === facultad.id);
              return (
                <div key={facultad.id} className="facultad-card">
                  <h5>{facultad.nombre}</h5>
                  
                  <div className="tropas-asignadas">
                    {tropasEnFacultad.map((asignacion) => {
                      const tropa = tropasDisponibles.find(t => t.id === asignacion.tropa_id);
                      if (!tropa) return null;
                      
                      return (
                        <div
                          key={asignacion.tropa_id}
                          className={`tropa-asignada ${tropa.nivel}`}
                        >
                          {getTropaText(tropa.nivel)}
                        </div>
                      );
                    })}
                    {tropasEnFacultad.length === 0 && (
                      <span className="mensaje-vacio">
                        Ninguna tropa asignada
                      </span>
                    )}
                  </div>

                  <div className="botones-asignar">
                    {tropasNoAsignadas.map((tropa) => (
                      <button
                        key={tropa.id}
                        onClick={() => asignarTropa(tropa.id, facultad.id)}
                        className={`boton-asignar ${tropa.nivel}`}
                      >
                        +{getTropaText(tropa.nivel)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="controles-principales">
        <button
          onClick={aplicarRefuerzos}
          disabled={loading || !todasAsignadas}
          className={`boton-principal aplicar ${(!todasAsignadas || loading) ? 'disabled' : ''}`}
        >
          {loading ? 'Aplicando...' : 'Aplicar Refuerzos'}
        </button>
        
        <button
          onClick={resetearRefuerzos}
          disabled={loading}
          className="boton-principal resetear"
        >
          Resetear
        </button>
      </div>

      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {success && (
        <div className="mensaje-exito">
          {success}
        </div>
      )}
    </div>
  );
}

export default PanelRefuerzos;
