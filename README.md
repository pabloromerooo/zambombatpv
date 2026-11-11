# Zambomba · Comandas (TPV offline)

Web app de un solo archivo para comandas de un evento: **barra** (móviles) y **cocina** (tablet). Funciona sin internet y sin servidor: datos en IndexedDB y sincronización por WebRTC en la red Wi-Fi local.

## Instalar (PWA)
1. Abrir la URL publicada **con internet, una vez**.
2. Android (Chrome): menú ⋮ → Instalar aplicación. iPhone (Safari): Compartir → Añadir a pantalla de inicio.
3. Elegir BARRA o COCINA desde el icono.

## Conectar dispositivos
En cocina: pulsar el indicador de conexión → copiar CÓDIGO A al móvil. En el móvil: pegar A, generar CÓDIGO B y pegarlo en cocina.

## Actualizar
Al cambiar `index.html`, subir el número de versión `V` en `sw.js` (`zmb-v1` → `zmb-v2`).
