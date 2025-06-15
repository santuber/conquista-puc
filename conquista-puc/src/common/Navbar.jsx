import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../auth/AuthContext';
import LogoutButton from '../views/Sesion/Logout';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Navbar() {
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
      if (!token) {
        setIsAdmin(false);
        return;
      }
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        console.log("Respuesta de /usuarios/me:", res.data);
        setIsAdmin(res.data.user?.rol === 'admin');
      })
      .catch(() => setIsAdmin(false));
    }, [token]);

  return (
    <nav className="navbar">
      <ul className="nav-left">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/instrucciones">Instrucciones</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
        <li><Link to="/partida">Partida</Link></li>
        {isAdmin && <li><Link to="/adminpanel">Admin</Link></li>}
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
