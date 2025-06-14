import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';

const AdminRoute = ({ children }) => {
  const { token, logout } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      return;
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const user = res.data.user;
      if (user.rol === 'admin') setIsAdmin(true);
      else setIsAdmin(false);
    })
    .catch(() => {
      logout();
      setIsAdmin(false);
    });
  }, [token, logout]);

  if (isAdmin === null) return <div>Cargando...</div>;
  if (!isAdmin) return <Navigate to="/unauthorized" state={{ msg: "No tienes permisos para acceder a esta sección.", from: location.pathname }} />;
  return children;
};

export default AdminRoute;
