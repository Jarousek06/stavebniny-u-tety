# Stavebniny U Tety – web

Statický web (HTML + CSS + trochu JS), bez buildu. Stačí nahrát celou složku (např. Netlify Drop).

- `index.html` – obsah
- `styles.css` – vzhled
- `app.js` – „otevřeno/zavřeno“ podle českého času, svátky, mobilní menu
- `img/` – ilustrační fotky z Unsplash (volná licence)

## Jak změnit svátky / otevírací dobu
Otevřít `app.js`, nahoře je seznam `HOLIDAYS` a `WEEK`. Stačí přepsat data.
Běžnou otevírací dobu je potřeba přepsat i v `index.html` (tabulka „Kdy máme otevřeno“).

## Lokálně
Dev server na portu 5193 (`.claude/launch.json` → `stavebniny-u-tety`).
