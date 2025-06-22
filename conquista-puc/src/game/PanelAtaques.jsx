import { useState } from 'react';
import { jugadasService } from '../services/jugadasService';
import './PanelAtaques.css';

function PanelAtaques({ 
  partidaId, 
  jugadorId, 
  facultadesControladas,
  todasLasFacultades,
  esMiTurno, 
  onAtaqueRealizado 
}) {
  const [facultadOrigen, setFacultadOrigen] = useState(null);
  const [facultadObjetivo, setFacultadObjetivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultadoAtaque, setResultadoAtaque] = useState(null);

  const getFacultadesEnemigas = () => {
    if (!todasLasFacultades) return [];
    return todasLasFacultades.filter(facultad => 
      facultad.controlada_por?.usuario_id !== jugadorId &&
      facultad.tropas &&
      Object.values(facultad.tropas).reduce((total, count) => total + count, 0) > 0
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
    if (!facultadOrigen || !facultadObjetivo) {
      setError('Debes seleccionar tanto la facultad de origen como la de destino');
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
        facultadObjetivo.id
      );

      if (resultado.success) {
        setResultadoAtaque(resultado.data);
        setSuccess('Ataque realizado exitosamente');
        
        setTimeout(() => {
          setFacultadOrigen(null);
          setFacultadObjetivo(null);
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
                onClick={() => setFacultadOrigen(facultad)}
              >
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
          <p className="info">Debe ser adyacente a tu facultad</p>
          <div className="facultades-grid">
            {facultadesEnemigas.map((facultad) => (
              <div 
                key={facultad.id}
                className={`facultad-card enemiga ${facultadObjetivo?.id === facultad.id ? 'selected' : ''}`}
                onClick={() => setFacultadObjetivo(facultad)}
              >
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
            <p className="no-facultades">No hay facultades enemigas disponibles</p>
          )}
        </div>
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
          </div>
        </div>
      )}

      <div className="controles">
        <button
          onClick={realizarAtaque}
          disabled={loading || !facultadOrigen || !facultadObjetivo}
          className={`btn-atacar ${loading || !facultadOrigen || !facultadObjetivo ? 'disabled' : 'enabled'}`}
        >
          {loading ? 'Atacando...' : 'Realizar Ataque'}
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
