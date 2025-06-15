import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

const SimpleProtectedRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  console.log('🔐 SimpleProtectedRoute - Estado:', { 
    hasToken: !!token, 
    hasUser: !!user,
    userInfo: user ? { id: user.id, email: user.email } : null
  });

  // Si no hay token, redirigir a login
  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    return <Navigate 
      to="/login" 
      state={{ 
        msg: "Acceso restringido. Inicia sesión para continuar", 
        from: location.pathname 
      }} 
      replace 
    />;
  }

  // Si hay token, permitir acceso
  console.log('✅ Token presente, acceso autorizado');
  return children;
};

export default SimpleProtectedRoute;
