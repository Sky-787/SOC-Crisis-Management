# Crisis_Client 🛡️

Frontend del sistema asimétrico de gestión de crisis de ciberseguridad. Implementado con **React + Vite + Zustand + Tailwind CSS**.

## Descripción

El Crisis_Client provee las interfaces para los dos roles del sistema:
- **Monitor**: Observa métricas en tiempo real y dicta códigos de acción.
- **Técnico**: Ejecuta protocolos de mitigación ingresando los códigos.

## Instalación

```bash
# Navegar a la carpeta client
cd client

# Instalar dependencias
npm install
```

## Ejecución

```bash
# Modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Arquitectura

- **`/src/stores/crisisStore.js`**: Estado global centralizado con Zustand.
- **`/src/services/socketService.js`**: Singleton para comunicación vía Socket.io.
- **`/src/router/`**: Configuración de rutas y guardas de seguridad.
- **`/src/hooks/`**: Lógica compartida para estados críticos y fin de sesión.

## Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Lobby de registro | Público |
| `/ops/monitor` | Panel de control del Monitor | Solo Monitor |
| `/ops/bridge` | Terminal de acciones del Técnico | Solo Técnico |
| `/result` | Informe final de la crisis | Público tras sesión |

## Testing

```bash
npm test
```
Ejecuta los tests unitarios de Vitest que validan las propiedades de corrección (P8-P10).
