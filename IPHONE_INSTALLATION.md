# iPhone-Installation

Damit der TOTK Companion wie eine App auf dem iPhone-Homescreen läuft, muss er über eine HTTPS-Adresse geöffnet werden.

## Installation auf dem iPhone

1. Öffne die veröffentlichte Companion-Seite in Safari.
2. Tippe unten auf **Teilen**.
3. Wähle **Zum Home-Bildschirm**.
4. Bestätige mit **Hinzufügen**.

Danach startet der Companion im Standalone-Modus ohne normale Safari-Leiste.

## Wichtig

Eine PWA kann auf iOS nicht vollständig aus einer lokal entpackten ZIP-Datei per `file://` installiert werden.
Für Homescreen + Offline-Cache muss der Ordner über HTTPS bereitgestellt werden, z. B. über:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel
- eigenen Webspace

Sobald die Seite einmal geladen wurde, übernimmt der Service Worker die App-Dateien in den Offline-Cache.
