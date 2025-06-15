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
