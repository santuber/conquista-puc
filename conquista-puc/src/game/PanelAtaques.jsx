import { useState, useEffect } from 'react';
import { jugadasService } from '../services/jugadasService';
import './PanelAtaques.css';
import { MATRIZ_ADYACENCIA  } from '../constants/gameConstants';

function PanelAtaques({ 
  partidaId, 
  jugadorId, 
  facultadesControladas,
  todasLasFacultades,
  esMiTurno, 
  onAtaqueRealizado,
  ataquesRealizados = 0,
  maxAtaques = 5
}) {
  const [facultadOrigen, setFacultadOrigen] = useState(null);
  const [facultadObjetivo, setFacultadObjetivo] = useState(null);
  const [tipoTropaSeleccionada, setTipoTropaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultadoAtaque, setResultadoAtaque] = useState(null);

  useEffect(() => {
    setTipoTropaSeleccionada(null);
  }, [facultadOrigen]);

  const getTropasDisponibles = (facultad) => {
    if (!facultad || !facultad.tropas) return [];
    
    return Object.entries(facultad.tropas)
      .filter(([tipo, cantidad]) => cantidad > 0)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }));
  };

  const getTipoTropaLabel = (tipo) => {
    const labels = {
      'estudiante': 'Estudiante',
      'ayudante': 'Ayudante',
      'profesor': 'Profesor'
    };
    return labels[tipo] || tipo;
  };

  const getFacultadesEnemigas = () => {
    if (!facultadOrigen) {
      return todasLasFacultades.filter(facultad => 
        facultad.controlada_por?.usuario_id !== jugadorId &&
        facultad.tropas &&
        Object.values(facultad.tropas).reduce((total, count) => total + count, 0) > 0
      );
    }

    const adyacentesIds = MATRIZ_ADYACENCIA[facultadOrigen.id] || [];

    return todasLasFacultades.filter(facultad => 
      facultad.controlada_por?.usuario_id !== jugadorId &&
      facultad.tropas &&
      Object.values(facultad.tropas).reduce((total, count) => total + count, 0) > 0 &&
      adyacentesIds.includes(facultad.id)
    );
  };

  const getFacultadesPropias = () => {
    return facultadesControladas.filter(facultad => {
      const totalTropas = facultad.tropas_totales || 
        (facultad.tropas ? Object.values(facultad.tropas).reduce((total, count) => total + count, 0) : 0);
      return totalTropas >= 2;
    });
  };

  const realizarAtaque = async () => {
    if (ataquesRealizados >= maxAtaques) {
      setError(`Ya realizaste el máximo de ${maxAtaques} ataques en este turno`);
      return;
    }

    if (!facultadOrigen || !facultadObjetivo) {
      setError('Debes seleccionar tanto la facultad de origen como la de destino');
      return;
    }

    if (!tipoTropaSeleccionada) {
      setError('Debes seleccionar el tipo de tropa para atacar');
      return;
    }

    if (!esMiTurno) {
      setError('No es tu turno');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResultadoAtaque(null);

    try {
      const resultado = await jugadasService.realizarAtaque(
        partidaId,
        jugadorId,
        facultadOrigen.id,
        facultadObjetivo.id,
        tipoTropaSeleccionada,
        ataquesRealizados + 1
      );

      if (resultado.success) {
        setResultadoAtaque(resultado.data);
        setSuccess(`Ataque ${ataquesRealizados + 1}/${maxAtaques} realizado exitosamente`);
        
        setTimeout(() => {
          setFacultadOrigen(null);
          setFacultadObjetivo(null);
          setTipoTropaSeleccionada(null);
          setResultadoAtaque(null);
          
          if (onAtaqueRealizado) {
            onAtaqueRealizado(resultado.data);
          }
        }, 5000);

      } else {
        setError(resultado.error || 'Error al realizar ataque');
      }
    } catch (error) {
      setError('Error inesperado al realizar ataque');
    } finally {
      setLoading(false);
    }
  };

  const resetearSeleccion = () => {
    setFacultadOrigen(null);
    setFacultadObjetivo(null);
    setTipoTropaSeleccionada(null);
    setError('');
    setSuccess('');
    setResultadoAtaque(null);
  };

  const facultadesPropias = getFacultadesPropias();
  const facultadesEnemigas = getFacultadesEnemigas();

  if (!esMiTurno) {
    return (
      <div className="panel-ataques disabled">
        <p>No es tu turno para atacar</p>
      </div>
    );
  }

  return (
    <div className="panel-ataques">
      <h3>Panel de Ataques</h3>
      
      <div className="ataques-contador">
        <h4>Ataques Realizados: {ataquesRealizados}/{maxAtaques}</h4>
        <div className="ataques-progress">
          {[...Array(maxAtaques)].map((_, i) => (
            <div 
              key={i} 
              className={`ataque-slot ${i < ataquesRealizados ? 'usado' : 'disponible'}`}
            >
              {i < ataquesRealizados ? '⚔️' : '○'}
            </div>
          ))}
        </div>
        {ataquesRealizados >= maxAtaques && (
          <p className="max-ataques-mensaje">Has usado todos tus ataques para este turno</p>
        )}
      </div>

      {resultadoAtaque && (
        <div className="resultado-ataque">
          <h4>Resultado del Ataque</h4>
          <div className="batalla-visual">
            <div className="atacante">
              <h5>Atacante</h5>
              <div className="dado-resultado">
                Dado: {resultadoAtaque.tirada_atacante}
              </div>
            </div>
            <div className="vs">VS</div>
            <div className="defensor">
              <h5>Defensor</h5>
              <div className="dado-resultado">
                Dado: {resultadoAtaque.tirada_defensor}
              </div>
            </div>
          </div>
          <div className={`resultado-final ${resultadoAtaque.resultado_final.includes('atacante') ? 'victoria' : 'derrota'}`}>
            {resultadoAtaque.resultado_final.includes('atacante') ? 'VICTORIA' : 'DERROTA'}
          </div>
          {resultadoAtaque.facultadConquistada && (
            <div className="territorio-conquistado">
              ¡Territorio conquistado!
            </div>
          )}
          <p className="mensaje">{resultadoAtaque.mensaje}</p>
        </div>
      )}

      <div className="seleccion-secciones">
        <div className="seccion-origen">
          <h4>1. Selecciona tu facultad atacante</h4>
          <p className="info">Debe tener al menos 2 tropas</p>
          <div className="facultades-grid">
            {facultadesPropias.map((facultad) => (
              <div 
                key={facultad.id}
                className={`facultad-card ${facultadOrigen?.id === facultad.id ? 'selected' : ''}`}
                onClick={() => {
                  setError('');
                  if (facultadOrigen?.id === facultad.id) {
                    setFacultadOrigen(null);
                    setFacultadObjetivo(null);
                    setTipoTropaSeleccionada(null);
                  } else {
                    setFacultadOrigen(facultad);
                    setFacultadObjetivo(null);
                    setTipoTropaSeleccionada(null);
                  }
                }}>
                <div className="facultad-nombre">{facultad.nombre}</div>
                <div className="facultad-tropas">
                  Tropas: {facultad.tropas_totales || 
                    (facultad.tropas ? Object.values(facultad.tropas).reduce((total, count) => total + count, 0) : 0)}
                </div>
              </div>
            ))}
          </div>
          {facultadesPropias.length === 0 && (
            <p className="no-facultades">No tienes facultades con suficientes tropas para atacar</p>
          )}
        </div>

        <div className="seccion-objetivo">
          <h4>2. Selecciona facultad enemiga</h4>
          {!facultadOrigen && (
            <p className="info">
              Mostrando todas las facultades enemigas. Selecciona tu facultad atacante para filtrar las adyacentes.
            </p>
          )}
          {facultadOrigen && (
            <p className="info">
              Mostrando solo facultades enemigas <strong>adyacentes a {facultadOrigen.nombre}</strong>.
            </p>
          )}
          <div className="facultades-grid">
            {facultadesEnemigas.map((facultad) => (
              <div 
                key={facultad.id}
                className={`facultad-card enemiga ${facultadObjetivo?.id === facultad.id ? 'selected' : ''}`}
                onClick={() => {
                  if (!facultadOrigen) {
                    setError('Debes seleccionar una facultad de origen primero');
                  } else if (facultadObjetivo?.id === facultad.id) {
                    setFacultadObjetivo(null);
                    setError('');
                  } else {
                    setFacultadObjetivo(facultad);
                    setError('');
                  }
                }}>
                <div className="facultad-nombre">{facultad.nombre}</div>
                <div className="facultad-tropas">
                  Tropas: {Object.values(facultad.tropas || {}).reduce((total, count) => total + count, 0)}
                </div>
                <div className="facultad-controlador">
                  Controlado por: {facultad.controlada_por?.nombre_usuario}
                </div>
              </div>
            ))}
          </div>
          {facultadesEnemigas.length === 0 && (
            <p className="no-facultades">
              {facultadOrigen
                ? 'No hay facultades enemigas adyacentes disponibles para atacar.'
                : 'No hay facultades enemigas disponibles.'}
            </p>
          )}
        </div>

        {facultadOrigen && (
          <div className="seccion-tropas">
            <h4>3. Selecciona tipo de tropa para atacar</h4>
            <p className="info">Elige qué tipo de tropa usar en el ataque</p>
            <div className="tropas-grid">
              {getTropasDisponibles(facultadOrigen).map(({ tipo, cantidad }) => (
                <div 
                  key={tipo}
                  className={`tropa-card ${tipoTropaSeleccionada === tipo ? 'selected' : ''}`}
                  onClick={() => setTipoTropaSeleccionada(tipo)}
                >
                  <div className="tropa-tipo">{getTipoTropaLabel(tipo)}</div>
                  <div className="tropa-cantidad">Disponibles: {cantidad}</div>
                </div>
              ))}
            </div>
            {getTropasDisponibles(facultadOrigen).length === 0 && (
              <p className="no-tropas">No hay tropas disponibles en esta facultad</p>
            )}
          </div>
        )}
      </div>

      {facultadOrigen && facultadObjetivo && (
        <div className="resumen-ataque">
          <h4>Resumen del Ataque</h4>
          <div className="ataque-info">
            <div className="origen-info">
              <strong>Atacante:</strong> {facultadOrigen.nombre}
            </div>
            <div className="objetivo-info">
              <strong>Objetivo:</strong> {facultadObjetivo.nombre}
            </div>
            {tipoTropaSeleccionada && (
              <div className="tropa-info">
                <strong>Tropa atacante:</strong> {getTipoTropaLabel(tipoTropaSeleccionada)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="controles">
        <button
          onClick={realizarAtaque}
          disabled={loading || !facultadOrigen || !facultadObjetivo || !tipoTropaSeleccionada || ataquesRealizados >= maxAtaques}
          className={`btn-atacar ${loading || !facultadOrigen || !facultadObjetivo || !tipoTropaSeleccionada || ataquesRealizados >= maxAtaques ? 'disabled' : 'enabled'}`}
        >
          {loading ? 'Atacando...' : ataquesRealizados >= maxAtaques ? `Máximo ${maxAtaques} ataques alcanzado` : `Realizar Ataque (${ataquesRealizados + 1}/${maxAtaques})`}
        </button>
        
        <button
          onClick={resetearSeleccion}
          disabled={loading}
          className="btn-resetear"
        >
          Resetear Selección
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

export default PanelAtaques;
