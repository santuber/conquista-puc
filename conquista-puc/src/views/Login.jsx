import { useState } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMsg = location.state?.msg || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = { 
      email, 
      contrasena: password
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, loginData);

      if (res.data && res.data.access_token) {
        const token = res.data.access_token;
        const userData = res.data.user;
        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setMsg('Login exitoso!');
        setError(false);
        navigate('/');
      } else {
        console.log("❌ No se recibió access_token en la respuesta");
        setMsg('Login fallido, por favor revisa tus credenciales.');
        setError(true);
      }
    } catch (error) {
      let errorMessage = 'Error al iniciar sesion.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          errorMessage = errorData?.error || 'Credenciales incorrectas. Verifica tu email y contrasena.';
        } else if (status === 400) {
          errorMessage = errorData?.error || 'Datos de entrada invalidos.';
        } else if (status === 404) {
          errorMessage = 'Endpoint no encontrado. Verifica la configuracion del backend.';
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = `Error del servidor (${status}): ${errorData?.message || 'Error desconocido'}`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend este ejecutandose.';
      } else {
        errorMessage = `Error de configuracion: ${error.message}`;
      }
      
      setMsg(errorMessage);
      setError(true);
    }
  };

  return (
    <div className="Login">
      {redirectMsg && <div className="noticeMsg">{redirectMsg}</div>}
      {msg && <div className={error ? 'error' : 'successMsg'}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <h1>Iniciar Sesión</h1>
        <label>
          Correo:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;