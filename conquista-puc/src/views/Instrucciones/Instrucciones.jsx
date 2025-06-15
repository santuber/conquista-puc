import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Instrucciones.css';

function Instrucciones() {
  const navigate = useNavigate();

  const handleRegresar = () => {
    navigate('/');
  };

  return (
    <div className="instrucciones">
      <div className="pergamino">
        <h1 className="titulo">INSTRUCCIONES DEL JUEGO</h1>
        
        <p className="objetivo">El objetivo del juego es conquistar la mayor cantidad de facultades posibles.</p>
        
        <div className="contenidoReglas">
          <ol className="listaReglas">
            <li>Regístrate o inicia sesión para comenzar.</li>
            <li>Crea una partida o únete mediante un código.</li>
            <li>Refuerza, ataca y mueve tus tropas por turnos.</li>
            <li>Gana el jugador que controle todas las facultades.</li>
            <li>Cada turno puedes reforzar tus territorios con nuevas tropas.</li>
            <li>Ataca territorios enemigos adyacentes para expandir tu dominio.</li>
            <li>Mueve tropas estratégicamente para defender tus fronteras.</li>
            <li>Controla puntos clave para obtener ventajas tácticas.</li>
          </ol>
        </div>

        <button className="botonRegresar" onClick={handleRegresar}>
          REGRESAR AL INICIO
        </button>
      </div>
    </div>
  );
}

export default Instrucciones;
