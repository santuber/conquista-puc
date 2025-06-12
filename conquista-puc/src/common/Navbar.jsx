// src/common/Navbar.jsx
import { Link } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../auth/AuthContext';
import { useContext } from 'react';
import LogoutButton from '../views/Logout';

function Navbar() {
  const { token } = useContext(AuthContext);
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;
  return (
    <nav className="navbar">
      <ul className="nav-left">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/instrucciones">Instrucciones</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
        <li><Link to="/partida">Partida</Link></li>
      </ul>
      <ul className="nav-right">
        {token ? (
          <>
            <li>Hola, {user ? user.username : 'Usuario'}</li>
            <li><LogoutButton /></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/signup">Registrarse</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
