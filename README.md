<div align="center">

# 🛡️ SOC Crisis Management

**Sistema asimétrico de gestión de crisis de ciberseguridad en tiempo real**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ¿Qué es esto?

Dos jugadores. Una crisis. Comunicación verbal como única arma.

Un ataque de ransomware está encriptando los archivos del sistema en tiempo real. El **Monitor** observa las métricas del sistema y dicta códigos de acción. El **Técnico** los ejecuta antes de que sea demasiado tarde. Si el porcentaje de encriptación llega al 100%, el sistema colapsa.

```
┌─────────────────────────────────────────────────────────────┐
│                    CRISIS EN PROGRESO                       │
│                                                             │
│  MONITOR 👁️                        TÉCNICO ⚡              │
│  ─────────────────                 ──────────────────────   │
│  • Ve métricas en tiempo real      • Ejecuta protocolos     │
│  • Recibe el Action_Code           • Ingresa el código      │
│  • Dicta el código verbalmente     • Mitiga el ataque       │
│                                                             │
│              ↕ Comunicación verbal ↕                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js · Express · Socket.io · Swagger |
| **Frontend** | React · React Router v7 · Zustand · Tailwind CSS |
| **Testing** | fast-check (property-based testing) · Vitest |
| **Monorepo** | `server/` + `client/` independientes |

---

## Estructura del Proyecto

```
SOC-Crisis-Management/
├── server/          # Crisis_Server — Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/          # Variables de entorno
│   │   ├── rooms/           # RoomManager (singleton) + RoomState
│   │   ├── protocols/       # Funciones puras de mitigación
│   │   ├── socket/          # Handlers de eventos Socket.io
│   │   ├── routes/          # API REST
│   │   ├── swagger/         # Documentación OpenAPI
│   │   └── app.js           # Bootstrap del servidor
│   ├── tests/               # Property-based tests (fast-check)
│   └── README.md            # Documentación del backend
│
└── client/          # Crisis_Client — React + Zustand + Tailwind
    ├── src/
    │   ├── components/      # Componentes atómicos reutilizables
    │   ├── pages/           # Lobby · Monitor · Bridge · Result
    │   ├── stores/          # Crisis_Store (Zustand)
    │   ├── services/        # Socket_Service (singleton)
    │   ├── hooks/           # useCriticalState · useSessionEnd
    │   └── router/          # Rutas + ProtectedRoute
    └── README.md            # Documentación del frontend
```

---

## Instalación y Ejecución

### Requisitos

- Node.js v18+
- npm v9+

### Backend

```bash
cd server
npm install
cp .env.example .env   # ajustar variables si es necesario
npm start
# 🚀 http://localhost:3001
# 📖 http://localhost:3001/api/docs  (Swagger UI)
```

### Frontend

```bash
cd client
npm install
npm run dev
# ➜ http://localhost:5173
```

### Cómo jugar

1. Abrí **dos pestañas** del navegador en `http://localhost:5173`
2. En la primera: ingresá tu nombre, un Room ID (ej: `ALPHA-01`) y seleccioná **Monitor**
3. En la segunda: ingresá tu nombre, el **mismo Room ID** y seleccioná **Técnico**
4. La sesión inicia automáticamente cuando ambos están conectados
5. El Monitor dicta el código en voz alta → el Técnico lo ingresa y ejecuta el protocolo

---

## Roles

### 👁️ Monitor — `/ops/monitor`
- Ve el porcentaje de encriptación en tiempo real
- Observa el mapa de tráfico sospechoso y los logs de acceso
- Recibe el **Action_Code** (se renueva cada 15 segundos)
- **Dicta el código verbalmente al Técnico**

### ⚡ Técnico — `/ops/bridge`
- Ingresa el código dictado por el Monitor
- Ejecuta uno de los tres protocolos de mitigación:

| Protocolo | Efecto |
|-----------|--------|
| `isolate-network` | Reduce el tráfico sospechoso en 50% |
| `generate-decryption-key` | Baja la encriptación en 30 puntos |
| `block-ip` | Elimina una IP específica del mapa |

---

## Tests

```bash
# Backend — property-based tests con fast-check
cd server && npm test

# Frontend — tests del store y componentes
cd client && npm test
```

Los tests del backend validan 7 propiedades de corrección del sistema (P1–P7): degradación monotónica, serialización, idempotencia, independencia de salas, unicidad de códigos, acotamiento y crecimiento del log.

---

## Integrantes

| Nombre | Rol en el proyecto |
|--------|--------------------|
| *(tu nombre)* | Backend — Crisis_Server |
| *(nombre compañera)* | Frontend — Crisis_Client |

**Temática elegida**: Ciberseguridad (SOC — Security Operations Center)

---

## Documentación adicional

- 📖 [README del Backend](./server/README.md) — eventos Socket.io, endpoints REST, variables de entorno
- 📖 [README del Frontend](./client/README.md) — rutas, store, socket service
- 🔍 [Swagger UI](http://localhost:3001/api/docs) — documentación interactiva de la API REST (requiere servidor corriendo)
