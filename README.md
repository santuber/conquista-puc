# WEP Frontend - Conquista PUC

## Descripcion
Frontend de la aplicacion web "Conquista PUC", un juego de estrategia por turnos desarrollado con React + Vite.

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

### Variables de Entorno
```bash
VITE_BACKEND_URL=http://localhost:3000/api
```

### Instalacion
```bash
cd conquista-puc
npm install
npm run dev
```

## Estructura del Proyecto

```
conquista-puc/
├── src/
│   ├── auth/              # sistema de autenticacion
│   ├── common/            # componentes comunes
│   ├── constants/         # constantes del juego
│   ├── game/              # componentes del juego
│   ├── protected/         # rutas protegidas
│   ├── services/          # servicios de API
│   └── views/             # paginas y vistas
└── public/
```

## Tecnologias

- **Frontend**: React 18 + Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **Auth**: JWT + Context API
- **Styling**: CSS modules