import React, { useState } from 'react';
import axios from 'axios';

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
      {msg.length > 0 && <div className={error ? 'error' : 'successMsg'}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">
            Nombre de usuario:
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="signup-email">
            Correo:
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="signup-password">
            Contraseña:
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="signup-rol">
            Rol:
            <select
              id="signup-rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="user">Jugador</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Signup;
