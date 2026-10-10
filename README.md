# Kletteratlas

[![Jetzt ausprobieren](https://img.shields.io/badge/Jetzt%20ausprobieren-Kletteratlas-28157a?style=for-the-badge&logo=googlemaps&logoColor=white)](https://enteee.github.io/Chl-dderi/)
[![Deploy to GitHub Pages](https://github.com/Enteee/Chl-dderi/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/Enteee/Chl-dderi/actions/workflows/pages.yml)

Karte und Liste von Sportklettergebieten – als App für den Homescreen, auf Deutsch und Englisch, mit Parkplätzen, Zustiegswegen, Navigation zum Parkplatz, Routenlängen, Wetter, Regen- und Trocknungs-Info, Logbuch und Favoriten, die wirklich gespeichert bleiben. Die Gebiete selbst kommen als **Mappack** dazu: eine Datei pro Region, die du in der App lädst und wieder entlädst.

**Zur App: <https://enteee.github.io/Chl-dderi/>**

Frisch installiert bringt die App eine **Kostprobe** mit: eine Handvoll Gebiete zum Ausprobieren. Alles weitere kommt über *Mappacks*. Oben wechselst du zwischen den geladenen Regionen; alle Filter gelten jeweils innerhalb der gewählten Region. Dieses Repository enthält die App und das Format – die Gebietsdaten selbst gehören nicht dazu.

Hervorgegangen aus einem Single-Pitch-Atlas für eine einzige Region, der ersten Version dieses Repositorys.

## Auf den Homescreen

- **iPhone/iPad:** Adresse in Safari öffnen → Teilen → *Zum Home-Bildschirm*.
- **Android:** Adresse in Chrome öffnen → Menü ⋮ → *App installieren* (oder in der App: *Mehr → Als App installieren*).

Die App startet danach auch ohne Netz. Kartenkacheln, die du einmal angeschaut hast, bleiben offline verfügbar.

## Was die App kann

- **Karte:** Doppelklick oder Doppeltipp zoomt an der Stelle hinein (Shift + Doppelklick hinaus). Ein Tipp auf ein Gebiet zeigt Zustieg und Parkplatz. *Gebiet öffnen* führt zur Gebietsseite, *Anfahrt* startet Google Maps mit der Route von deinem Standort zum Parkplatz. Auf der Gebietsseite gibt es dieselbe Navigation mit Google Maps und, auf Apple-Geräten, mit Apple Karten.
- **Gebietsseite:** Kopf mit Gradverteilung, Kacheln mit dem Wichtigsten auf einen Blick und eine Leiste, die direkt zu Zustieg, Topos, Routen, Regen, Logbuch und Details springt. Die Routen sind nummeriert und der Grad ist nach Gradbereich eingefärbt. Wo die Reihenfolge an der Wand bekannt ist, ist die Nummer der Platz an der Wand von links nach rechts; sonst der Platz in der Routenliste. Die Nummer bleibt beim Sortieren an der Route. Die Gebietsseite zeigt keine Quellenangaben.
- **Absicherung:** Wo es ausdrücklich beschrieben ist, zeigt die Gebietsseite, ob eng/gut oder weit gebohrt ist und ob die Haken neu oder alt sind – mit Wortlaut. Der Filter *Absicherung* findet eng gebohrte oder neu eingerichtete Gebiete oder blendet weit gebohrte und alte aus. Die meisten Gebiete haben keine solche Angabe.
- **Filter:** Grad, Sterne, Zustieg, Ausrichtung, Absicherung, Regen, Routenlänge und mehr. Grad und Sterne gelten für dieselbe Route – «mindestens 3 Routen von 6a bis 6c+ mit ★★★★ oder mehr» findet also Gebiete, in denen es solche Routen wirklich gibt. Die Sortierung *Passende Routen* stellt die ergiebigsten Gebiete nach oben.
- **Regen:** Im Kartenmenü (Ebenen-Knopf) unter *Regenradar* das Radar der letzten 2 Stunden (animiert) oder das neueste, schärfere Bild der italienischen Protezione Civile einblenden. An den Gebieten zeigen Tropfen, wo es gerade regnet, wo der Fels wohl noch nass ist und wo bald Regen erwartet wird. Der Filter *Jetzt trocken* (auch unter *Filter → Regen*) blendet alles andere aus, und jede Gebietsseite zeigt den Regen der letzten und nächsten 24 Stunden.
- **Schweiz:** Für ein Mappack, das in der Schweiz liegt, dient die Landeskarte von swisstopo (oder das swisstopo-Luftbild) als Kartenhintergrund, darüber die offiziellen Wanderwege. Unter *Ebenen swisstopo* lassen sich die Wanderwege und die Wildruhezonen (BAFU) ein- und ausschalten. Jede Region merkt sich ihren eigenen Hintergrund.
- **Wetter pro Gebiet:** Die Gebietsseite zeigt im Abschnitt *Wetter* sieben Tage mit Symbol, Höchst- und Tiefsttemperatur, Regen mit Wahrscheinlichkeit, Sonnenschein und Wind; ein Tipp auf einen Tag zeigt die Werte alle 3 Stunden und die Nullgradgrenze. In der Schweiz stammen die Werte aus dem Modell ICON-CH1/CH2 der MeteoSchweiz und gelten für die Höhe der Wand (Höhenmodell swisstopo). Auch Regenstatus und Filter *Jetzt trocken* nutzen dort das MeteoSchweiz-Modell.
- **Zustieg planen (Schweiz):** *Auf swisstopo-Wegen planen* im Abschnitt Zustieg sucht den Weg vom Parkplatz (oder vom eigenen Standort oder einem Punkt auf der Karte) zur Wand über die Wanderwege von swisstopo. Angezeigt werden Länge, Auf- und Abstieg, Wanderzeit hin und zurück, ein Höhenprofil und der Anteil Wanderweg, Bergwanderweg, Alpinwanderweg und weglos. Start, Ziel und Zwischenpunkte lassen sich auf der Karte verschieben; die Route gibt es als GPX-Datei.
- **Trocknet schnell:** eine Schätzung aus Sonne und Ausrichtung (sonnige Südwände trocknen schnell, schattige Nordwände langsam). In der App ist sie als Schätzung gekennzeichnet; wo nasser Fels ausdrücklich gemeldet ist, gilt diese Angabe.
- **Logbuch:** Bei jeder Route auf ⊕ tippen und Datum, Stil (Onsight, Flash, Rotpunkt, Toprope, Versuch) und eigene Sterne eintragen. Die Seite *Logbuch* zeigt Zahlen, die schwersten Routen und alle Einträge und exportiert sie als CSV-Datei. Über den Filter *Mein Logbuch* findest du Gebiete mit Routen, die noch offen sind.
- **Wissenswertes** (unter *Mehr*): Grad-Umrechner (Französisch, UIAA, USA, Grossbritannien, Australien, Sachsen, Skandinavien), Rekorde aus den geladenen Daten, und was das Mappack an Fakten und an einem Glossar mitbringt.

## Mappacks: Regionen laden und entladen

Die Gebietsdaten stecken nicht in der App, sondern in **Mappacks**: eine JSON-Datei pro Region mit den Gebieten, Routen, Parkplätzen, Zonen – und mit den Texten, die zu dieser Region gehören (Gestein, Kletterführer, Quellen-Seiten, Fakten, Glossar). Die App selbst kennt keine Region; sie zeigt, was geladen ist.

- **Laden:** auf das **+** neben der Regionenleiste tippen (oder *Mehr → Regionen*). Dort lässt sich eine Adresse eingeben oder eine Datei vom Gerät wählen. Die Kostprobe tritt zur Seite, sobald das erste eigene Pack geladen ist, und kommt zurück, wenn das letzte entladen wird.
- **Offline:** Ein geladenes Pack liegt im Cache-Speicher des Browsers (`finale-atlas-packs`) und ist auch ohne Netz da. *Neu holen* lädt dieselbe Adresse noch einmal, wenn es neue Daten gibt. Geladene Packs gelten für alle Fenster; andere Tabs ziehen nach.
- **Entladen:** gibt den Platz wieder frei. **Favoriten und Logbuch bleiben** – sie hängen an Gebiets- und Routenschlüsseln und tauchen wieder auf, sobald das Pack zurück ist. Auf der Favoritenseite steht, wie viele Einträge gerade zu einer nicht geladenen Region gehören.
- **Fremde Adressen** müssen CORS erlauben. Die App prüft jedes Pack, bevor sie es übernimmt, und sagt im Klartext, was ihr fehlt; nichts aus einem Pack wird als HTML eingesetzt.

### Ein eigenes Mappack

Das Format steht in [`mappack.schema.json`](mappack.schema.json) (JSON Schema 2020-12):

- **Pflicht:** `format`, `formatVersion`, `id` (wird zum Regionenschlüssel), `name` in Deutsch und Englisch, `version` und die Gebiete in `sectors`.
- **Daten:** `areas` (Zonen), `parks` (Parkplätze), `picSrc` (Bildquellen), `labels` (Ortsnamen für die Karte), `outline` (GeoJSON unter den Kacheln), `stats`, `counts`, `view` und `bbox`.
- **Schalter:** `ch` (Schweiz: swisstopo-Karten und -Wanderwege, MeteoSchweiz, Zustiegsplaner), `partial` (Kostprobe).
- **Texte** in `text`: `rock` (Gestein der Region), `guide` (Kletterführer-Zeile), `guideRef`, `noPics`, `links` (wie die Links eines Gebiets heissen), `licence`, `pages` (eigene Seiten unter *Mehr*), `facts` und `glossary`. In diesen Texten gelten `**fett**` und `[Text](https://…)`, sonst nichts.
- Unbekannte Felder darf ein Pack mitbringen – eine ältere App übergeht sie.

In `maps/` liegen die Packs. `maps/pack.showcase.json` ist die Kostprobe; sie steckt zusätzlich in `index.html`, zwischen den Markierungen `SHOWCASE:BEGIN` und `SHOWCASE:END`.

`tools/make-packs.sh` prüft jedes Pack in `maps/`: Format, eindeutige Gebiets-IDs, auflösbare Parkplatz- und Zonenverweise, Bildquellen, Zählstände, und dass kein Gebiet in zwei Packs steckt. `--check` schreibt nichts; ohne Argument setzt es die Kostprobe in `index.html` ein. Eine neue Kostprobe schneidet

```sh
tools/make-packs.sh --showcase-from maps/pack-deiner-region.json --ids erstes-gebiet,zweites-gebiet
```

aus einem vollen Pack heraus – mit Parkplätzen und Zonen, aber ohne dessen Seiten, Fakten und Glossar. Nötig sind nur `jq` und `perl`. Die gleiche Prüfung samt Schema-Validierung läuft bei jedem Push in [`packs.yml`](.github/workflows/packs.yml).

## Favoriten und Logbuch sichern

Favoriten und Logbuch werden dreifach auf dem Gerät gespeichert und nach jedem Speichern zurückgelesen. Auf den Seiten *Favoriten* und *Logbuch* steht, ob das Speichern geklappt hat.

Wichtig auf dem iPhone: Die Homescreen-App und Safari haben **getrennte** Speicher. Was du in Safari gespeichert hast, erscheint nicht automatisch in der Homescreen-App. Dafür gibt es unter *Favoriten* und unter *Logbuch* den Abschnitt *Sichern und übertragen* mit einem Code, der beides enthält: in der einen App *Code kopieren*, in der anderen einfügen und *Aus Code übernehmen*. Das funktioniert auch zwischen zwei Geräten.

Bevor du das Icon vom Homescreen löschst, kopiere den Code: Auf dem iPhone verschwindet mit dem Icon in der Regel auch der Speicher dieser App. Es lohnt sich, den Code ab und zu in einer Notiz abzulegen.

## Aktualisieren

Im Repository **Add file → Upload files**, die neuen Dateien hochladen (gleiche Namen ersetzen die alten) und **Commit changes** – oder wie gewohnt mit Git auf `main` pushen. Jeder Commit auf `main` wird automatisch veröffentlicht (siehe unten).

**Vorher die aktuelle Fassung holen:** Ein Upload ersetzt die ganze Datei. Wer `index.html` lokal weiterbearbeitet, lädt zuerst die aktuelle Version von `main` herunter – sonst gehen Änderungen verloren, die inzwischen im Repository dazugekommen sind. Die Versionsnummer setzt der Workflow bei jeder Veröffentlichung selbst (Datum + Commit, in `sw.js`, `index.html` und `version.json`); von Hand muss nichts erhöht werden.

Die App merkt beim Start und immer, wenn sie wieder in den Vordergrund kommt (höchstens alle 30 Minuten), dass eine neuere Version veröffentlicht ist, und bietet *Neu laden* an. Unter *Mehr → App* steht die laufende Version, und *Neueste Version laden* holt die App-Dateien jederzeit frisch – Favoriten, Logbuch, Einstellungen und Filter bleiben dabei erhalten. Die App holt sich die neue Version beim nächsten Start mit Netz selbst – spätestens beim zweiten Öffnen ist sie da. Favoriten, Logbuch und Einstellungen bleiben erhalten.

Der Name unter einem Icon, das schon auf dem Homescreen liegt, ändert sich auf dem iPhone nicht von selbst. Wer dort den neuen Namen «Kletteratlas» sehen will: Code kopieren (siehe oben), Icon löschen, Seite in Safari neu zum Home-Bildschirm hinzufügen, Code einfügen.

## Veröffentlichung (GitHub Pages)

Jeder Push auf `main` startet den Workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Er veröffentlicht alle Web-Dateien aus dem Hauptordner (`*.html`, `*.js`, `*.json`, `*.webmanifest`, `*.png`, `*.svg`, `*.ico`) unter <https://enteee.github.io/Chl-dderi/>. Das Status-Badge oben zeigt, ob der letzte Lauf geklappt hat; manuell starten über **Actions → Deploy to GitHub Pages → Run workflow**.

- Einmalig nötig: **Settings → Pages → Build and deployment → Source = *GitHub Actions***.
- GitHub Pages gibt es für **private** Repositories nur mit einem bezahlten GitHub-Plan (z. B. Pro). Mit dem Gratis-Plan schaltet GitHub Pages ab, sobald das Repository privat wird, und der Workflow scheitert mit «Get Pages site failed». Die veröffentlichte Seite selbst ist in jedem Fall öffentlich.
- Die App-Dateien liegen absichtlich alle auf einer Ebene, ohne Unterordner. Neue Dateien dieser Typen werden automatisch mitveröffentlicht.
- Der Ordner `maps/` wird **nicht** veröffentlicht: Mappacks gehören nicht zur App. Wer eigene Packs anbieten will, legt sie dorthin, wo er sie haben will (eigenes Repository, Webspace, Cloud) und gibt ihre Adresse in der App ein.
- Lokal testen: `tools/serve.pl` starten (oder `python3 -m http.server`) und <http://localhost:8000/> öffnen. Der Service Worker, der Cache-Speicher für die Mappacks und das Laden eines Packs von einer Adresse laufen nur über `http(s)://`, nicht beim direkten Öffnen der Datei.

### Eigene Kopie

1. Dieses Repository forken (der Workflow kommt mit).
2. **Settings → Pages → Source = *GitHub Actions***.
3. Einen Commit auf `main` pushen oder den Workflow manuell starten. Die App läuft dann unter `https://<GitHub-Name>.github.io/<Name des Repositorys>/`.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | die ganze App samt Kostprobe |
| `mappack.schema.json` | das Format eines Mappacks (JSON Schema) |
| `maps/pack.showcase.json` | die Kostprobe, wie sie in `index.html` steckt |
| `maps/pack.*.json` | weitere Mappacks, die hier liegen (werden nicht veröffentlicht) |
| `tools/make-packs.sh` | prüft die Mappacks und setzt die Kostprobe in die App ein |
| `tools/serve.pl` | kleiner lokaler Server zum Ausprobieren |
| `sw.js` | macht die App offline-fähig |
| `manifest.webmanifest` | Name, Farben und Icons für die Installation |
| `icon-*.png`, `apple-touch-icon.png`, `favicon*` | App-Icon in allen nötigen Grössen |
| `.github/workflows/pages.yml` | veröffentlicht die App bei jedem Push auf `main` |
| `.github/workflows/packs.yml` | prüft die Mappacks gegen das Schema |

## Daten und Grenzen

Was in einem Mappack steht, verantwortet dieses Pack: es bringt seine Quellen- und Lizenzhinweise selbst mit (*Mehr → Über* und die Seiten unter *Mehr → Über die Daten*). Für die App gilt:

- **Zustiegswege** sind berechnet (BRouter auf OpenStreetMap-Daten oder, in der Schweiz, die swissTLM3D-Wanderwege) und nicht vor Ort geprüft. Parkplätze mit hellem, umrandetem P sind geschätzt.
- **Trocknet schnell** ist eine Schätzung aus Sonne und Ausrichtung und in der App als solche gekennzeichnet; wo eine Quelle etwas anderes sagt, gilt die Quelle.
- **Regen und Wetter** sind **Modellwerte** von [Open-Meteo](https://open-meteo.com/) (Raster ca. 1 km, stündlich, 2 Tage zurück und 2 Tage voraus) – keine Messung an der Wand; Gewitter verfehlt ein Modell oft. «Jetzt trocken» heisst: kein Regen jetzt, keiner in den nächsten 6 Stunden erwartet und weniger als 1 mm in der Zeit, die die Wand laut Schätzung zum Trocknen braucht (12 h schnell, 24 h mittel, 48 h langsam). Die Werte werden alle 30 Minuten neu geholt und nie für offline zwischengespeichert.
- **Schweiz:** Modell ICON-CH1/CH2 der [MeteoSchweiz](https://www.meteoschweiz.admin.ch/) (1–2 km, rund 5 Tage), abgefragt über Open-Meteo. Tage 6–7 und die Regenwahrscheinlichkeit stammen aus den Standardmodellen von Open-Meteo. Die Temperaturen gelten für die Höhe der Wand aus dem Höhenmodell von swisstopo.
- **Zustiegsplaner (Schweiz):** Wegnetz aus den swissTLM3D-Wanderwegen (über api3.geo.admin.ch), Höhen aus dem Höhenmodell von swisstopo, Wanderzeit nach der Formel der Schweizer Wanderwege, ohne Pausen. Kletterer-Pfade zur Wand sind meist nicht im Wegnetz; diese Stücke sind gepunktet (Luftlinie) und vor Ort zu prüfen. Sind die Wanderwege nicht erreichbar, rechnet der Planer mit BRouter auf OpenStreetMap und sagt das.
- **Regenradar:** [RainViewer](https://www.rainviewer.com/) (kostenlos, seit 2026 nur bis Zoomstufe 7, darum vergrössert und eher unscharf) und [Radar-DPC](https://radar.protezionecivile.it/) der italienischen Protezione Civile (1 km, alle 5 Minuten). Fällt Radar-DPC aus, schaltet die App auf RainViewer um.
- **Grad-Umrechnung** ist eine Näherung: Die Skalen messen nicht ganz dasselbe, und veröffentlichte Tabellen weichen um etwa eine Stufe voneinander ab.
- Der **Google-Maps-Knopf** öffnet auf dem iPhone die Google-Maps-App. Ist sie nicht installiert, bietet die App nach kurzer Zeit den Link im Browser an.
- Die App ersetzt keinen Kletterführer. Sperrungen und Zustand der Haken immer vor Ort prüfen.

Grad-Tabellen: Mountain Project (International Climbing Grade Comparison Chart) und Bergfreunde.de. Karten: OpenTopoMap, OpenStreetMap-Mitwirkende, Esri; in der Schweiz © swisstopo (Landeskarte, Luftbild, Wanderwege, Höhenmodell) und Wildruhezonen BAFU/Kantone. Wetter: Open-Meteo.com (CC BY 4.0); in der Schweiz MeteoSchweiz ICON-CH1/CH2 (CC BY 4.0). Radar: RainViewer; Radar-DPC, Dipartimento della Protezione Civile (CC BY-SA 4.0). Kartenbibliothek: Leaflet (BSD-2-Clause), Leaflet.markercluster (MIT).

Das Repository nennt (noch) keine Lizenz. Vor einer öffentlichen Weiterverbreitung also kurz bei enteee nachfragen. Verbesserungen gerne direkt in dieses Repository oder als Pull Request.
