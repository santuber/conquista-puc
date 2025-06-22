import './Card.css';

function Card({ nombre, cantidad, controlador, color, campus, tropas, onClick, selected }) {
  const cantidadTotal = cantidad || (tropas ? Object.values(tropas).reduce((total, count) => total + count, 0) : 0);
  
  const cardClasses = [
    'card-container',
    selected ? 'selected' : '',
    onClick ? 'clickable' : '',
    color ? 'with-color' : ''
  ].filter(Boolean).join(' ');

  const cardStyle = color ? { '--player-color': color } : {};
  
  return (
    <div 
      className={cardClasses}
      style={cardStyle}
      onClick={onClick}
    >
      <h3 className="card-title">
        {nombre}
      </h3>
      
      <div className="card-content">
        <p className="card-troops">
          Tropas: {cantidadTotal}
        </p>
        
        {tropas && typeof tropas === 'object' && (
          <div className="card-troops-detail">
            {tropas.estudiante > 0 && <div className="troop-type estudiante">Estudiantes: {tropas.estudiante}</div>}
            {tropas.ayudante > 0 && <div className="troop-type ayudante">Ayudantes: {tropas.ayudante}</div>}
            {tropas.profesor > 0 && <div className="troop-type profesor">Profesores: {tropas.profesor}</div>}
          </div>
        )}
      </div>

      {campus && (
        <p className="card-campus">
          Campus: {campus}
        </p>
      )}

      {controlador && (
        <p className="card-controller">
          {controlador}
        </p>
      )}
    </div>
  );
}

export default Card;
