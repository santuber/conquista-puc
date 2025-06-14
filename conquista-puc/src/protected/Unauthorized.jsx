import { useLocation, Link } from 'react-router-dom';

const Unauthorized = () => {
  const location = useLocation();
  const msg = location.state?.msg || "No tienes permisos para ver esta página.";

  return (
    <div>
      <h2>Acceso denegado</h2>
      <p>{msg}</p>
    </div>
  );
};

export default Unauthorized;
