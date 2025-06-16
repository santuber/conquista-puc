import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import './Landing.css';

function Landing() {
  const { user, token } = useContext(AuthContext);

  return (
    <div className="landing">
      <div className="hero-content">
        <h1 className="hero-subtitle">Bienvenido a</h1>
        <h2 className="hero-title">CONQUISTA LA PUC</h2>
        <p className="hero-description">
          Un juego de estrategia por turnos ambientado en los<br />
          campus de la Universidad Católica.
        </p>
        
        {token && user ? (
          <div className="actions-container">
            <h3 className="user-greeting">¡Hola, {user.nombre_usuario || user.email}!</h3>
            <p className="user-subtitle">¿Qué te gustaría hacer?</p>
            
            <div className="buttons-grid">
              <Link to="/crear-partida" className="action-button primary">
                Crear Nueva Partida
              </Link>
              
              <Link to="/unirse-partida" className="action-button secondary">
                Unirse a Partida
              </Link>
            </div>
          </div>
        ) : (
          <div className="actions-container">
            <p className="auth-subtitle">Para jugar, primero debes iniciar sesión o registrarte.</p>
            <div className="buttons-grid">
              <Link to="/login" className="action-button secondary">
                Iniciar Sesión
              </Link>
              
              <Link to="/signup" className="action-button primary">
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Landing;
