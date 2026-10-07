# Finale Atlas

[![Jetzt ausprobieren](https://img.shields.io/badge/Jetzt%20ausprobieren-Finale%20Atlas-28157a?style=for-the-badge&logo=googlemaps&logoColor=white)](https://enteee.github.io/Chl-dderi/)
[![Deploy to GitHub Pages](https://github.com/Enteee/Chl-dderi/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/Enteee/Chl-dderi/actions/workflows/pages.yml)

**▶ App öffnen: <https://enteee.github.io/Chl-dderi/>**

Karte und Liste der Sportklettergebiete rund um Finale Ligure und in Oltrefinale (Val Pennavaire, Val Neva, Toirano) – als App für den Homescreen, auf Deutsch und Englisch, mit Parkplätzen, Zustiegswegen, Routenlängen, Regen-Info und Favoriten, die wirklich gespeichert bleiben.

311 Gebiete, rund 6200 Routen, 43 Parkplätze. Oben in der App wechselst du zwischen den Regionen **Finale** und **Oltrefinale**; alle Filter gelten jeweils innerhalb der gewählten Region.

Hervorgegangen aus dem «Finale Single-Pitch Atlas», der ersten Version dieses Repositorys.

## Was die App kann

- **Karte, Liste, Filter:** Gebiete nach Schwierigkeit, Ausrichtung, Zustieg, Routenzahl, Gestein, Bewertung, Bildern und Region filtern; auf dem Handy über Tabs am unteren Rand.
- **Gebietsseite:** Routenliste mit Graden und – wo bekannt – Längen, Zustieg ab Parkplatz, Regen-Info, Sperrungen, Bilder und Topos mit Link zur Quelle.
- **Favoriten** für Gebiete und einzelne Routen, mit Sicherungs-Code zum Übertragen.
- **Deutsch und Englisch**, helles und dunkles Design.
- **Installierbar und offline-fähig** (Web-App mit Service Worker).

## Veröffentlichung (GitHub Pages)

Jeder Push auf `main` startet den Workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Er kopiert alle Web-Dateien aus dem Hauptordner (`*.html`, `*.js`, `*.webmanifest`, `*.png`, `*.svg`, `*.ico`) und veröffentlicht sie unter <https://enteee.github.io/Chl-dderi/>. Das Status-Badge oben zeigt, ob der letzte Lauf geklappt hat. Manuell starten: **Actions → Deploy to GitHub Pages → Run workflow**.

- Einmalig nötig: **Settings → Pages → Build and deployment → Source = *GitHub Actions***.
- Die App-Dateien liegen absichtlich alle auf einer Ebene, ohne Unterordner. Neue Dateien dieser Typen werden automatisch mitveröffentlicht; README und Workflow-Dateien nicht.
- Lokal testen: `python3 -m http.server` im Ordner starten und <http://localhost:8000/> öffnen. Der Service Worker läuft nur über `http(s)://`, nicht beim Öffnen der Datei direkt.

### Eigene Kopie

1. Repository forken (oder alle Dateien in ein neues, öffentliches Repository hochladen, inklusive `.github/workflows/pages.yml`).
2. **Settings → Pages → Source = *GitHub Actions***.
3. Einen Commit auf `main` pushen oder den Workflow manuell starten. Die App läuft dann unter `https://<github-name>.github.io/<repository>/`.

## Auf den Homescreen

- **iPhone/iPad:** Adresse in Safari öffnen → Teilen → *Zum Home-Bildschirm*.
- **Android:** Adresse in Chrome öffnen → Menü ⋮ → *App installieren* (oder in der App: *Mehr → Als App installieren*).

Die App startet danach auch ohne Netz. Kartenkacheln, die du einmal angeschaut hast, bleiben offline verfügbar.

## Favoriten

Favoriten werden dreifach auf dem Gerät gespeichert und nach jedem Speichern zurückgelesen. Unter *Favoriten* steht, ob das Speichern geklappt hat.

Wichtig auf dem iPhone: Die Homescreen-App und Safari haben **getrennte** Speicher. Favoriten, die du in Safari gesetzt hast, erscheinen nicht automatisch in der Homescreen-App. Dafür gibt es unter *Favoriten → Sichern und übertragen* einen Code: in der einen App *Code kopieren*, in der anderen einfügen und *Aus Code übernehmen*. Das funktioniert auch zwischen zwei Geräten.

## Aktualisieren

Dateien im Repository durch die neuen ersetzen (gleiche Namen) und auf `main` committen – der Workflow veröffentlicht sie automatisch. Bei Änderungen an der App `BUILD` in `sw.js` erhöhen, damit installierte Apps den alten Zwischenspeicher verwerfen. Die App holt sich die neue Version beim nächsten Start mit Netz selbst; Favoriten und Einstellungen bleiben erhalten.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die ganze App samt Daten |
| `sw.js` | macht die App offline-fähig |
| `manifest.webmanifest` | Name, Farben und Icons für die Installation |
| `icon-*.png`, `apple-touch-icon.png`, `favicon*` | App-Icon in allen nötigen Grössen |
| `.github/workflows/pages.yml` | veröffentlicht die App bei jedem Push auf `main` |

## Daten, Quellen und Grenzen

- Die Quellen jedes Gebiets stehen in der App auf der Gebietsseite, die Methode unter *Mehr → Über die Daten*.
- Zustiegswege sind berechnet (BRouter auf OpenStreetMap-Daten) und nicht vor Ort geprüft. Parkplätze mit hellem, umrandetem P sind geschätzt.
- Oltrefinale hat keine offizielle Wandliste. Die Daten stammen dort vom lokalen Verein Roc Pennavaire und aus Community-Quellen. Wo keine Quelle die Wand verortet, steht eine weisse Raute neben dem Parkplatz; 12 Gebiete haben gar keine Position und stehen nur in der Liste.
- «Regensicher» steht nur dort, wo eine Quelle es ausdrücklich sagt. Bei einigen Gebieten meldet Climbook mögliche Sperrungen zum Schutz brütender Greifvögel, die niemand bestätigt hat – sie tragen den Hinweis «Vorsicht».
- Längen einzelner Routen gibt es nur dort, wo eine frei zugängliche Quelle sie nennt; sonst gilt die Spanne des Gebiets.
- Die App ersetzt keinen Kletterführer. Sperrungen und Zustand der Haken immer vor Ort prüfen.

Karten: OpenTopoMap, OpenStreetMap-Mitwirkende, Esri. Kartenbibliothek: Leaflet (BSD-2-Clause), Leaflet.markercluster (MIT). Einzelne Koordinaten stammen von theCrag (CC BY-NC-SA) und aus OpenStreetMap (ODbL) – die App ist deshalb für die private, nicht kommerzielle Nutzung gedacht.

Das Repository nennt (noch) keine Lizenz. Vor einer öffentlichen Weiterverbreitung also kurz bei enteee nachfragen – Verbesserungen gerne als Pull Request.
