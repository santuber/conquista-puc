import { useState, useContext } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMsg = location.state?.msg || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        email,
        password,
      });

      console.log("Respuesta del backend:", res.data);

      if (res.data && res.data.access_token) {
        const token = res.data.access_token;
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setMsg('Login exitoso!');
        setError(false);
        navigate('/');
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