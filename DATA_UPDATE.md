# Denní aktualizace

Produkční web: https://ondrejklavik-creator.github.io/investicni-analyzator-/
Zdroj: data/reality.json na výchozí větvi. Web tento soubor načítá při otevření.
Sběr obstarává denní úloha ChatGPT „Investiční reality Mladoboleslavsko“, nikoli JavaScript webu.
První budoucí naplánovaný zápis musí být ještě potvrzen skutečným úspěšným během.

## Rozsah
Byty a rodinné domy pouze Mladá Boleslav, Bakov nad Jizerou, Mnichovo Hradiště, Benátky nad Jizerou.
Další typy vhodných starších objektů do 30 km odděleně; ne rozšiřovat seznam rodinných domů mimo města.
Preferovat stav před rekonstrukcí a domy s více podlažími; studie nebo tvrzení makléře není povolení.

## Bezpečný postup publikování
1. Načíst poslední data/reality.json a aktuální SHA; nepracovat s dávnou kopií.
2. Prověřit alespoň 10 zdrojů, zaznamenat source_checks včetně blokací. Ověření vyžaduje otevřený detail, ne jen úryvek vyhledávače.
3. Zachovat stabilní id a priceHistory. U každého skutečného pozorování přidat datum, cenu, URL a způsob ověření; neduplikovat stejné pozorování. Sloučit duplicity jen při dostatečné shodě identity.
4. Neověřený / zmizelý inzerát není prodaný. Ponechat poslední skutečné checked_at, přesunout do archive s důvodem. Starý archiv nezahazovat.
5. Před přepsáním uložit původní celý soubor do data/history/reality-<UTC timestamp>.json. Nikdy nepřepisovat historický snapshot.
6. Validovat celý JSON, kladnou cenu a plochu, bezpečné přímé https URL a jedinečná id. Null pro neznámé odhady. Bez věrohodných srovnání žádné zisky.
7. Aktualizovat data/reality.json s ochranou aktuálním SHA. Ověřit uložený obsah a veřejný web. Zápis potvrdit teprve při úspěchu, včetně commit SHA.
8. Když zápis není dostupný, nepředstírat synchronizaci. Zachovat funkční stará data a výslovně oznámit chybu uživateli, přiložit JSON, pokud je možné.

## Schéma 3
- collected_at, last_successful_check: skutečné datum kontroly, nikoli otevření nebo pouhého importu. Nezměnit při neúspěšné kontrole.
- published_at: čas publikace; update_status: partial/success/failed; update_message: česky popis pokrytí a omezení.
- items: aktuálně ověřené nabídky; archive: historické, nepotvrzené nebo mimo zadání.
- Položka: id, name, location, type, area, price a purchase (stejná cena), source, url, checked_at, verified, detail_verified, linkType, notes, layout, floors, land_area_m2, priceHistory.
- renovation, other, resale: null pokud nezjištěno; reserve: 15 jako editovatelný modelový předpoklad, analysisStatus: nevyhodnoceno.
- source_checks: source, checked_at, status, notes.
- comparables: lokalita (v MB i část), dispozice, stav, plocha, cena, Kč/m², URL, datum a stav ověření. Uchovávat dlouhodobě v historických snapshotech. Nezaměňovat s realizovanými cenami.
- benchmarks: pouze podložené srovnatelné vzorky s datem, velikostí vzorku a rozsahem; jediná nabídka není tržní odhad. Ruční reference uživatele se nesmějí automaticky přepsat.

## Kontroly aplikace
node test-unit.cjs (test používá data/reality.json; očekávání počtů odpovídá výchozímu snapshotu 31. 10. 2026).
Zkontrolovat načtení v prohlížeči, datum, odkazy, archiv a absenci NaN. Import nesmí smazat ručně vyplněné odhady.


## Nové údaje pro verzi 1.2
- pipeline.last_scheduled_publication: čas úspěšného skutečného naplánovaného zápisu. Při ručním zásahu neměnit. První běh zůstává null, dokud nedoložen.
- pipeline.last_attempt_at a last_attempt_status: skutečný pokus a výsledek. U chyby zachovat poslední úspěšnou kontrolu, data i datum úspěšné publikace; uvést srozumitelnou chybu v update_message a run_history, pokud lze zprávu zapsat.
- run_history: přidávat at, kind (naplánovaná/ruční), status a note; zachovat historii. Jen skutečný úspěšný zápis označit published.
- U stávajících items zachovat first_seen_at a baseline. Novým skutečně poprvé dohledaným nabídkám přidat first_seen_at s aktuálním datem a baseline:false. Výchozí migrované nabídky mají baseline:true a nemají se vydávat za novinky.
- priceHistory: date, price, url, verification. Zdrojové ceny neplést s ručními modely. Nový den lze zaznamenat i při stejné ceně; neduplikovat stejné pozorování. Web zobrazuje poslední změnu mezi rozdílnými cenami.
- comparables: každý záznam vyžaduje stabilní id a property_id pro ověřenou identitu, city, district, street, layout, area_m2 (čistá plocha bytu), price_czk, condition, ownership, url, source, checked_at, verified:true, status:active a observations. Hodnoty condition: Před rekonstrukcí, Po rekonstrukci, Udržovaný, Novostavba, Nezjištěno. Nezaměňovat rekonstrukci domu za rekonstrukci bytu.
- Použít exclude_reason pro rozporné výměry, zvláštní podmínky ceny apod. Rezervace mají status:reserved; zmizelé nepotvrzené inzeráty status:unconfirmed. Web je uchová jako podklad, vyřadí ze statistik. Novostavby a družstevní byty mají vlastní skupiny. Vlastnictví neodhadovat.
- Při shodném property_id uchovat observations a doplnit aktuální pozorování; nikdy nezahazovat starší historii. Změna plochy má být viditelná v poznámce, nesmí se vydávat za změnu tržní ceny za m². Srovnání používá poslední ověření každého bytu do 30 dnů, nikoli všechny dny téže nabídky.
- Před vytvořením automatického odhadu ceny je nutných alespoň 5 skutečně srovnatelných bytů ve stejné části, dispozici, stavu, vlastnictví a podobné ploše. Samotný medián skupiny není odhad prodeje. Výstup zatím záměrně ponechává prodejní cenu kalkulačky na uživatelově podloženém odhadu.
- Kalkulačka ve webu počítá limit pro cílové ROI z celkových nákladů nebo cílový zisk před daní; náklady zahrnují rezervu, financování, dobu držení, provoz a prodej. Úroky se modelují jednoduše ze stálé čerpané části kupní ceny. Zátěžový scénář je model, nikoli predikce trhu.
