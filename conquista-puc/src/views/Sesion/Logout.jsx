import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import './Login.css';

function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button type="button" className="login-button" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;
