# Finale Atlas

Karte und Liste der Sportklettergebiete rund um Finale Ligure und in Oltrefinale (Val Pennavaire, Val Neva, Toirano) – als App für den Homescreen, auf Deutsch und Englisch, mit Parkplätzen, Zustiegswegen, Routenlängen, Regen-Info und Favoriten, die wirklich gespeichert bleiben.

311 Gebiete, rund 6200 Routen, 43 Parkplätze. Oben in der App wechselst du zwischen den Regionen **Finale** und **Oltrefinale**; alle Filter gelten jeweils innerhalb der gewählten Region.

Ausgebaut aus dem Projekt [enteee/Chl-dderi](https://github.com/enteee/Chl-dderi) («Finale Single-Pitch Atlas»).

## In 5 Minuten online (GitHub Pages)

1. Auf github.com ein neues, öffentliches Repository anlegen, z. B. `finale-atlas`.
2. **Add file → Upload files** und alle Dateien aus diesem Ordner hochladen (sie liegen absichtlich alle auf einer Ebene, ohne Unterordner). **Commit changes**.
3. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, Ordner = `/ (root)` → **Save**.
4. Nach ein bis zwei Minuten läuft die App unter `https://marcesss97.github.io/finale-atlas/` (dein GitHub-Name, dann der Name des Repositorys).

Falls du stattdessen einen Fork des Originals benutzt: Dort liegt ein Workflow unter `.github/workflows/pages.yml`, der nur `index.html`, `manifest.webmanifest` und `icons/` veröffentlicht. Lösche ihn und stelle Pages wie in Schritt 3 um, sonst fehlen `sw.js` und die neuen Icons.

## Auf den Homescreen

- **iPhone/iPad:** Adresse in Safari öffnen → Teilen → *Zum Home-Bildschirm*.
- **Android:** Adresse in Chrome öffnen → Menü ⋮ → *App installieren* (oder in der App: *Mehr → Als App installieren*).

Die App startet danach auch ohne Netz. Kartenkacheln, die du einmal angeschaut hast, bleiben offline verfügbar.

## Favoriten

Favoriten werden dreifach auf dem Gerät gespeichert und nach jedem Speichern zurückgelesen. Unter *Favoriten* steht, ob das Speichern geklappt hat.

Wichtig auf dem iPhone: Die Homescreen-App und Safari haben **getrennte** Speicher. Favoriten, die du in Safari gesetzt hast, erscheinen nicht automatisch in der Homescreen-App. Dafür gibt es unter *Favoriten → Sichern und übertragen* einen Code: in der einen App *Code kopieren*, in der anderen einfügen und *Aus Code übernehmen*. Das funktioniert auch zwischen zwei Geräten.

## Aktualisieren

Dateien im Repository durch die neuen ersetzen (gleiche Namen). Die App holt sich die neue Version beim nächsten Start mit Netz selbst; Favoriten und Einstellungen bleiben erhalten.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die ganze App samt Daten |
| `sw.js` | macht die App offline-fähig |
| `manifest.webmanifest` | Name, Farben und Icons für die Installation |
| `icon-*.png`, `apple-touch-icon.png`, `favicon*` | App-Icon in allen nötigen Grössen |

## Daten, Quellen und Grenzen

- Die Quellen jedes Gebiets stehen in der App auf der Gebietsseite, die Methode unter *Mehr → Über die Daten*.
- Zustiegswege sind berechnet (BRouter auf OpenStreetMap-Daten) und nicht vor Ort geprüft. Parkplätze mit hellem, umrandetem P sind geschätzt.
- Oltrefinale hat keine offizielle Wandliste. Die Daten stammen dort vom lokalen Verein Roc Pennavaire und aus Community-Quellen. Wo keine Quelle die Wand verortet, steht eine weisse Raute neben dem Parkplatz; 12 Gebiete haben gar keine Position und stehen nur in der Liste.
- «Regensicher» steht nur dort, wo eine Quelle es ausdrücklich sagt. Bei einigen Gebieten meldet Climbook mögliche Sperrungen zum Schutz brütender Greifvögel, die niemand bestätigt hat – sie tragen den Hinweis «Vorsicht».
- Längen einzelner Routen gibt es nur dort, wo eine frei zugängliche Quelle sie nennt; sonst gilt die Spanne des Gebiets.
- Die App ersetzt keinen Kletterführer. Sperrungen und Zustand der Haken immer vor Ort prüfen.

Karten: OpenTopoMap, OpenStreetMap-Mitwirkende, Esri. Kartenbibliothek: Leaflet (BSD-2-Clause), Leaflet.markercluster (MIT). Einzelne Koordinaten stammen von theCrag (CC BY-NC-SA) und aus OpenStreetMap (ODbL) – die App ist deshalb für die private, nicht kommerzielle Nutzung gedacht.

Das Original-Repository nennt keine Lizenz. Vor einer öffentlichen Weiterverbreitung also kurz bei enteee nachfragen – oder die Änderungen als Pull Request dorthin zurückgeben.
