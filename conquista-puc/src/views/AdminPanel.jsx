import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';

function AdminPanel() {
  const { token } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(res.data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setMsg('Error al cargar los usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [token]);

  const handleEliminar = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setMsg(`Usuario ${id} eliminado.`);
    } catch {
      setMsg('No se pudo eliminar el usuario.');
    }
  };

  const handleCambiarRol = async (id, nuevoRol) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/usuarios/${id}`, { rol: nuevoRol }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(prev =>
        prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u)
      );
      setMsg(`Rol de usuario ${id} actualizado a ${nuevoRol}.`);
    } catch {
      setMsg('No se pudo cambiar el rol.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Administración</h1>
      <p>Solo los administradores pueden ver esta sección.</p>

      {msg && <div style={{ color: 'blue', marginBottom: '1rem' }}>{msg}</div>}

      <h2>Gestión de usuarios</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre_usuario}</td>
                <td>{usuario.email}</td>
                <td>
                  <select
                    value={usuario.rol}
                    onChange={(e) => handleCambiarRol(usuario.id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleEliminar(usuario.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPanel;