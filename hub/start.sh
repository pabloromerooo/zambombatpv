#!/data/data/com.termux/files/usr/bin/sh
# Arranque rápido en Termux: mantiene el móvil/tablet despierto y lanza el servidor.
termux-wake-lock 2>/dev/null
cd "$(dirname "$0")" && node hub.js "$@"
