import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const { token, user, logout } = useContext(AuthContext);
  const [isValid, setIsValid] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Verificando autenticacion:', { 
      hasToken: !!token, 
      hasUser: !!user,
      token: token ? 'presente' : 'ausente'
    });

    if (!token) {
      console.log('No hay token redirigiendo a login');
      setIsValid(false);
      return;
    }

    if (user && user.id) {
      console.log('Usuario ya validado en contexto:', user);
      setIsValid(true);
      return;
    }

    console.log('Validando token con el backend');
    
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      console.log('Token valido usuario autenticado');
      setIsValid(true);
    })
    .catch((error) => {
      console.error('Error validando token:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('Token expirado o invalido, cerrando sesion');
        logout();
      }
      setIsValid(false);
    });
  }, [token, user, logout]);

  if (isValid === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '1.2rem'
      }}>
        Verificando autenticacion
      </div>
    );
  }
  
  if (!isValid) {
    console.log('Acceso denegado, redirigiendo a login');
    return <Navigate to="/login" state={{ msg: "Acceso restringido. Inicia sesión para continuar", from: location.pathname }} replace />;
  }

  console.log('Acceso autorizado');
  return children;
};

export default ProtectedRoute;
