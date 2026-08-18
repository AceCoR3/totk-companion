# TOTK Companion v1.0.8.1 Hi-Res

Nur Kartenqualität geändert: Die App nutzt jetzt für Oberfläche, Himmel und Unterwelt jeweils das im Paket vorhandene Kartenbild mit der höchsten Auflösung. Layout, Marker, Filter, Mobile-UI und Bedienung bleiben unverändert.

# TOTK Companion v1.0.8.1 iOS Fix

iPhone/PWA-Fix: Safe-Area-Unterstützung für Notch, Dynamic Island und Home-Indikator, `viewport-fit=cover`, `100dvh` statt altem `100vh`, zusätzliche Mobile-Abstände und kompaktere Toolbar. Dadurch liegen Buttons nicht mehr direkt am Displayrand und die Karte nutzt die tatsächlich verfügbare Bildschirmhöhe.

# TOTK Companion v1.0.8 DE

Alle im Standortdatensatz tatsächlich vorhandenen Zusatznotizen sind jetzt deutsch. Neben den 900 Krog-Hinweisen wurden 147 Mayoi-Hinweise von `Cave containing this Bubbulfrog` zu `Mayoi in dieser Höhle` lokalisiert. Die übrigen Kategorien enthalten im Quelldatensatz keine individuellen englischen Zusatznotizen; dafür sind deutsche Kategorie-Hinweise hinterlegt, ohne Inhalte zu erfinden.

# TOTK Companion v1.0.7 DE

Neu: Alle 900 Krog-Marker mit Zusatznotiz verwenden jetzt deutsche Rätselhinweise. Der englische Ursprungswert bleibt intern als `note_original` erhalten.

# TOTK Companion v1.0.6 – Native Cluster

Clustering ist jetzt direkt in den originalen Marker-Renderer integriert. Cluster werden in Kartenkoordinaten berechnet und aktualisieren sich beim Zoomen. Unterhalb von ca. 235 % Zoom werden nahe Marker gebündelt; darüber erscheinen die originalen Einzelmarker.

# TOTK Companion v1.0.5 Cluster

Neu: Marker-Clustering beim Herauszoomen. Nahe Marker werden in einem Cluster mit Anzahl zusammengefasst. Beim Reinzoomen erscheinen wieder die originalen Marker. Klick auf einen Cluster zoomt hinein.

# TOTK Companion v1.0.4 PWA DE

Fix: Die Ebenen-Umschalter zeigen jetzt ausschließlich die originalen ROMFS-Icons für Oberfläche, Himmel und Unterwelt. Alte zusätzliche Glyphen/Pseudo-Icons wurden entfernt.

# TOTK Companion v1.0.3 PWA

Neu: installierbar als Progressive Web App mit iPhone-Homescreen-Icon, Standalone-Modus, Apple-Touch-Icon, Manifest und Offline-Service-Worker.

# TOTK Companion v1.0.2 DE

Neu: Purah-Pad-inspirierte Startanimation mit Scanlinie, rotierenden Sensorringen, Ladefortschritt und Statusmeldungen. Die Animation lässt sich durch Antippen/Klicken überspringen und respektiert `prefers-reduced-motion`.

# TOTK Companion v1.0.1 DE

Die Ebenen-Umschalter verwenden jetzt die originalen ROMFS-Icons `surface.png`, `sky.png` und `depths.png` für Oberfläche, Himmel und Unterwelt.

# TOTK Companion v1.0 DE

Neu: Alle Marker und Karten-Ortsnamen starten deaktiviert. Filter werden pro Kartenebene separat gespeichert und es erscheinen nur Kategorien, die auf der aktiven Ebene tatsächlich vorhanden sind.

# TOTK Companion v0.9 DE

Deutscher Tears-of-the-Kingdom Map Companion mit Surface/Sky/Depths, Zoom/Pan, ROMFS-Icons, Fortschritt, Kartenlabels und einer offiziellen deutschen Namensschicht.

## Start

ZIP entpacken und `index.html` öffnen.

Für die vollständige Namenssynchronisierung sollte beim ersten Start kurz eine Internetverbindung bestehen. Die erfolgreich geladenen deutschen Namen werden lokal im Browser gespeichert; danach funktioniert die Namensschicht offline weiter.

Details: `LOKALISIERUNG.md`.
