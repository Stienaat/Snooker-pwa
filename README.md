# Snooker PWA

Afzonderlijke webversie van Snooker door FS-Creations.

## Huidige basis

- installeerbare PWA met offline cache, eigen installatieknop en geschikte Android/iOS-pictogrammen;
- responsieve tafel volgens 3569 × 1778 mm;
- startmenu voor Solo, Tegen Phone en Scholing;
- lege starttafel en officiële beginopstelling;
- uniforme spelbalk met Effect, Hulp, Reset, README en Exit;
- draaibare tweekleurige keu en fijne richtlijn;
- richting vastzetten met een tik en kracht bepalen door achteruit te trekken;
- eerste gedeelde fysicabasis voor balbotsingen, banden en vertraging;
- zes werkende potzones met een korte krimp- en verdwijnanimatie;
- witte bal wordt na potten voorlopig automatisch opnieuw in de D geplaatst;
- eerste Solo-regelmotor met score, break, eerste balcontact, fouls,
  rood/kleur-volgorde en terugplaatsen van kleuren;
- eerste speelbare Tegen Phone-modus met afzonderlijke scores, beurtwisseling,
  foulpunten en een tegenstander die vrije potlijnen, raakpunt, kracht en
  eenvoudig effect berekent met exact dezelfde fysica als de speler;
- vier phone-niveaus: NOVICE, BASIC, GEVORDERD en EXPERT; zij verschillen in
  richtafwijking, krachtdosering, balkeuze en het gebruik van eenvoudig effect;
- Scholing met de techniekproef EFFECTEN: vaste witte en rode bal, blijvende
  effectring, drie hulpstanden (EXTRA/NORMAAL/UIT), voorspelde banen na het
  contact en bediening voor Reset, Nieuw, README en Exit;
- iedere Scholingsopstelling toont op het laken de bedoeling, de aanpak van de
  PRO en het verwachte resultaat; een bleke ring markeert het aanbevolen
  pomeranspunt terwijl de zwarte stip de werkelijke spelerskeuze blijft;
- onder de effectring toont een kleine krachtmeter zowel de aanbevolen
  PRO-kracht als de werkelijk opgebouwde kracht tijdens het aantrekken;
- Scholingsvoorspellingen hebben geen vaste lengte meer: actuele kracht,
  wrijving, botsing en banden bepalen het berekende stoppunt van beide ballen;
- score, break, melding en volgende doelbal staan rechtstreeks in zacht groen
  op het laken zodat ze op elk scherm leesbaar blijven;
- werkende effectcirkel met indirecte veegbediening: boven/onder voor top- en
  backspin, links/rechts voor de reactie op banden;
- de instelbeweging eindigt bij loslaten, maar de effectcirkel blijft zichtbaar;
- tik wisselt steeds tussen vrij richten en vastgezette rode richting;
- de lijn wordt bij de eerste tik onmiddellijk helder rood en iets dikker;
- een volledig teruggebrachte keu levert geen stoot; de bal vertrekt alleen
  wanneer bij het loslaten nog kracht is opgebouwd;
- Hulp schakelt de fijne witte/rode richtlijn volledig aan of uit;
- de richtlijn reikt tot de tafelrand en dooft onderweg geleidelijk uit;
- maximale stootkracht bedraagt ongeveer twee vrije tafellengtes;
- snelle stoten worden intern opgesplitst in kleine fysicastappen zodat geen
  enkele bal tussen twee beelden door een andere bal kan vliegen;
- eerste internetlaag met spelernaam, online-status en kamers voor exact twee
  spelers via een korte kamercode;
- online statussen: OFFLINE, IK BEN ONLINE, WACHT OP TEGENSTANDER,
  VERBONDEN MET [NAAM] en TEGENSTANDER OFFLINE;
- dezelfde Node-server verzorgt de PWA en de realtime WebSocket-verbinding;
- eerste speelbare online partijlaag met vaste spelerszetels, servergestuurde
  beurtbeveiliging, gedeelde plaatsing van wit en gedeelde stootparameters;
- beide toestellen animeren dezelfde stoot; na stilstand worden ballen, scores,
  break, regelfase en volgende beurt definitief gelijkgetrokken;
- online gebruikt nu één gezaghebbende fysicaberekening: alleen de speler aan
  beurt berekent, terwijl het andere toestel circa 25 balbeelden per seconde
  ontvangt en dus geen afwijkende botsingsuitkomst meer kan produceren;
- draaien, vastzetten, effect en aantrekken van de keu worden eveneens live
  naar de tegenstander gestuurd;
- een tijdelijke WebSocket-onderbreking probeert automatisch opnieuw te
  verbinden; zetel en laatst bevestigde speltoestand blijven 60 seconden bewaard;
- gekende spelers melden zich bij het openen automatisch aan; de server houdt
  met heartbeats bij wie beschikbaar of in een partij is en verwijdert gesloten
  of verbroken sessies uit de lijst;
- beschikbare onbekende spelers verschijnen in het online-menu en kunnen met
  één tik worden uitgedaagd; AANNEMEN maakt automatisch een privékamer voor de
  uitdager en de ontvanger, WEIGEREN meldt dit aan de uitdager;
- geschikt als basis voor telefoon, tablet en pc.

## Starten voor ontwikkeling

Installeer Node.js 20 of nieuwer en voer vanuit deze projectmap uit:

```bash
npm install
npm start
```

Open daarna `http://localhost:8080`. Voor een kamertest opent u dit adres in
twee browsers of op twee toestellen binnen hetzelfde netwerk.

## Bouwvolgorde

1. tafel, bediening en responsiviteit op echte schermen testen;
2. effecten en resterende uitzonderingen van de volledige regels overbrengen;
3. de vier niveaus van Tegen Phone praktisch testen en verder afstellen;
4. de Scholingsdemobank later met nieuwe technieken en situaties uitbreiden;
5. online kamerverbinding testen op twee toestellen;
6. online stoten, beurt en eindtoestand op twee echte toestellen testen;
7. vloeiendheid en automatisch herstel praktisch op twee toestellen testen;
8. privé testen en daarna publiceren op het eigen domein.
