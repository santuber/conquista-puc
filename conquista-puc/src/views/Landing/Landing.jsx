import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';

function Landing() {
  const { user, token } = useContext(AuthContext);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenido a Conquista la PUC</h1>
      <p>Un juego de estrategia por turnos ambientado en los campus de la Universidad Católica.</p>
      
      {token && user ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>¡Hola, {user.nombre_usuario || user.email}!</h2>
          <p>¿Qué te gustaría hacer?</p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/crear-partida"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Crear Nueva Partida
            </Link>
            
            <Link 
              to="/unirse-partida"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Unirse a Partida
            </Link>
            
            <Link 
              to="/mis-partidas"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#FF9800',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Mis Partidas
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p>Para jugar, primero debes iniciar sesión o registrarte.</p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginTop: '1.5rem' 
          }}>
            <Link 
              to="/login"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}
            >
              Iniciar Sesión
            </Link>
            
            <Link 
              to="/signup"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
