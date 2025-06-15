# WEP Frontend - Conquista PUC

## Descripcion
Frontend de la aplicacion web "Conquista PUC"

## Funcionalidades Implementadas

### Autenticacion
- Login con JWT
- Registro de usuarios
- Contexto de autenticacion
- Rutas protegidas

### Gestion de Partidas
- Crear nueva partida con codigo unico
- Buscar partida por codigo
- Unirse a partida
- Validaciones y manejo de errores
- Asignacion automatica de colores y turnos

## Configuracion

Configurar variables de entorno en `.env`:
```
VITE_BACKEND_URL=http://localhost:3000
```

## API Frontend: Documentacion de Endpoints

### Configuracion del Cliente
Todos los servicios utilizan un cliente HTTP configurado con interceptores para autenticacion automatica:

```javascript
//Las peticiones incluyen automaticamente el token JWT
Authorization: Bearer ${localStorage.getItem('token')}
```

### partidasService

#### POST /partidas
```javascript
import { partidasService } from './services/partidasService';

const resultado = await partidasService.crearPartida({
  nombre: "Partida",
  max_jugadores: 4
});
```

#### GET /partidas
```javascript
const partidas = await partidasService.obtenerPartidas();
```

#### GET /partidas/:id
```javascript
const partida = await partidasService.obtenerPartidaPorId(partidaId);
```

#### GET /partidas/:id/estado
```javascript
const estado = await partidasService.obtenerEstadoPartida(partidaId);
```

#### GET /partidas (busqueda por codigo)
```javascript
const partida = await partidasService.buscarPartidaPorCodigo("HAUI56");
```

#### POST /participantes (via unirseAPartida)
```javascript
const resultado = await partidasService.unirseAPartida(partidaId, usuarioId);
```

### jugadasService

#### POST /jugadas/start-game
```javascript
import { jugadasService } from './services/jugadasService';

const resultado = await jugadasService.iniciarPartida(
  [jugador1Id, jugador2Id],
  creadorId
);
```

#### POST /jugadas/reinforce
```javascript
const refuerzos = [
  { facultad_id: 1, cantidad: 2 },
  { facultad_id: 3, cantidad: 1 }
];

const resultado = await jugadasService.aplicarRefuerzos(
  partidaId,
  jugadorId,
  refuerzos,
  false //lanzar_dado(opcional)
);
```

#### POST /jugadas/end-turn
```javascript
const resultado = await jugadasService.finalizarTurno(partidaId, jugadorId);
```

### participantesService

#### GET /participantes/partida/:id
```javascript
import { participantesService } from './services/participantesService';

const participantes = await participantesService.obtenerParticipantesPorPartida(partidaId);
```

#### GET /participantes?usuario_id=:id
```javascript
const participaciones = await participantesService.obtenerParticipantesPorUsuario(usuarioId);
```

#### POST /participantes
```javascript
const resultado = await participantesService.crearParticipante({
  usuario_id: usuarioId,
  partida_id: partidaId,
  estado_en_partida: 'jugando',
  color: 'rojo',
  orden_turno: 1
});
```

#### DELETE /participantes/:id
```javascript
const resultado = await participantesService.salirDePartida(participanteId, usuarioId);
```

### Patron de Respuesta
Todos los endpoints retornan la misma estructura:

```javascript
//Exito
{
  success: true,
  data: {/* datos del endpoint */}
}

//Error
{
  success: false,
  error: "Mensaje de error",
  details: {/* detalles opcionales */},
  status: 400 // codigo HTTP opcional
}
```

### Manejo de Errores
Los servicios capturan errores HTTP y los transforman:

```javascript
try {
  const resultado = await partidasService.crearPartida(datos);
  if (resultado.success) {
    // Usar resultado.data
  } else {
    // Manejar resultado.error
  }
} catch (error) {
  // Error de red o conexion
}
```

## Flujo Completo del Juego

### 1. Autenticacion
```javascript
//Usuario debe estar autenticado antes de crear o unirse a partidas
```
**Usuario**: Inicia sesion con email y contraseña en la pagina de login, o se registra si es nuevo usuario.

### 2. Crear una Partida
```javascript
const nuevaPartida = await partidasService.crearPartida({
  nombre: "Mi Partida",
  max_jugadores: 4
});

if (nuevaPartida.success) {
  const codigoSala = nuevaPartida.data.codigo_sala;
}
```
**Usuario**: Hace clic en "Crear Partida". Recibe un código unico para compartir.

### 3. Unirse a la Partida
```javascript
const partida = await partidasService.buscarPartidaPorCodigo("HATY34");

if (partida.success) {
  const resultado = await partidasService.unirseAPartida(
    partida.data.id, 
    usuarioId
  );
}
```
**Usuario**: Ingresa el codigo de partida en un campo de texto y hace clic en "Buscar/Unirse". Es redirigido automaticamente al lobby si la partida existe.

### 4. Esperar en el Lobby
```javascript
const participantes = await partidasService.obtenerParticipantes(partidaId);

if (participantes.data.length >= 2 && esCreador) {
  //Mostrar boton "Iniciar Partida"
}
```
**Usuario**: Ve una lista de jugadores conectados. El creador ve aparecer el boton "Iniciar Partida" cuando hay suficientes jugadores.

### 5. Iniciar la Partida
```javascript
const idsJugadores = participantes.data.map(p => p.usuario_id);

const partidaIniciada = await jugadasService.iniciarPartida(
  idsJugadores,
  creadorId
);
```
**Usuario**: El creador hace clic en "Iniciar Partida". Todos los jugadores son dirigidos a la pantalla de juego.

### 6. Fase de Refuerzos (cada turno)
```javascript
const estado = await partidasService.obtenerEstadoPartida(partidaId);

if (estado.data.partida.jugador_actual_id === miUsuarioId) {
  const refuerzos = [
    { facultad_id: 1, cantidad: 2 },
    { facultad_id: 3, cantidad: 1 }
  ];
  
  await jugadasService.aplicarRefuerzos(
    partidaId,
    miUsuarioId,
    refuerzos,
    true //lanzar dado
  );
}
```
**Usuario**: Ve el mensaje "Es tu turno" y la pestaña "Refuerzos" activa. Puede marcar "Lanzar dado", selecciona facultades de una lista, asigna tropas con botones +/- y hace clic en "Aplicar Refuerzos".

### 7. Fase de Ataques (opcional)
Aun no implementado

### 8. Fase de Movimientos (opcional)
Aun no implementado

### 9. Finalizar Turno
```javascript
const turnoFinalizado = await jugadasService.finalizarTurno(
  partidaId,
  miUsuarioId
);
```
**Usuario**: Despues de completar las acciones deseadas, hace clic en "Finalizar Turno". El turno pasa al siguiente jugador.

### 10. Monitoreo del Estado
```javascript
setInterval(async () => {
  const estado = await partidasService.obtenerEstadoPartida(partidaId);
  
  if (estado.success) {
    //Actualizar UI,verificar turno, mostrar facultades, tropas, etc.
  }
}, 5000);
```
**Usuario**: Ve actualizaciones automáticas del tablero cada 5 segundos.




