function Card({ nombre, cantidad }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '1rem',
      width: '180px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3>{nombre}</h3>
      <p>Tropas: {cantidad}</p>
    </div>
  );
}

export default Card;
