import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('user');
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        username,
        email,
        password,
        rol,
      });
      if (res.data && res.data.message) {
        setMsg(res.data.message);
        setError(false);
      } else {
        setMsg('Registro exitoso! Ahora puedes volver y loguearte');
        setError(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrarse. Intenta nuevamente.';
      setError(true);
      setMsg(errorMsg);
    }
  };

  return (
    <div className="Login">
      <div className="login-pergamino">
        <h2 className="login-titulo">Registrarse</h2>
        
        {msg.length > 0 && (
          <div className={`noticeMsg ${error ? 'error-msg' : 'success-msg'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nombre de usuario:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Correo:
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Contraseña:
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-rol" className="form-label">
              Rol:
            </label>
            <select
              id="signup-rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="form-input"
            >
              <option value="user">Jugador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" className="login-button">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
