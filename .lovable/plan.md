Kleiner visueller Tweak auf der Landing Page:

1. Datei: `src/routes/index.tsx` (Header-Logo-Sektion, Zeilen ~69–74).
2. Änderung: Die weiße Box bleibt bei `h-20 w-44 sm:w-52 px-6 py-4`.
3. Das Zamstarten-Logo (`<img>`) ändert von `max-h-14` auf `max-h-16` (64 px statt 56 px). Damit füllt es das verfügbare Innenmaß der Box fast vollständig aus, ohne die Box selbst zu vergrößern.
4. Zamwirken-Logo bleibt unverändert bei `max-h-10`.
5. Optional: kurzer visueller Check per Preview-Screenshot, ob das Verhältnis zum Zamwirken-Logo stimmig wirkt.

Keine weiteren Dateien oder Business-Logik betroffen.