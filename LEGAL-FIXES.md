# LEGAL-FIXES.md — zadatak za Claude Code

> Stavi ovaj fajl u root repozitorijuma sajta `getmoved.app`, pa u Claude Code kucaj:
> `Pročitaj LEGAL-FIXES.md i izvrši FAZU 1. Ništa izvan Faze 1 nemoj dirati.`
> Kad prođe review, isto za FAZU 2 i FAZU 3.

---

## KONTEKST

Statički multi-page HTML sajt. Poznate stranice:

```
index.html (ili /)         free-moving-quote.html     how-it-works.html
about.html                 for-movers.html            mobile-app.html
partners.html              pricing.html               contact.html
register-as-mover.html     new-york-movers.html       new-jersey-movers.html
terms.html                 privacy.html
```

Pravna lica: **GetMoved LLC**, 2108 North Street STE N, Sacramento, CA, USA · **CYBER CO.**, Studentska 6/13, 81000 Podgorica, Crna Gora.

Sajt trenutno opisuje djelatnost koja u SAD predstavlja *household goods brokerage* (49 CFR Part 371), a **FMCSA broker registracija je u toku** — prijava (OP-1) se predaje ove nedjelje.

**Ključno za razumijevanje ovog fajla:** predaja prijave ne daje pravo da se nastupa kao broker. MC broj se dodjeljuje odmah, ali sa statusom `NOT AUTHORIZED`. Ovlašćenje postaje upotrebljivo tek kad su BOC-3 i BMC-84 bond (75.000 USD) na fajlu, prođe javni protest rok od 10 dana, i **SAFER prikaže status `ACTIVE`** — realno 3 do 6 nedjelja od predaje. Do tog dana sajt pravno stoji isto kao da prijave nema, i mora biti neutralizovan.

Zato se ovaj posao radi u dva takta:

- **Faze 1–3 (odmah):** neutralizuj tekst tako da sajt ne tvrdi da GetMoved pronalazi, bira, kontaktira ili poredi prevoznike u ime korisnika. GetMoved je softverska platforma na kojoj selidbene firme same odgovaraju na zahtjev korisnika.
- **Faza 4 (na dan aktivacije):** vrati brokerski narativ i dodaj obavezna §371 obavještenja.

**Iz toga slijedi obavezan zahtjev na Fazu 2: sve izmjene moraju biti reverzibilne.** Ne briši brokerski copy — zamijeni ga i sačuvaj original u markiranim blokovima (vidi 2.0). Faza 4 tada nije novo pisanje nego prebacivanje prekidača.

## Šta je privremeno, a šta ostaje zauvijek

| Izmjena | Nakon aktivacije MC broja |
|---|---|
| TCPA checkbox, Do Not Call | **ostaje** — nema veze sa FMCSA |
| Ispravka domena u Privacy Policy | **ostaje** |
| CCPA „sale" priznanje, Do Not Sell link, GPC | **ostaje** — pay-per-lead je prodaja i sa licencom |
| Stripe / „ne držimo sredstva" formulacije | **ostaje** — broker licenca nije licenca za novac |
| Uklonjeno „FMCSA Verified" | **ostaje uklonjeno zauvijek** — sugeriše da vas FMCSA verifikuje, što ostaje netačno i sa MC brojem |
| Uklonjeno „binding quote" | **ostaje uklonjeno** — obavezujuću procjenu izdaje prevoznik po svojoj tarifi, ne broker i ne AI |
| „95%", „$190", „0 poziva" | **ostaje** dok ne bude dokumentovanog dokaza |
| Cookie CMP, Privacy/Terms prepravke | **ostaje** |
| Neutralizovan brokerski narativ (Faza 2) | **PRIVREMENO — vraća se u Fazi 4** |
| Ograda „GetMoved is not a moving company" | ostaje, ali se mijenja formulacija (Faza 4) |

---

## TVRDA PRAVILA — ne krši ih

1. **Ne mijenjaj dizajn, layout, CSS klase, strukturu sekcija ni slike.** Samo tekstualni sadržaj i, gdje je izričito rečeno, dodavanje jednog novog elementa.
2. **Ne izmišljaj brojeve.** Nigdje ne upisuj USDOT, MC, licencne brojeve, procente ni iznose kojih nema u ovom fajlu. Gdje treba podatak koji nemam — ostavi doslovno `[TODO: ...]` i prijavi na kraju.
3. **Ne briši cijele sekcije bez pitanja.** Ako je jedini ispravan potez brisanje sekcije, prvo prijavi i sačekaj.
4. **Sav copy na sajtu je engleski.** Piši engleski. Ovaj fajl je na našem jeziku, prevod ne prenositi.
5. **Jedan commit po fazi**, poruka `legal: faza N — <kratko>`. Ne push-uj.
6. Na kraju svake faze ispiši: listu izmijenjenih fajlova, listu svih `[TODO:]` markera, i sve pojave iz sekcije „Global grep" koje si našao ali nisi promijenio (sa razlogom).
7. Ako isti string postoji na više stranica — promijeni ga **svuda**, uključujući `<title>`, `<meta name="description">`, OG tagove i `alt` atribute.

---

## KORAK 0 — inventar (uradi prije Faze 1, ništa ne mijenjaj)

Grep-uj cijeli repo (case-insensitive, uključi HTML, JS, JSON, meta tagove) i napravi tabelu `fajl : linija : string` za:

```
binding quote          binding estimate       FMCSA Verified
we'll find             we will find           find the best movers
moving experts         we handle the rest     we compare
held securely          funds held             escrow
Trusted movers         trusted movers         Trusted badges
Licensed & Insured     Licensed and Insured   95%
$190                   zero cost              completely FREE
24 hours               24-48                  getmoved.com
support@getmoved       No hidden fees         no surprise fees
0 phone calls          Phone calls needed
```

Ispiši tabelu i tek onda kreni na Fazu 1.

---

# FAZA 1 — hitno, čist copy (uradi prvo)

## 1.1 Ispravi pogrešan domen u Politici privatnosti

`privacy.html` — politika trenutno navodi `getmoved.com` i `support@getmoved.com`. Sajt je `getmoved.app`. Zamijeni **sve** pojave:

| Nađi | Zamijeni |
|---|---|
| `getmoved.com` | `getmoved.app` |
| `support@getmoved.com` | `privacy@getmoved.app` |

Provjeri da isti pogrešan domen ne postoji u `terms.html` i u footeru ostalih stranica.

**`[TODO: potvrditi da mailbox privacy@getmoved.app zaista postoji i da se čita]`**

## 1.2 Dodaj TCPA saglasnost na svaki obrazac koji traži telefon

Pogođeni fajlovi: `index.html` (quick-quote), `free-moving-quote.html`, `new-york-movers.html`, `new-jersey-movers.html`, `contact.html`, `register-as-mover.html` — svaki `<form>` koji ima polje za telefon.

Ubaci **neposredno iznad submit dugmeta**, unutar forme:

```html
<label class="consent">
  <input type="checkbox" name="tcpa_consent" id="tcpa_consent" required>
  <span>
    By checking this box, I give my prior express written consent for GetMoved and the
    moving companies in its network to contact me at the phone number and email address
    I provided — including by automated calls, prerecorded messages and text messages —
    about my moving request. Consent is <strong>not</strong> a condition of purchase.
    Message and data rates may apply. Reply STOP to opt out. See our
    <a href="privacy.html">Privacy Policy</a> and <a href="do-not-call.html">Do Not Call Policy</a>.
  </span>
</label>
```

Zahtjevi:
- checkbox **neoznačen** po defaultu, `required`, submit dugme disabled dok nije čekiran;
- tekst mora biti **stvarno čitljiv** — minimum 12px, kontrast ≥ 4.5:1, bez `opacity` ispod 0.8. Sitna siva fusnota ruši cijelu odbranu;
- ne stavljaj ga u modal, tooltip, accordion ni „read more";
- uz submit šalji i loguj: timestamp (ISO 8601, UTC), IP, user-agent, URL stranice, i tačan tekst saglasnosti koji je korisnik vidio (hash ili puni string).

Kreiraj i `do-not-call.html` po šablonu postojećih stranica, sa sadržajem:

> **Do Not Call Policy** — GetMoved maintains an internal Do Not Call list. To be added, email `privacy@getmoved.app` or reply STOP to any text message. We honour requests within 10 business days and retain them for at least 5 years. We also scrub against the National Do Not Call Registry. This policy is available on request in written form.

## 1.3 Ukloni „FMCSA Verified"

Pojavljuje se najmanje na `free-moving-quote.html` i `new-york-movers.html`. **Obriši badge/tekst u potpunosti** — implicira da FMCSA verifikuje GetMoved, što je zaseban prekršaj.

Ako badge stoji u nizu sa ostalima i vizuelno ostaje rupa, zamijeni ga sa `Stripe-secured payments`.

## 1.4 Ukloni riječ „binding"

| Nađi | Zamijeni |
|---|---|
| `receive binding quotes from trusted movers` | `receive written quotes directly from moving companies` |
| `Each mover sees your full inventory and submits a binding quote` | `Each moving company reviews your inventory and submits its own written quote` |
| `Set itemized pricing per service and submit binding quotes` | `Set itemized pricing per service and submit written quotes` |
| `Submit binding digital quotes in minutes` | `Submit digital quotes in minutes` |
| `Binding quotes you can compare side by side` | `Quotes you can compare side by side` |

Zatim, na `how-it-works.html` i u „03 — Compare Offers" sekciji na `index.html`, dodaj ispod liste:

```html
<p class="disclaimer">
  Quotes are issued by the moving company, not by GetMoved. Whether a quote is binding,
  non-binding or not-to-exceed is determined by that company under its published tariff
  and applicable regulations. Final charges may change if the actual shipment differs
  from the inventory or if additional services are requested.
</p>
```

## 1.5 Prepravi formulacije o novcu (escrow / money transmission)

| Nađi | Zamijeni |
|---|---|
| `Payment is held securely and released only after confirmation` | `Payment is processed by Stripe and paid out to the moving company after the move is confirmed complete` |
| `Payment is held securely and released only after your move is complete` | `Payment is processed by Stripe and paid out to the moving company after your move is confirmed complete` |
| `Stripe-powered payments — funds held until confirmed` | `Stripe-powered payments — payout scheduled on job confirmation` |
| `Automatic payout to your account — no chasing` | `Automatic Stripe payout to your connected account — no chasing` |
| `Accept a quote and pay securely in one tap — card or bank` | `Accept a quote and pay through Stripe in one tap — card or bank` |

Dodaj u footer svake stranice koja pominje plaćanje, i u `terms.html`:

```html
<p class="disclaimer">
  Payments are processed by Stripe. GetMoved does not hold, control or take custody of
  customer funds and does not provide escrow, banking or money transmission services.
</p>
```

Riječ `escrow` ne smije ostati nigdje na sajtu.

## 1.6 Ukloni nedosljednosti i nepotkrijepljene brojke

| Nađi | Zamijeni |
|---|---|
| `Up to 95% inventory accuracy` | `[TODO: potreban dokumentovan interni test. Do tada koristi:] Structured inventory generated automatically from your video` |
| `Save up to $190 per lead with video & inventory data` | `[TODO: potrebna osnova za izračun. Do tada koristi:] Lower cost per booked job with video and inventory data included` |
| `0` + `Phone calls needed to book a move` | `100%` + `Online — book without a phone call` |
| `We respond within 24 hours` | `We usually respond within one business day` |
| `We respond to all inquiries within 24-48 hours.` | `We usually respond within one business day.` |
| `No surprise fees on moving day and no guesswork` | `Itemized pricing up front, so you know what is included` |
| `Transparent Pricing No Hidden Fees` | `Itemized, transparent pricing` |
| `Insurance policies stored & trusted in platform` | `Certificates of insurance collected at onboarding` |
| `Trusted badges visible to customers before booking` | `Verification status visible to customers before booking` |

Uz svaki „free / completely FREE / zero cost" u hero sekcijama dodaj u istom bloku:

> `Free for you — we're paid by the moving companies in our network.`

## 1.7 Uskladi cijene

`pricing.html` i pricing sekcija na `index.html`:

- `$99` → `from $99/month` + dodaj `excl. VAT / applicable taxes`
- `$999` → `from $999/month` + isto
- `Starting at` + prazno + `/lead` → **fali iznos**. Ostavi `[TODO: unijeti cijenu po lead-u ili ukloniti "Starting at"]`
- Link `Get a full pricing` → `assets/downloads/CjenovnikNovi.png` je slika. Ostavi zasad, ali dodaj `[TODO: prebaciti cjenovnik iz slike u HTML — nije verzionisan ni pristupačan]`

---

# FAZA 2 — neutralizacija brokerskog narativa (PRIVREMENO)

**Cilj:** nakon ove faze sajt nigdje ne smije tvrditi da GetMoved *pronalazi, bira, kontaktira, pregovara ili poredi* prevoznike u ime korisnika. Framing postaje: korisnik objavljuje zahtjev, selidbene firme same odgovaraju, korisnik bira.

**Ovo je privremeno stanje** dok FMCSA ovlašćenje ne pređe u `ACTIVE`. Zato:

## 2.0 Sve izmjene u ovoj fazi moraju biti reverzibilne

Nijedan brokerski copy ne smije biti obrisan. Svaku zamjenu uradi ovako:

```html
<!-- BROKER-COPY:OFF — vratiti u Fazi 4 kad MC bude ACTIVE
<h1>Tell Us About Your Move. We'll Find the Best Movers for You.</h1>
-->
<h1>Tell Us About Your Move. Get Quotes From Movers Who Cover Your Route.</h1>
<!-- /BROKER-COPY:OFF -->
```

Pravila:

- marker je doslovno `BROKER-COPY:OFF` — Faza 4 ga grep-uje, pa mora biti identičan svuda;
- original u komentaru mora biti **tačan, nepromijenjen tekst** koji je bio na sajtu;
- za tekst koji nije u HTML-u nego u JS stringu ili JSON-u, koristi isti marker u odgovarajućoj sintaksi komentara;
- za **nove** elemente koje dodaješ, a koji izlaze u Fazi 4 (npr. legal-strip iz 2.2), umotaj ih u `<!-- BROKER-COPY:TEMP -->` … `<!-- /BROKER-COPY:TEMP -->`;
- na kraju faze ispiši spisak svih markera sa fajlom i linijom — to je ulaz za Fazu 4.

## 2.1 Ključne zamjene

| Nađi | Zamijeni |
|---|---|
| `Tell Us About Your Move. We'll Find the Best Movers for You.` | `Tell Us About Your Move. Get Quotes From Movers Who Cover Your Route.` |
| `Fill out our quick form and our moving experts will contact trusted movers, compare quotes, and send…` | `Fill out the form and moving companies on our platform will send you their own quotes. You compare and choose — there is no obligation.` |
| `You relax. We handle the rest.` | `One request. Multiple quotes. Your choice.` |
| `We find. We compare. You choose.` | `You post. They quote. You choose.` |
| `Premium service, zero cost, maximum…` | `No cost to you, no obligation` |
| `Premium support from our moving experts.` | `Support with using the platform, at no cost.` |
| `Find & Compare Trusted Movers in New York` | `Compare Quotes From Movers Serving New York` |
| `our moving experts will contact trusted movers` | `moving companies on our platform will respond` |
| `Your request is matched to movers who cover your route and services` | `Your request is visible to moving companies that cover your route and services` |
| `Trusted movers` (kao badge) | `Movers on our network` |
| `receive binding quotes from trusted movers, and p…` | `receive quotes from moving companies, and pay through the platform` |
| `while connecting movers to customers ready …` | `while giving movers a channel to reach customers ready to book` |

Provjeri i `<title>` / `<meta description>` / OG tagove za iste fraze.

## 2.2 Dodaj stalnu ogradu

Novi element u **footer svake stranice**, iznad copyright reda:

```html
<p class="legal-strip">
  GetMoved is a software platform. GetMoved is not a moving company and does not
  transport household goods. All moving services are performed by independent moving
  companies under their own contracts, licences, tariffs and insurance. GetMoved is
  not a party to those contracts and is not responsible for the performance, pricing,
  loss, damage or delay of any move.
</p>
```

Dodaj i **istaknuto na vrhu** (ne u footeru) na: `free-moving-quote.html`, `new-york-movers.html`, `new-jersey-movers.html` — prva rečenica ispod H1.

## 2.3 Preciziraj kako se firme provjeravaju

Zamijeni sve varijante „Licensed & Insured Movers" / „Trust & Verification" blurb-a sa:

```html
<p>
  How we check moving companies: at onboarding we confirm each company's active
  operating authority in the public FMCSA SAFER database and collect a current
  certificate of insurance and business licence. Verification reflects the company's
  status on the date of the check. GetMoved is not affiliated with, endorsed by or
  verified by FMCSA. You can confirm any company's current authority yourself at
  <a href="https://safer.fmcsa.dot.gov" rel="nofollow noopener" target="_blank">safer.fmcsa.dot.gov</a>.
</p>
```

**`[TODO: potvrditi da se ova provjera zaista sprovodi i da postoji log. Ako ne — cijeli pasus mora van.]`**

## 2.4 NY / NJ stranice

Ispod H1 na `new-york-movers.html` i `new-jersey-movers.html`:

```html
<p class="legal-strip">
  GetMoved is not a moving company and does not transport household goods. Moves are
  performed by independent moving companies licensed to operate in [STATE]. Each
  company's licence number is shown on its quote.
</p>
```

`[STATE]` → `New York`, odnosno `New Jersey`.

**`[TODO: potvrditi da su quote ekrani zaista prikazuju licencni broj firme. Ako ne prikazuju, ova rečenica je netačna.]`**

## 2.5 Ukloni „Register as Mover" tvrdnje koje obavezuju

`register-as-mover.html` i `partners.html`:

| Nađi | Zamijeni |
|---|---|
| `GetMoved is onboarding licensed, insured moving companies across the EU, USA, and the Middle East.` | `GetMoved onboards moving companies across the EU, USA and the Middle East. Applicants must provide a valid business licence and proof of insurance.` |
| `We are selectively onboarding strategic partners in key markets. Apply now to secure your position.` | `We are onboarding partners in selected markets. Apply to join the waiting list.` |
| `Reduced lead pricing during the launch period` | `Reduced lead pricing during the launch period. Launch pricing is time-limited and subject to change on 30 days' notice.` |

---

# FAZA 3 — privatnost, uslovi, kolačići

## 3.1 CCPA — priznaj prodaju podataka

`privacy.html`. Zamijeni rečenicu:

> ~~We do not sell personal information in exchange for monetary compensation.~~

sa:

```html
<h3>Sale and sharing of personal information (California)</h3>
<p>
  When you submit a quote request, we disclose your contact details and move information
  to moving companies, and those companies pay us. Under the California Consumer Privacy
  Act this constitutes a "sale" of personal information. We do not knowingly sell the
  personal information of consumers under 16 years of age. You can opt out at any time
  using the <a href="do-not-sell.html">Do Not Sell or Share My Personal Information</a>
  link in our footer, or by enabling a Global Privacy Control signal in your browser,
  which we honour automatically. Residents of Virginia, Colorado, Connecticut, Texas and
  Oregon have equivalent opt-out rights.
</p>
```

Dodatno:
- Kreiraj `do-not-sell.html` sa obrascem za opt-out (email + telefon + potvrda) i tekstom da se zahtjev obrađuje u roku od 15 dana.
- Dodaj link **„Do Not Sell or Share My Personal Information"** u footer **svake** stranice.
- Implementiraj čitanje `navigator.globalPrivacyControl` i `Sec-GPC` header-a; ako je `true`, ne šalji podatke ka lead partnerima i zabilježi opt-out.
- Dodaj **notice at collection** neposredno uz quote formu:
  `We collect your contact and move details to obtain quotes for you, and we share them with moving companies who pay us. Details: Privacy Policy.`

## 3.2 Privacy policy — nedostajuće obavezne sekcije

Dodaj sekcije (zadrži postojeći stil dokumenta):

1. **Data controller** — puni nazivi, adrese i registarski brojevi za GetMoved LLC i CYBER CO., sa objašnjenjem ko je kontrolor za koga. `[TODO: dostaviti matične i PDV brojeve]`
2. **Legal basis** — tabela: svrha → pravni osnov (GDPR čl. 6). Minimum: izvršenje ugovora, legitimni interes, saglasnost (marketing, kolačići), zakonska obaveza.
3. **Retention** — konkretni rokovi po kategoriji, ne „as long as necessary". Predlog: nalog 24 mjeseca od posljednje aktivnosti · **walkthrough video 90 dana od završetka selidbe** · fakture 7 godina (poreski propisi) · TCPA log saglasnosti 5 godina · marketing kontakt do povlačenja.
4. **International transfers** — EU/UK → SAD po Standard Contractual Clauses; navesti da se koriste SCC-ovi i gdje se traži kopija.
5. **EU representative (GDPR čl. 27)** — `[TODO: imenovati predstavnika u EU; Crna Gora nije EU]`
6. **Video i AI** — zaseban pasus: šta se snima, koliko se čuva, ko vidi, da se video **ne koristi za treniranje modela bez zasebnog opt-ina**, i uputstvo korisniku:
   `Before filming, please remove other people from the frame and cover documents, screens, medication and anything else you do not want recorded.`
7. **Automated decision-making (čl. 22)** — ako AI sam formira cijenu, opisati logiku u opštim crtama i pravo na ljudsku provjeru.
8. **Sub-processors** — spisak (Stripe, cloud provider, analytics, AI provider) sa svrhom i lokacijom. `[TODO: dostaviti stvarnu listu]`
9. **Kontakt za prava** — `privacy@getmoved.app`, rok 30 dana, pravo pritužbe nadzornom organu.

## 3.3 Terms & Conditions

Dodaj / izmijeni:

- **Ugovorna strana** na vrhu: koje lice ugovara sa kim, sa adresom i registarskim brojem. `[TODO: brojevi]`
- **Ukloni** `GetMoved is not itself a moving carrier, freight broker, warehouse operator, or transportation provider unless explicitly stated otherwise in a separate written agreement.` i zamijeni sa:
  > `GetMoved provides software and a listing platform. GetMoved does not transport household goods, does not perform moving services, and is not a party to the transportation contract between you and the moving company you select. Your contract for the move is with that company, under its own terms, tariff and insurance.`
- **EU carve-out** uz arbitražu i izbor prava:
  > `If you are a consumer resident in the EEA, the United Kingdom or Switzerland, nothing in this section deprives you of the protection of mandatory provisions of the law of your country of residence, and you may bring proceedings before the courts of your place of residence.`
- **Izuzetak od limita odgovornosti:**
  > `Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any liability that cannot be limited or excluded under applicable law.`
- **Auto-renewal** (California ARL) — jasno i uočljivo prije naplate: dužina perioda, cijena po obnovi, da se obnavlja automatski dok se ne otkaže, kako se otkazuje **online istim putem kojim je zaključeno**, i podsjetnik prije obnove.
- **Pravo na odustanak** za EU potrošače: 14 dana, plus klauzula da usluga počinje odmah na izričit zahtjev uz gubitak tog prava.
- **Cancellation, deposit and refund policy** — kao **zasebna, istaknuta stranica** `cancellation-policy.html` linkovana iz footera, ne zakopana u Uslove.
- **Reklamacije za štetu** — jasno: štetu, kašnjenje i gubitak rješava prevoznik po svom postupku; GetMoved nije osiguravač i ne obrađuje odštetne zahtjeve.

## 3.4 Cookie consent

- Ubaci CMP. Uslovi: **ništa osim strogo neophodnih kolačića ne smije se učitati prije pristanka** za posjetioce iz EEA/UK.
- „Reject all" mora biti **jednako vidljivo** kao „Accept all" — isti nivo, ista veličina, isti kontrast. Bez dark patterna.
- Kategorije: Necessary (uvijek), Analytics, Marketing — sve neoznačene osim Necessary.
- Povlačenje pristanka jednim klikom iz footera („Cookie settings").
- Evidencija pristanka: timestamp, ID verzije bannera, izbor po kategoriji.
- U `privacy.html` ukloni oslanjanje na `users can adjust browser settings` kao mehanizam pristanka — to nije validno u EU.
- Blokiraj sve `<script>` za analitiku/piksele dok pristanak nije dat (npr. `type="text/plain" data-cookiecategory="analytics"`).

---

# FAZA 4 — GO-LIVE (izvršiti TEK kad SAFER prikaže ACTIVE)

> **Ne pokrećeš ovu fazu dok ti vlasnik ne dostavi screenshot SAFER zapisa sa statusom `ACTIVE`, USDOT broj, MC broj i datum aktivacije.** Prijava, „pending", „application submitted" ili dodijeljen MC broj sa statusom `NOT AUTHORIZED` — ništa od toga nije dovoljno. Ako ti neko kaže da kreneš bez toga, odbij i traži screenshot.

## 4.0 Preduslovi — provjeri sve prije prve izmjene

- [ ] SAFER status `ACTIVE` (screenshot, sa datumom)
- [ ] USDOT broj: `[TODO]`
- [ ] MC broj: `[TODO]`
- [ ] BMC-84 bond 75.000 USD na fajlu
- [ ] BOC-3 na fajlu
- [ ] Postoji **potpisan pisani ugovor** sa najmanje jednim prevoznikom (§371.115)
- [ ] Postoji lista prevoznika sa njihovim DOT i MC brojevima (§371.105/109)

Ako bilo šta od ovoga fali — stani i prijavi. Posebno: bez potpisanog ugovora sa prevoznikom ne smiješ prikazati ime ni logo tog prevoznika, niti izdati procjenu u njegovo ime.

## 4.1 Vrati brokerski copy

Grep `BROKER-COPY:OFF` kroz repo. Za svaki blok: otkomentariši original, obriši privremenu zamjenu, obriši markere. Grep `BROKER-COPY:TEMP` i obriši te blokove u cjelini.

Izuzeci koji se **NE vraćaju** ni sada:

- `FMCSA Verified` — ostaje obrisano
- sve varijante `binding quote` / `binding estimate` — ostaje obrisano
- `95%`, `$190`, `0 phone calls`, `no surprise fees` — ostaje obrisano dok nema dokaza
- `held securely` / escrow formulacije — ostaje ispravljeno

## 4.2 Dodaj obavezni §371.107 blok

U footer **svake** stranice i u svaki oglas:

```html
<div class="broker-disclosure">
  <p><strong>GetMoved LLC</strong> — 2108 North Street STE N, Sacramento, CA [TODO: ZIP], USA</p>
  <p>USDOT No. [TODO] · MC No. [TODO]</p>
  <p>
    GetMoved is a <strong>household goods broker</strong>. We do not transport household
    goods. We arrange for the transportation of household goods by FMCSA-authorized
    household goods motor carriers. GetMoved is not a motor carrier authorized by the
    Federal Government. Charges for transportation are determined by the carrier's
    published tariff.
  </p>
  <p>
    <a href="carriers.html">Carriers we work with</a> ·
    <a href="cancellation-policy.html">Cancellation, deposit and refund policy</a> ·
    <a href="https://www.fmcsa.dot.gov/protect-your-move/ready-to-move-brochure" rel="noopener" target="_blank">Ready to Move?</a> ·
    <a href="https://www.fmcsa.dot.gov/protect-your-move/rights-responsibilities" rel="noopener" target="_blank">Your Rights and Responsibilities When You Move</a>
  </p>
</div>
```

Ovaj blok mora biti **vidljiv, ne u accordion-u i ne iza „read more"**. Isti podaci idu i u `<meta>` opis i u sve plaćene oglase, App Store i Google Play opise.

## 4.3 Nova stranica `carriers.html` (§371.105 / §371.109)

Tabela svih prevoznika sa kojima postoji potpisan pisani ugovor: naziv, DOT broj, MC broj, država sjedišta, datum ugovora. Iznad tabele:

> `GetMoved is not a motor carrier authorized by the Federal Government. GetMoved arranges transportation performed by the FMCSA-authorized household goods motor carriers listed below, with each of which GetMoved has a written agreement. This list is updated when carriers are added or removed.`

Ista lista mora biti dostupna korisniku **prije** nego što prihvati ponudu — ne samo kao stranica u footeru.

## 4.4 Prilagodi ogradu iz 2.2

`legal-strip` iz Faze 2 se mijenja — više nije tačno reći da ste samo softver:

| Stara (Faza 2) | Nova (Faza 4) |
|---|---|
| `GetMoved is a software platform. GetMoved is not a moving company…` | `GetMoved is a licensed household goods broker (USDOT [X], MC [Y]) and a software platform. GetMoved does not transport household goods. Moves are performed by independent FMCSA-authorized motor carriers under their own tariffs and insurance. GetMoved is not a party to the transportation contract and is not liable for loss, damage or delay in transit — such claims are handled by the carrier under 49 CFR Part 370.` |

## 4.5 Ažuriraj Terms

Zamijeni formulaciju iz 3.3 („GetMoved provides software and a listing platform…") sa:

> `GetMoved LLC is a household goods broker registered with the Federal Motor Carrier Safety Administration (USDOT [X], MC [Y]) and holds a $75,000 surety bond as required by 49 CFR §387.307. GetMoved arranges transportation but does not perform it. Your transportation contract is with the motor carrier you select, under its own terms, published tariff and insurance. Claims for loss, damage or delay must be filed with that carrier under 49 CFR Part 370.`

Dodaj i sekciju o politici otkazivanja i depozita sa upućivanjem na `cancellation-policy.html` (§371.117 traži da je **istaknuta**, ne samo linkovana iz Uslova).

## 4.6 NY / NJ — pažnja, MC broj ih ne pokriva

FMCSA ovlašćenje pokriva **samo međudržavne** selidbe. Selidba unutar New Yorka ili unutar New Jerseyja je unutardržavna i podliježe državnoj regulativi (NYSDOT; NJ Division of Consumer Affairs, N.J.A.C. 13:44D) — uključujući i posredovanje. Zato na tim stranicama ograda iz 2.4 **ostaje**, uz dopunu:

> `GetMoved's FMCSA broker authority covers interstate moves. Moves that begin and end within [STATE] are intrastate and are performed by carriers licensed by [STATE regulator].`

`[TODO: provjeriti sa advokatom da li je potrebna zasebna državna registracija posrednika za unutardržavne selidbe u NY i NJ. Ako jeste, a nemate je — geo stranice ostaju neutralizovane.]`

---

# PARALELNO — operativa koja mora biti gotova do dana aktivacije

Ovo nije copy i Claude Code to ne piše sam, ali bez toga Faza 4 ne smije da se pusti. Navedeno da se ne zaboravi:

| Obaveza | Propis | Rok čuvanja |
|---|---|---|
| Potpisan pisani ugovor sa svakim prevoznikom (naziv, adresa, DOT/MC, izjava da su procjene isključivo u ime prevoznika i po njegovoj tarifi, potpisi) | §371.115 | 3 godine nakon prestanka |
| Dostava liste prevoznika svakom korisniku | §371.105, §371.109 | — |
| Procjena zasnovana na objavljenoj tarifi prevoznika, nakon fizičkog pregleda ili pisanog odricanja (min. 7pt Universe font na obrascu) | §371.113 | — |
| Potpisane potvrde o prijemu FMCSA brošura | §371.111 | 3 godine |
| Evidencija zahtjeva za otkazivanje i dokaza o povraćaju | §371.117 | 3 godine |
| TCPA log saglasnosti | TCPA | 5 godina |
| Log provjere prevoznika u SAFER bazi | FTC §5 (dokaz za tvrdnju) | trajno |

**Najveći operativni rizik:** §371.113 traži da procjena ide iz tarife konkretnog prevoznika. Vaš AI generiše inventar i cijenu prije nego što je prevoznik izabran. Provjerite sa advokatom da li vaš tok znači da GetMoved izdaje procjenu (tada podliježe §371.113) ili je samo prenosi od prevoznika (tada ne). Odgovor određuje da li AI pricing engine smije da se prikaže korisniku prije izbora prevoznika.

---

## PRIHVATANJE — provjeri prije nego javiš da je gotovo

Nakon svake faze, pusti grep i potvrdi da vraća **nula** pogodaka:

```
FMCSA Verified · binding quote · binding estimate · escrow · held securely ·
getmoved.com · support@getmoved · we'll find · we will find · moving experts ·
we handle the rest · 95% · $190 · 24-48 · 0 phone calls
```

Zatim ručno potvrdi:

- [ ] Svaka forma s telefonom ima neoznačen, `required`, čitljiv TCPA checkbox iznad submit dugmeta
- [ ] Footer svake stranice ima: legal-strip, „Do Not Sell or Share", link na Privacy, Terms, Cancellation Policy, Do Not Call
- [ ] `do-not-call.html`, `do-not-sell.html`, `cancellation-policy.html` postoje i linkovane su
- [ ] Nijedna stranica ne tvrdi da GetMoved bira, kontaktira ili poredi prevoznike umjesto korisnika
- [ ] Nema novih izmišljenih brojeva; svi `[TODO:]` markeri su izlistani u finalnom izvještaju
- [ ] Dizajn se nije pomjerio — uporedi screenshot prije/poslije za `index.html` i `pricing.html`
- [ ] Svi novi linkovi vraćaju 200, nema broken anchor-a
- [ ] Nijedan analytics/marketing script se ne izvršava prije pristanka (provjeri u Network tabu sa čistim profilom iz EU)
- [ ] **Faza 2:** svaki brokerski copy je sačuvan u `BROKER-COPY:OFF` bloku, nijedan nije obrisan; spisak markera je ispisan
- [ ] **Faza 4:** grep `BROKER-COPY` vraća nula pogodaka; `[TODO]` za USDOT/MC su popunjeni stvarnim brojevima; `carriers.html` postoji i nije prazna

---

## ŠTA NE RADI

- Ne dodavati USDOT/MC brojeve dok SAFER ne pokaže `ACTIVE` — dodijeljen broj sa statusom `NOT AUTHORIZED` se **ne smije** prikazati na sajtu.
- Ne pisati „FMCSA registration pending", „application submitted", „authority coming soon" ni bilo koju varijantu. Najava ovlašćenja koje još ne postoji je isto nastupanje bez ovlašćenja.
- Ne pisati da smo „FMCSA registered", „bonded" ili „licensed broker" prije Faze 4.
- Ne obećavati „guaranteed price", „lowest price", „fully insured".
- Ne dodavati testimonijale, ocjene ni brojeve korisnika kojih nema u CMS-u.
- Ne prevoditi sajt.
- Ne refaktorisati CSS ni JS „usput".

---

*Osnova: analiza sajta od 15.08.2026. Nije pravno mišljenje — finalni tekst prije objave mora pregledati advokat za američko transportno/potrošačko pravo i advokat za GDPR.*
