function Card({ nombre, cantidad, controlador, color }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '1rem',
      width: '180px',
      backgroundColor: color ? `${color}20` : 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: color ? `4px solid ${color}` : '4px solid #ccc'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{nombre}</h3>
      <p style={{ margin: '0.25rem 0' }}>Tropas: {cantidad}</p>
      {controlador && (
        <p style={{ 
          margin: '0.25rem 0', 
          fontSize: '0.9rem', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Controlado por: {controlador}
        </p>
      )}
    </div>
  );
}

export default Card;
