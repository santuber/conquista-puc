import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const { token, logout } = useContext(AuthContext);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => setIsValid(true))
    .catch(() => {
      logout();
      setIsValid(false);
    });
  }, [token, logout]);


  if (isValid === null) return <div>Cargando...</div>;
  if (!isValid) {
    return <Navigate to="/login" state={{ msg: "Acceso restringido. Inicia sesión para continuar", from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
