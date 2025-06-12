import Board from './Board';
import Card from './Card';

function Game() {
  return (
    <div className="view">
      <h1>Partida en curso</h1>
      <Board />
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem', gap: '1rem' }}>
        <Card nombre="Facultad de Ingeniería" cantidad={3} />
        <Card nombre="Facultad de Derecho" cantidad={2} />
        <Card nombre="Facultad de Medicina" cantidad={5} />
      </div>
    </div>
  );
}

export default Game;
