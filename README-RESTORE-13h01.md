# LFIAGtube — Restore 13h01 (2026-04-26)

État stable livré par session caveman, **AVANT** réorganisation workspace + tentatives Phase B Netflix billboard (cassait login).

## Provenance

Source: `lfiag-hardened-patch/` (mes derniers livrables session, intact dans scratchpad).

## SHA-256 vérifiables

```
df053c127b7926aadde657fed57b488d6df01499c6e85863cd12ab166533ebcf  index.html
f558a39311967769180a289582efdbdea689178d149b8247acc9c81a93c295b6  app.js
91334339c14a0c574027eea83a90143badcf84e769748461e2fc60d83206507d  app.min.js
fca65a5aa94c5d70abb82bf685e32d4b8ed2c60b688179153fdf2cf43e54626d  sw.js
```

## Contenu

État TV reset propre + hardening complet:
- CSP large (OAuth Google complet)
- SRI Swiper sha-384
- Pagination infinite scroll IO
- Focus trap modal desktop
- Retry exponentiel Apps Script
- Debounce localStorage 200ms
- ARIA labels + Enter keyboard
- LQIP blur placeholders
- Coverflow TV throttle 250ms + loop:false
- Alune previews triple-trigger (playing/loadeddata/timeout 800ms)
- MP4 alune H.264 Constrained Baseline 3.0 (TV-safe)
- TV CSS reset clean (no override grid agressif, breakpoints natifs)

## Restauration repo

Repo: `https://github.com/lfiagselect/lfiagselect.github.io/`

### Méthode 1 — GitHub Web (manuel)

Pour CHACUN des 4 fichiers web (`index.html`, `app.js`, `app.min.js`, `sw.js`):

1. Va sur le fichier dans repo GitHub
2. Crayon **Edit**
3. Ctrl+A → Suppr
4. Ouvre fichier local du zip avec Notepad → Ctrl+A → Ctrl+C
5. Retour GitHub → Ctrl+V → **Commit changes**

Pour images: drag & drop dossier `images/categories/` + fichiers root images dans `/images/` repo via interface upload.

### Méthode 2 — git clone

```bash
git clone https://github.com/lfiagselect/lfiagselect.github.io.git
cd lfiagselect.github.io
# extract zip:
unzip /path/to/lfiagtube-restore-13h01.zip
cp -r restore-13h01/* .
git add -A
git commit -m "Restore stable 13h01 (TV reset + hardening v2)"
git push
```

## Post-deploy CRITIQUE

Service Worker cache stale → DOIT purger:

1. https://lfiagselect.github.io/
2. **F12** → Application → **Service Workers** → **Unregister**
3. Storage → **Clear site data**
4. Ferme DevTools
5. **Ctrl+Shift+R** (hard reload)

## Vérifs post-deploy

- ✓ Login Google ouvre popup OAuth (CSP OK)
- ✓ Loader compact TV
- ✓ Coverflow ←/→ fluide D-pad TV
- ✓ Vignette `Lara Fabian - Concerts` visible (mapping ajouté)
- ✓ Alune previews play correctement (codec baseline)
- ✓ Pas erreur console "Refused to ... CSP"
