import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        email,
        password,
      });

      // Verifica si la respuesta tiene un token válido
      console.log("Respuesta del backend:", res.data); // Log para ver la respuesta completa

      if (res.data && res.data.access_token) {
        const token = res.data.access_token;
        setToken(token); // Actualiza el contexto con el token
        localStorage.setItem('token', token); // Guarda el token en localStorage
        localStorage.setItem('user', JSON.stringify(res.data.user));  // Guardamos el usuario como un objeto
        setMsg('Login exitoso!');
        setError(false);
        navigate('/'); // Redirige a la página de inicio
      } else {
        setMsg('Login fallido, por favor revisa tus credenciales.');
        setError(true);
      }
    } catch (error) {
      setMsg('Error al iniciar sesión. Revisa que el correo y la contraseña sean correctos.');
      setError(true);
      console.error('Login error:', error);
    }
  };

  return (
    <div className="Login">
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
