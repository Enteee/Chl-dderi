# Mitmachen

Verbesserungen gerne direkt in dieses Repository oder als Pull Request. Das Repository nennt
(noch) keine Lizenz – vor einer öffentlichen Weiterverbreitung also kurz bei enteee nachfragen.

## Einrichten

Mit [devenv](https://devenv.sh/) und [direnv](https://direnv.net/):

```sh
direnv allow     # oder: devenv shell
devenv-help      # zeigt alle Befehle
```

Damit sind Node, die Werkzeuge und die Git-Hooks da. Sonst nichts zu installieren.

## Der Weg

1. In `src/` ändern.
2. `dev` – Entwicklungsserver auf <http://localhost:5173/>.
3. `test` für die Unit-Tests, `lint` für alles andere.
4. Commit. Die Hooks laufen von selbst; einer von ihnen baut die App und legt das Ergebnis in
    den Hauptordner, weil `index.html`, `sw.js` und `assets/` mitgecommittet werden.

**`index.html`, `sw.js` und `assets/` nicht von Hand bearbeiten.** Das ist Ergebnis des Baus.

## Worauf zu achten ist

- **Deutsch in Schweizer Schreibweise**: ss, nie ß. Beide Sprachen brauchen dieselben Schlüssel,
  dieselben Platzhalter und dieselbe Zahl von Mehrzahlformen – ein Test hält das fest.
- **Oberflächentexte** stehen in `src/i18n/{en,de}.json`. Keine Schlüssel erfinden: `keys.test.ts`
  prüft jeden Schlüssel, den der Quelltext verwendet, gegen beide Sprachen.
- **Die Speichernamen nicht umbenennen** (`finale-atlas*`). Darunter liegen die Favoriten und
  Logbücher auf den Geräten der Leute.
- **`mappack.schema.json` ist die Quelle der Wahrheit** für das Pack-Format. Wer es ändert, passt
  `src/types/mappack.ts` an – der Abdeckungstest sagt, was fehlt.
- **Aus Pack-Text wird nie HTML.** Wer am Text aus einem Pack arbeitet, liest zuerst
  `src/core/text.ts` und seine Tests.
- **Ein Mappack ändern?** Danach `check-packs`. Die Prüfung ist zweiteilig: Schema, und die
  Verweise und Zählstände, die ein Schema nicht prüfen kann.

## Mappacks

Ein Pack ist eine Region in einer JSON-Datei, beschrieben in
[`mappack.schema.json`](mappack.schema.json). Die Packs in `maps/` werden **nicht** veröffentlicht:
Wer eigene anbieten will, legt sie dorthin, wo er sie haben will, und gibt die Adresse in der App
ein. Eine Kostprobe aus einem vollen Pack schneiden:

```sh
make-packs --showcase-from maps/pack-deiner-region.json --ids erstes-gebiet,zweites-gebiet
```

## Commits

Die Commit-Nachrichten in diesem Repository sind auf Deutsch und beschreiben, was sich für die
Nutzung ändert – nicht, welche Dateien angefasst wurden.
