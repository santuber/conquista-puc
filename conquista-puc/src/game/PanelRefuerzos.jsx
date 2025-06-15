import { useState } from 'react';
import { jugadasService } from '../services/jugadasService';

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
  const [refuerzosDisponibles, setRefuerzosDisponibles] = useState(3);

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
        setRefuerzos([]);
        setLanzarDado(false);
        
        if (resultado.data.mejoras_aplicadas) {
          setSuccess(`${resultado.data.mensaje}. ${resultado.data.mejoras_aplicadas}`);
        }

        if (onRefuerzosAplicados) {
          onRefuerzosAplicados(resultado.data);
        }
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
    setLanzarDado(false);
    setError('');
    setSuccess('');
  };

  const totalAsignado = refuerzos.reduce((total, r) => total + r.cantidad, 0);
  const restantes = refuerzosDisponibles - totalAsignado;

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

      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#e9ecef',
        borderRadius: '6px'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={lanzarDado}
              onChange={(e) => setLanzarDado(e.target.checked)}
              disabled={loading}
            />
            <span>Lanzar dado (puede modificar refuerzos disponibles y tipos)</span>
          </label>
        </div>
        
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          <strong>Refuerzos disponibles:</strong> {refuerzosDisponibles} | 
          <strong> Asignados:</strong> {totalAsignado} | 
          <strong> Restantes:</strong> {restantes}
        </div>
        
        {lanzarDado && (
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: '12px', 
            color: '#856404',
            fontStyle: 'italic'
          }}>
            ⚠️ El dado puede reducir refuerzos (impar) o mejorar tropas (par)
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
