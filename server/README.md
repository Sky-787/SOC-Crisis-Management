# SOC Crisis Management — Crisis_Server 🛡️

Backend del sistema asimétrico de gestión de crisis de ciberseguridad. Dos jugadores coordinan en tiempo real para detener un ataque de ransomware: el **Monitor** observa las métricas del sistema y el **Técnico** ejecuta los protocolos de mitigación.

---

## Tabla de Contenidos

- [Descripción del Sistema](#descripción-del-sistema)
- [Roles de Jugadores](#roles-de-jugadores)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Eventos Socket.io](#eventos-socketio)
- [Endpoints REST](#endpoints-rest)
- [Tests](#tests)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Descripción del Sistema

El Crisis_Server simula una infraestructura bajo ataque de ransomware. No requiere hardware ni base de datos — todo el estado vive en memoria. El servidor:

- Gestiona **salas (rooms)** donde se agrupan las parejas de jugadores
- Ejecuta un **ciclo de degradación automático** cada segundo que incrementa el porcentaje de archivos encriptados
- Valida los **códigos de acción** que el Monitor dicta verbalmente al Técnico
- Sincroniza el estado en tiempo real vía **Socket.io**
- Expone una **API REST** documentada con Swagger para inspección y testing

---

## Roles de Jugadores

| Rol | Ruta del cliente | Responsabilidad |
|-----|-----------------|-----------------|
| **Monitor** | `/ops/monitor` | Observa métricas en tiempo real y dicta el Action_Code al Técnico |
| **Técnico** | `/ops/bridge` | Ejecuta protocolos de mitigación ingresando el código dictado por el Monitor |

El primer jugador en unirse a una sala recibe el rol **Monitor**. El segundo recibe el rol **Técnico**.

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

No se requiere base de datos ni servicios externos.

---

## Instalación

```bash
# Desde la raíz del monorepo
cd server
npm install
```

---

## Configuración

Copiá el archivo de ejemplo y ajustá los valores:

```bash
cp .env.example .env
```

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `PORT` | `3001` | Puerto del servidor HTTP |
| `ROOM_CODE_INTERVAL_MS` | `15000` | Intervalo en ms para renovar el Action_Code |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origen del cliente React (CORS) |

---

## Ejecución

```bash
# Producción
npm start

# Desarrollo (con hot-reload)
npm run dev
```

El servidor queda disponible en `http://localhost:3001`.

---

## Eventos Socket.io

Conectarse a `ws://localhost:3001` con un cliente Socket.io.

### Cliente → Servidor

#### `join-room`
Unirse a una sala. El primer jugador recibe rol Monitor, el segundo Técnico.

```json
{
  "room_id": "ALPHA-01",
  "playerName": "Ana",
  "role": "Monitor"
}
```

#### `action`
Ejecutar un protocolo de mitigación (solo el Técnico).

```json
{
  "protocol": "generate-decryption-key",
  "action_code": "A3X9KL"
}
```

Para `block-ip`, incluir `target_ip`:

```json
{
  "protocol": "block-ip",
  "action_code": "A3X9KL",
  "target_ip": "192.168.1.101"
}
```

### Servidor → Cliente

| Evento | Receptor | Descripción | Payload |
|--------|----------|-------------|---------|
| `room-joined` | el cliente que se unió | Confirmación de unión con rol asignado | `{ room_id, role }` |
| `join-error` | el cliente rechazado | Error al unirse | `{ message }` |
| `session-ready` | ambos jugadores | La sesión inició (2 jugadores conectados) | `{ room_id }` |
| `update-state` | ambos jugadores | Estado actualizado cada segundo | `CrisisState` |
| `action-code-update` | solo el Monitor | Nuevo código de acción (cada 15s) | `{ code }` |
| `action-result` | ambos jugadores | Resultado de una acción del Técnico | `{ success, protocol?, effect?, reason? }` |
| `crisis-resolved` | ambos jugadores | Victoria — encriptación llegó a 0% | `{ crisis_score, tiempo_total_segundos, encryption_percentage_final }` |
| `crisis-lost` | ambos jugadores | Derrota — encriptación llegó a 100% | `{ crisis_score, tiempo_total_segundos, encryption_percentage_final }` |
| `player-disconnected` | el jugador restante | El compañero se desconectó | `{ message }` |

### Protocolos disponibles

| Protocolo | Efecto |
|-----------|--------|
| `isolate-network` | Reduce el volumen de tráfico sospechoso en 50% |
| `generate-decryption-key` | Reduce el porcentaje de encriptación en 30 puntos |
| `block-ip` | Elimina una IP específica del mapa de tráfico |

### Razones de rechazo de `action-result`

| `reason` | Causa |
|----------|-------|
| `invalid_code` | El código no coincide con el generado para el Monitor |
| `expired_code` | El código fue renovado antes de usarlo |
| `unauthorized_role` | El emisor es Monitor, no Técnico |
| `unknown_protocol` | El protocolo no existe |

---

## Endpoints REST

Documentación interactiva disponible en **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)** (Swagger UI).

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| `GET` | `/api/rooms` | Lista todas las rooms activas | `200` array de resúmenes |
| `GET` | `/api/rooms/:room_id` | CrisisState completo de una room | `200` CrisisState / `404` |
| `POST` | `/api/rooms` | Crea una room vacía | `201` `{ room_id }` |
| `GET` | `/api/docs` | Swagger UI | `200` HTML |

### Ejemplo — listar rooms

```bash
curl http://localhost:3001/api/rooms
# [{ "room_id": "ALPHA-01", "playerCount": 2, "encryptionPercentage": 35 }]
```

### Ejemplo — crear room

```bash
curl -X POST http://localhost:3001/api/rooms
# { "room_id": "BRAVO-07" }
```

---

## Tests

```bash
npm test
```

Corre los **property-based tests** con [fast-check](https://fast-check.io/) que validan las propiedades de corrección del sistema:

| Test | Propiedad verificada |
|------|---------------------|
| P1 | El `encryptionPercentage` nunca decrece ni supera 100 durante la degradación |
| P2 | El `CrisisState` sobrevive un round-trip de serialización JSON |
| P3 | Bloquear la misma IP dos veces es idempotente |
| P4 | Aplicar un protocolo en una room no afecta el estado de otra |
| P5 | La tasa de colisión de Action_Codes entre rooms es < 0.01% |
| P6 | `generate-decryption-key` nunca lleva el porcentaje por debajo de 0 |
| P7 | El `accessLog` siempre crece después de cada ciclo o acción |

---

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/
│   │   └── index.js          # Variables de entorno (PORT, CORS, intervalos)
│   ├── rooms/
│   │   ├── RoomManager.js    # Singleton — gestión de rooms en memoria
│   │   └── RoomState.js      # Factory del CrisisState inicial
│   ├── protocols/
│   │   ├── isolate-network.js        # Función pura: reduce tráfico 50%
│   │   ├── generate-decryption-key.js # Función pura: reduce encriptación 30%
│   │   └── block-ip.js               # Función pura: elimina IP del mapa
│   ├── socket/
│   │   └── handlers.js       # Handlers de eventos Socket.io
│   ├── routes/
│   │   └── rooms.js          # Rutas REST Express
│   ├── swagger/
│   │   └── definition.js     # Definición OpenAPI 3.0
│   └── app.js                # Bootstrap del servidor
├── tests/
│   └── protocols.test.js     # Property-based tests (fast-check)
├── .env.example              # Variables de entorno de ejemplo
├── package.json
└── README.md
```
