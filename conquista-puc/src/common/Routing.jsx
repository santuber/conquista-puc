import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../views/Landing';
import Nosotros from '../views/Nosotros/Nosotros';
import Instrucciones from '../views/Instrucciones/Instrucciones';
import Navbar from './Navbar';
import Login from '../views/Login';
import Signup from '../views/Logs/Signup';
import Game from '../game/Game';
import CrearPartida from '../views/CrearPartida';
import UnirsePartida from '../views/UnirsePartida';
import LobbyPartida from '../views/LobbyPartida';
import ProtectedRoute from '../protected/ProtectedRoute';
import SimpleProtectedRoute from '../protected/SimpleProtectedRoute';
import AdminRoute from '../protected/AdminRoute';
import Unauthorized from '../protected/Unauthorized';
import AdminPanel from '../views/AdminPanel';

function Routing() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/instrucciones" element={<Instrucciones />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/crear-partida" element={
          <SimpleProtectedRoute>
            <CrearPartida />
          </SimpleProtectedRoute>
        } />
        <Route path="/unirse-partida" element={
          <SimpleProtectedRoute>
            <UnirsePartida />
          </SimpleProtectedRoute>
        } />
        <Route path="/partida" element={
          <SimpleProtectedRoute>
            <Game />
          </SimpleProtectedRoute>
        } />
        <Route path="/partida/:id" element={
          <SimpleProtectedRoute>
            <LobbyPartida />
          </SimpleProtectedRoute>
        } />
        <Route path="/juego/:id" element={
          <SimpleProtectedRoute>
            <Game />
          </SimpleProtectedRoute>
        } />
        <Route path="/adminpanel" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
