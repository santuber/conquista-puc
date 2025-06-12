import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Elimina el token del contexto
    localStorage.removeItem('token');  // Elimina el token de localStorage
    navigate('/login');  // Redirige a la página de login
  };

  return (
    <li className="nav-item">
      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </li>
  );
};

export default LogoutButton;