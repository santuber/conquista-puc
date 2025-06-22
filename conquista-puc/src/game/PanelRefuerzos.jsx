import { useState } from 'react';
import { jugadasService } from '../services/jugadasService';
import DiceRoller from './DiceRoller';

function PanelRefuerzos({ 
  partidaId, 
  jugadorId, 
  facultadesControladas, 
  esMiTurno, 
  onRefuerzosAplicados 
}) {
  const [refuerzos, setRefuerzos] = useState([]);
  const [lanzarDado, setLanzarDado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [baseRefuerzos] = useState(3);
  const [diceResult, setDiceResult] = useState(null);

  // Calcular refuerzos disponibles basándose en el resultado del dado
  const getRefuerzosDisponibles = () => {
    let disponibles = baseRefuerzos;
    
    if (lanzarDado && diceResult) {
      // Si el dado es impar, se pierde un refuerzo
      if (diceResult % 2 === 1) {
        disponibles -= 1;
      }
    }
    
    return disponibles;
  };

  const refuerzosDisponibles = getRefuerzosDisponibles();

  const agregarRefuerzo = (facultadId) => {
    if (refuerzos.reduce((total, r) => total + r.cantidad, 0) >= refuerzosDisponibles) {
      setError('Ya has asignado todos los refuerzos disponibles');
      return;
    }

    const refuerzoExistente = refuerzos.find(r => r.facultad_id === facultadId);
    
    if (refuerzoExistente) {
      setRefuerzos(prev => prev.map(r => 
        r.facultad_id === facultadId 
          ? { ...r, cantidad: r.cantidad + 1 }
          : r
      ));
    } else {
      setRefuerzos(prev => [...prev, { facultad_id: facultadId, cantidad: 1 }]);
    }
    setError('');
  };

  const quitarRefuerzo = (facultadId) => {
    setRefuerzos(prev => {
      const nuevosRefuerzos = prev.map(r => 
        r.facultad_id === facultadId 
          ? { ...r, cantidad: Math.max(0, r.cantidad - 1) }
          : r
      ).filter(r => r.cantidad > 0);
      
      return nuevosRefuerzos;
    });
    setError('');
  };

  const handleDiceToggle = (enabled) => {
    setLanzarDado(enabled);
    setDiceResult(null);
    setError('');
    
    if (!enabled) {
      const totalAsignado = refuerzos.reduce((total, r) => total + r.cantidad, 0);
      if (totalAsignado > baseRefuerzos) {
        const exceso = totalAsignado - baseRefuerzos;
        setError(`Debes quitar ${exceso} refuerzo(s) ya que sin el dado tienes menos refuerzos disponibles`);
      }
    }
  };

  const aplicarRefuerzos = async () => {
    if (!esMiTurno) {
      setError('No es tu turno');
      return;
    }

    const totalAsignado = refuerzos.reduce((total, r) => total + r.cantidad, 0);
    if (totalAsignado !== refuerzosDisponibles) {
      setError(`Debes asignar exactamente ${refuerzosDisponibles} refuerzos`);
      return;
    }

    if (refuerzos.length === 0) {
      setError('Debes asignar al menos un refuerzo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const resultado = await jugadasService.aplicarRefuerzos(
        partidaId,
        jugadorId,
        refuerzos,
        lanzarDado
      );

      if (resultado.success) {
        setSuccess('Refuerzos aplicados exitosamente');
        
        if (resultado.data.mejoras_aplicadas) {
          setSuccess(`${resultado.data.mensaje}. ${resultado.data.mejoras_aplicadas}`);
        }

        setTimeout(() => {
          setRefuerzos([]);
          setLanzarDado(false);
          setDiceResult(null);
          
          if (onRefuerzosAplicados) {
            onRefuerzosAplicados(resultado.data);
          }
        }, 3000);

      } else {
        setError(resultado.error || 'Error al aplicar refuerzos');
      }
    } catch (error) {
      setError('Error inesperado al aplicar refuerzos');
    } finally {
      setLoading(false);
    }
  };

  const resetearRefuerzos = () => {
    setRefuerzos([]);
    handleDiceToggle(false);
    setError('');
    setSuccess('');
  };

  // Obtener información sobre las mejoras del dado
  const getDiceImprovements = () => {
    if (!lanzarDado || !diceResult) return [];
    
    const improvements = [];
    
    if (diceResult === 2 || diceResult === 4) {
      improvements.push({
        type: 'ayudante',
        count: 1,
        description: '1 refuerzo será mejorado a Ayudante'
      });
    } else if (diceResult === 6) {
      improvements.push({
        type: 'profesor',
        count: 1,
        description: '1 refuerzo será mejorado a Profesor'
      });
    }
    
    return improvements;
  };

  const totalAsignado = refuerzos.reduce((total, r) => total + r.cantidad, 0);
  const restantes = refuerzosDisponibles - totalAsignado;
  const diceImprovements = getDiceImprovements();

  if (!esMiTurno) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8d7da',
        borderRadius: '6px',
        border: '1px solid #f5c6cb',
        textAlign: 'center'
      }}>
        <p style={{ color: '#721c24', margin: 0, fontWeight: 'bold' }}>
          No es tu turno para aplicar refuerzos
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '2px solid #007bff',
      marginBottom: '1rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#007bff' }}>
        Panel de Refuerzos
      </h3>

      <DiceRoller
        onDiceResult={setDiceResult}
        isRolling={loading}
        diceEnabled={lanzarDado}
        onToggleDice={handleDiceToggle}
        diceResult={diceResult}
      />

      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#e9ecef',
        borderRadius: '6px'
      }}>        
        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '0.5rem' }}>
          <strong>Refuerzos disponibles:</strong> {refuerzosDisponibles} | 
          <strong> Asignados:</strong> {totalAsignado} | 
          <strong> Restantes:</strong> {restantes}
        </div>
        
        {diceImprovements.length > 0 && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#0c5460'
          }}>
            <strong>Mejoras del dado:</strong>
            {diceImprovements.map((improvement, index) => (
              <div key={index} style={{ marginLeft: '10px' }}>
                • {improvement.description}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Tus Facultades:</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '10px' 
        }}>
          {facultadesControladas.map((facultad) => {
            const refuerzoActual = refuerzos.find(r => r.facultad_id === facultad.id);
            const cantidadAsignada = refuerzoActual?.cantidad || 0;
            
            return (
              <div 
                key={facultad.id}
                style={{
                  padding: '12px',
                  backgroundColor: cantidadAsignada > 0 ? '#d4edda' : '#f8f9fa',
                  borderRadius: '6px',
                  border: cantidadAsignada > 0 ? '2px solid #28a745' : '1px solid #dee2e6'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {facultad.nombre}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Tropas actuales: {facultad.tropas_totales || 0}
                    </div>
                  </div>
                  {cantidadAsignada > 0 && (
                    <div style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {cantidadAsignada}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => agregarRefuerzo(facultad.id)}
                    disabled={loading || restantes <= 0}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: restantes > 0 ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: restantes > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    + Refuerzo
                  </button>
                  
                  {cantidadAsignada > 0 && (
                    <button
                      onClick={() => quitarRefuerzo(facultad.id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '6px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      - Quitar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <button
          onClick={aplicarRefuerzos}
          disabled={loading || totalAsignado !== refuerzosDisponibles}
          style={{
            padding: '12px 24px',
            backgroundColor: totalAsignado === refuerzosDisponibles && !loading ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: totalAsignado === refuerzosDisponibles && !loading ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Aplicando...' : 'Aplicar Refuerzos'}
        </button>
        
        <button
          onClick={resetearRefuerzos}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Resetear
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {success}
        </div>
      )}
    </div>
  );
}

export default PanelRefuerzos;
