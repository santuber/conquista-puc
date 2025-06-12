import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../views/Landing';
import Nosotros from '../views/Nosotros';
import Instrucciones from '../views/Instrucciones';
import Navbar from './Navbar';
import Login from '../views/Login';
import Signup from '../views/Signup';
import Game from '../game/Game';

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
        <Route path="/partida" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
