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
Al cambiar `index.html`, subir el número de versión `V` en `sw.js` (`zmb-v20` → `zmb-v21`).

## Cuentas y panel de administración

- **Acceso**: al abrir la app hay que iniciar sesión o *Crear cuenta* (nombre, correo, contraseña, Camarero/Cocina y el **código del evento**). La primera vez hace falta internet; después funciona sin conexión (la sesión se recuerda hasta 120 días y se revalida cuando hay red).
- **Roles**: `camarero` → barra · `cocina` → cocina · `admin` → todo + panel.
- **Panel**: `/admin` (admin.html). Carta y precios (añadir, editar, agotar, ordenar), equipo (rol/activo), código de acceso y atajos a cocina/barra. Los móviles descargan la carta actualizada cuando tienen internet.
- **Backend**: Supabase (Auth + tablas `profiles`, `menu_items`, `settings` con RLS + Edge Function `register`). La clave publicable del código es pública por diseño; la seguridad está en RLS.
- El primer admin es `admin@voldenstudio.com`: regístrate con ese correo desde *Crear cuenta*.

## Cobros y entrega en barra

- Al pulsar **ENVIAR A COCINA** se pregunta cómo han pagado: efectivo (con cálculo de cambio) o tarjeta.
- **Menú → Mis pedidos** muestra los pedidos activos; cada unidad tiene una casilla para ir tachando lo que ya se ha servido.
- El cierre de caja incluye el desglose por forma de cobro y lo pendiente de cobrar.

## Funciones de servicio (v2)

- **Marchando**: cocina pulsa *Empezar* y el camarero ve "🔥 marchando" en su móvil; después *Listo*.
- **Notas por producto** (✎ en cada producto: sin hielo, sin sal… o texto libre) y **mesa/nombre** del pedido.
- **Cocina y barra**: cada categoría la prepara la cocina o la sirve el camarero (se elige en `/admin`). La tablet muestra *Solo cocina* o *Todo*; las bebidas las sirve y tacha el camarero en su móvil, y un pedido solo de bebidas no pasa por cocina.
- **Agotados en vivo**: cocina marca lo que se acabó y desaparece de todas las barras conectadas.
- **Anular / Editar** un pedido (mientras cocina no lo haya empezado) y **⚡ Prisa** desde "Mis pedidos".
- **Avisos** de cocina a camareros (📢), a todos o a uno.
- **Donativo / redondeo** al cobrar, **arqueo de efectivo** (cuadra o sobra/falta) y **marcador de recaudación** con objetivo.
- **Copia en la nube**: los pedidos y arqueos suben a Supabase cuando el móvil tiene internet.
- **/admin → Ventas**: recaudado, forma de cobro, por camarero, lo más vendido, ventas por hora, arqueos y CSV; **Evento y acceso**: nombre, objetivo y código.

## Conexión barra ↔ cocina: guía anti-cortes

- La tablet de cocina muestra **siempre** un panel *Conectar camarero* (QR + cámara). El camarero solo escanea el QR de la tablet y le enseña el suyo; nadie toca la tablet. Si se cae la última conexión, el panel se abre solo.
- **Menú → Diagnóstico de conexión** (barra y cocina) guarda por qué se corta: pantalla apagada, app en segundo plano, Wi‑Fi, tiempo conectado…
- Android: apaga "Cambio automático de red" / "Smart network switch" y, si sale "Wi‑Fi sin internet", elige **mantener conexión**. Quita el ahorro de batería del navegador y del hotspot.
- iPhone: instala la app en la pantalla de inicio, ponla en **Ajustes → Pantalla → Bloqueo automático: Nunca** durante el servicio y no cambies de app.
- Tablet de cocina: siempre enchufada, brillo bajo, sin pasar a otra app.

## Servidor local (conexión fija)

Para que barra y cocina no se desconecten nunca, la tablet puede ejecutar un pequeño servidor (`hub/`). Ver [hub/README.md](hub/README.md).
