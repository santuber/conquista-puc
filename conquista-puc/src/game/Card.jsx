function Card({ nombre, cantidad, controlador, color, campus, tropas, onClick, selected }) {
  const cantidadTotal = cantidad || (tropas ? Object.values(tropas).reduce((total, count) => total + count, 0) : 0);
  
  return (
    <div 
      style={{
        border: selected ? '3px solid #007bff' : '1px solid #ccc',
        borderRadius: '6px',
        padding: '1rem',
        width: '200px',
        backgroundColor: color ? `${color}20` : 'white',
        boxShadow: selected ? '0 4px 8px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: color ? `4px solid ${color}` : '4px solid #ccc',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ':hover': onClick ? { transform: 'translateY(-2px)' } : {}
      }}
      onClick={onClick}
    >
      <h3 style={{ 
        margin: '0 0 0.5rem 0', 
        fontSize: '0.95rem',
        lineHeight: '1.2'
      }}>
        {nombre}
      </h3>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>
          Tropas: {cantidadTotal}
        </p>
        
        {tropas && typeof tropas === 'object' && (
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {tropas.estudiante > 0 && <div>👨‍🎓 {tropas.estudiante}</div>}
            {tropas.ayudante > 0 && <div>👨‍🏫 {tropas.ayudante}</div>}
            {tropas.profesor > 0 && <div>👨‍🎓 {tropas.profesor}</div>}
          </div>
        )}
      </div>

      {campus && (
        <p style={{ 
          margin: '0.25rem 0', 
          fontSize: '0.8rem', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Campus: {campus}
        </p>
      )}

      {controlador && (
        <p style={{ 
          margin: '0.25rem 0', 
          fontSize: '0.85rem', 
          color: color || '#666',
          fontWeight: 'bold'
        }}>
          {controlador}
        </p>
      )}
    </div>
  );
}

export default Card;
