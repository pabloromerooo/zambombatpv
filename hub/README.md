# Solera TPV · servidor local (hub)

Conexión **fija** entre barra y cocina: los móviles se reconectan solos al abrir la app, aunque la cierren o estén mucho tiempo fuera. Sin internet y sin escanear QR.
Si el servidor no está, la app sigue funcionando como siempre con el emparejamiento por QR.

## Instalación (una sola vez, con internet, en la tablet de cocina)

1. Instala **Termux** desde F‑Droid (no la versión de Play Store).
2. En Termux:
   ```sh
   pkg update && pkg install nodejs git
   git clone https://github.com/pabloromerooo/zambombatpv.git
   cd zambombatpv/hub
   node pull.js admin@voldenstudio.com TU_CONTRASEÑA   # baja la carta, el objetivo y el código del evento
   ```
3. Cada vez que cambies la carta o el código en `/admin`, repite `node pull.js …` (con internet) y `git pull`.

## El día del evento

1. Activa el **Wi‑Fi del evento** (hotspot del móvil Android o router de viaje) y conecta la tablet y los móviles.
2. En Termux: `sh start.sh` (o `node hub.js`). Muestra el código del evento y las direcciones.
3. En la tablet, abre **http://localhost:8787** en Chrome → *Cocina* → entra con nombre y código.
   Menú → **Enlace para los móviles** muestra un QR con la dirección.
4. Los camareros escanean ese QR con la cámara del móvil (o escriben la dirección), entran con su nombre y el código, y listo.
   Para tenerla a mano: *Añadir a pantalla de inicio*.

## Caja (efectivo)

- Las 2 personas de caja entran con su nombre y el código, eligiendo **Caja** (o con una cuenta de rol Caja creada en `/admin` → Equipo).
- Cada pedido en efectivo les aparece solo, con lo que hay que cobrar, lo que dan y **la vuelta a preparar**. Solo caja puede cerrarlo (**COBRADO**); la tarjeta se da por cobrada al momento.
- La caja necesita el servidor local: sin él no recibe los pedidos.

## Notas

- La tablet debe estar enchufada y con Termux abierto (`start.sh` usa `termux-wake-lock`). Desactiva el ahorro de batería de Termux.
- En este modo no hay cuentas de la nube: se entra con nombre + código del evento. La carta sale de `data/config.json` (la que bajó `pull.js`).
- La copia de seguridad en la nube y las ventas en `/admin` solo cubren los móviles que usen la versión normal (https://solera.voldenstudio.com). Los pedidos del modo servidor se guardan en cada móvil y en la tablet; el cierre de caja sigue funcionando igual.
- Si cambia la IP de la tablet, el enlace cambia: usa de nuevo *Enlace para los móviles*.
