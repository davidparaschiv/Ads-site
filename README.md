# D&A Agency

Site de prezentare cu HTML, CSS și JavaScript simplu. Fără React, TypeScript, Vite sau compilare pentru rularea locală și GitHub Pages. Phaser 3.90.0 este inclus local, împreună cu imaginile. Nu există cereri către un CDN la încărcarea site-ului.

## Pornire locală

Ai nevoie de Node.js 20 sau mai nou, npm și Git Bash instalate pe Windows. Extrage arhiva și deschide Git Bash în folderul proiectului. Rulează:

```bash
./start.sh
```

Scriptul execută `npm install`. Dacă instalarea reușește, rulează `npm run dev`, alege un port disponibil și deschide browserul după verificarea serverului. Oprești cu Ctrl+C. Dacă browserul nu se deschide automat, adresa corectă este afișată în terminal.

Rămâne disponibilă și pornirea directă:

```bash
npm install
npm run dev
```

Comanda `dev` este exact `node dev-server.js`. Nu apelează Wrangler sau altă platformă.

## GitHub Pages

```bash
./deploy.sh
```

La prima utilizare, scriptul cere adresa unui repository GitHub existent și confirmarea publicării. Ai nevoie de acces Git la acel repository, de exemplu prin autentificarea Git Credential Manager inclusă în Git pentru Windows. Nu introduce tokenuri în adresă. Destinația este reținută local în `.github-pages.json`, care nu este publicată.

Scriptul pregătește numai HTML, CSS, JavaScript, imaginile și biblioteca Phaser, apoi trimite fișierele pe ramura `gh-pages`. Nu folosește force-push și nu schimbă ramura de lucru. Dacă ramura avansează în timpul publicării, operațiunea se oprește în siguranță; rulează din nou.

La prima publicare, deschide în repository **Settings → Pages**, alege **Deploy from a branch**, ramura **gh-pages**, folderul **/ (root)**. Acest pas se face o singură dată. Scriptul verifică adresa pentru versiunea trimisă și distinge fișierele trimise de publicarea confirmată. Dacă GitHub încă procesează versiunea sau configurarea nu este completă, afișează explicit că publicarea nu este verificată.

Nu s-a publicat pe GitHub în această sesiune: nu ai furnizat un repository destinație. Linkul privat de prezentare este separat de GitHub Pages.

## Conținut și interacțiuni

- Domenii: Florării, Înfrumusețare, Auto, **Altul**.
- Scena de asamblare urmărește derularea. Meniul de domenii oferă și salturi directe.
- Textele, navigarea și contactul sunt în HTML; nu depind de Phaser.
- Buton pentru oprirea animațiilor și respectarea preferinței sistemului pentru mișcare redusă.
- Contact prin WhatsApp și e-mail. Nu există formular care să simuleze trimiterea unei cereri.
- Pachete: 180 euro, 300 euro; mentenanță separată, 30 euro/lună.
- Textele site-ului sunt în română; rolurile Software Developer, UI Designer și Content Writer sunt excepțiile cerute. Mărcile și numele proprii rămân neschimbate.
- JSON-ul original este păstrat, nemodificat, în `content.json`. Nu este trimis de scriptul GitHub Pages.
- Scenele demonstrative nu reprezintă proiecte reale din portofoliu.
- Afișul de marketing este separat și nu este inclus în aplicație sau în publicare.

## Fișiere

`index.html`, `styles.css`, `script.js`, `images/`, `vendor/`, `content.json`, `package.json`, `package-lock.json`, `dev-server.js`, `start.sh`, `deploy.sh`, `scripts/start-local.js`, `scripts/deploy-pages.js`.

Checkout-ul pentru linkul privat conține suplimentar adaptorul de găzduire în `worker/` și utilitarele aferente. Acestea nu sunt necesare în arhiva pentru GitHub Pages și nu modifică lansarea locală.

## Verificări

Au fost verificate sintaxa JavaScript/Bash, încărcarea resurselor și destinațiile interne, pornirea pe port liber, oprirea după instalare eșuată, evitarea unui port ocupat, semnalul de disponibilitate înaintea deschiderii browserului, căile cu spații și oprirea serverului propriu prin Ctrl+C. Testele de deschidere a browserului folosesc un înlocuitor controlat care înregistrează adresa deschisă.

Testele au rulat pe Linux/Bash. Rularea pe Windows/Git Bash, aspectul și interacțiunile într-un browser real nu au fost verificate. Publicarea reală GitHub Pages necesită repository-ul și autentificarea utilizatorului.

Surse tehnice: [Phaser](https://docs.phaser.io/phaser/concepts/gameobjects), [configurarea GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
