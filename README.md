# Solera TPV (by Vølden)

Web app de un solo archivo para comandas de un evento: **barra** (móviles) y **cocina** (tablet). Funciona sin internet y sin servidor: datos en IndexedDB y sincronización por WebRTC en la red Wi-Fi local.

## Instalar (PWA)
1. Abrir la URL publicada **con internet, una vez**.
2. Android (Chrome): menú ⋮ → Instalar aplicación. iPhone (Safari): Compartir → Añadir a pantalla de inicio.
3. Elegir BARRA o COCINA desde el icono.

## Conectar (y reconectar tras un corte)
1. Cocina: pulsar el indicador de conexión → aparece un QR.
2. Móvil: pulsar su indicador (se abre la cámara) y escanear el QR de la cocina.
3. El móvil muestra otro QR: enseñárselo a la cámara de la tablet. Conectado (~10 s).

Si no hay cámara, hay un código de texto alternativo. Los pedidos hechos sin conexión quedan en cola y se envían solos al reconectar.

## Actualizar
Al cambiar `index.html`, subir el número de versión `V` en `sw.js` (`zmb-v4` → `zmb-v5`).
