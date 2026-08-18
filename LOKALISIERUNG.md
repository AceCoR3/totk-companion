# Lokalisierung v0.9

Die App verwendet eine separate Namensschicht: Marker-IDs und englische Originalschlüssel bleiben stabil, die Anzeige verwendet deutsche Namen.

## Quellen

- Primär: mehrsprachiger Tears-of-the-Kingdom-Location-Textdump (Spalten ENG/DEU) von Giocatori Nintendo, abgeleitet aus den Spieldaten.
- Cross-Check: deutschsprachige TOTK-Datenbanken/Guides für Schreine und Ortsnamen.

## Verhalten

- Ein verifizierter Starter-Satz deutscher Originalnamen ist offline eingebettet.
- Beim Start versucht die App, die komplette ENG→DEU-Tabelle über die öffentliche WordPress-Schnittstelle zu laden.
- Erfolgreiche Zuordnungen werden im Browser-LocalStorage gespeichert und danach auch offline benutzt.
- Die englischen Namen bleiben als Suchalias und interner Schlüssel erhalten.
- Im Menü `Werkzeuge > Deutsche Originalnamen` zeigt ein Balken die Abdeckung an. Mit `Originalnamen aktualisieren` kann die Synchronisierung manuell neu angestoßen werden.

Es werden keine frei erfundenen Übersetzungen als offizielle Namen ausgegeben.
