'use strict';
// UI copy only. Authored NPC phrases and translated phrasebook entries stay in WORLD.
const UI_CS = {
 'Discovered regions':'Objevené oblasti',
 'United Kingdom':'Spojené království',
 'Voyage map':'Mapa výpravy','Europe':'Evropa','World':'Svět','Around me':'Moje okolí','Zoom in':'Přiblížit','Zoom out':'Oddálit','Interactive world map':'Interaktivní mapa světa',
 'Click a marked place to travel. Locked places show what is missing.':'Kliknutím na označené místo můžeš cestovat. Zamčená místa ukazují, co ti chybí.',
 'You are here':'Jsi zde','Visited':'Dokončeno','Available':'Dostupné','Locked':'Zamčeno','Map data':'Mapová data',
 'Explore nearby':'Prozkoumat okolí','Gathering simulation: collect materials, then return to the quest giver.':'Simulace sběru: nasbírej materiály a vrať se k zadavateli úkolu.',
 'Remaining':'Zbývá','Gathered':'Nasbíráno','Delivered':'Odevzdáno','Return to quest giver':'Vrátit se k zadavateli',
 'Source exhausted for this voyage':'Zdroj je pro tuto výpravu vyčerpán','Cannot gather here yet, or this source is exhausted.':'Tady zatím sbírat nemůžeš, nebo je zdroj vyčerpán.',
 'Gather wood at the forest edge':'Nasbírat dřevo u lesa','Pick flowers in the meadow':'Natrhat květiny na louce','Gather lavender in the garden':'Nasbírat levanduli v zahradě','Collect loose ore near the quarry':'Nasbírat volnou rudu u lomu',
 'Firewood':'Dřevo na oheň','Meadow flowers':'Luční květiny','Janek · carpenter':'Janek · tesař','Zuzana · apothecary':'Zuzana · lékárnice','Janek · carpenter · gathering':'Janek · sběr dřeva','Zuzana · apothecary · gathering':'Zuzana · sběr květin',
 'Bundle':'Balíček','You already own this equipment.':'Tuto výbavu už máš.',
 'Complete':'Dokončit','Accept the errand':'Přijmout vedlejší úkol',
 'Missing':'Chybí','Decipher both Latin pages':'Rozluštit obě latinské stránky','Reward already collected':'Odměna už byla vyzvednuta','Optional errands':'Vedlejší úkoly','Fetch':'Přinést',
 'Norwegian':'Norština','Swedish':'Švédština','Finnish':'Finština','Hungarian':'Maďarština',
 'Norway':'Norsko','Sweden':'Švédsko','Finland':'Finsko','Hungary':'Maďarsko','Ireland':'Irsko','Budapest':'Budapešť',
 'The last road to Ireland':'Poslední cesta do Irska',
 'The astrolabe is restored. Continue through Norway, Sweden and Finland to Ireland. Hungary is optional.':'Astroláb je obnoven. Pokračuj přes Norsko, Švédsko a Finsko do Irska. Maďarsko je volitelné.',
 'Ireland reached. The library of languages is open. Voyage complete.':'Dorazil jsi do Irska. Knihovna jazyků je otevřená. Výprava dokončena.',
 'To claim the sun disc: read the Latin glossary, then decipher both codex pages.':'Chceš-li získat sluneční kotouč, přečti latinský slovníček a rozlušti obě stránky kodexu.',
 'Esperanto':'Esperanto',
 'Read book':'Číst knihu','Required item missing':'Chybí potřebný předmět',
 'The western lens':'Západní čočka','The northern ring':'Severní prstenec','The southern disc':'Jižní kotouč','The reunion':'Shledání',
 'German':'Němčina','Dutch':'Nizozemština','Danish':'Dánština','French':'Francouzština','Latin':'Latina','Greek':'Řečtina',
 'London':'Londýn','Berlin':'Berlín','Copenhagen':'Kodaň','Florence':'Florencie','Athens':'Athény',
 'England (Britain)':'Anglie (Británie)','Germany':'Německo','Netherlands':'Nizozemsko','Denmark':'Dánsko','Italy':'Itálie','France':'Francie','Spain':'Španělsko','Greece':'Řecko',
 'Crystal lens':'Křišťálová čočka','Workshop seal':'Dílenská pečeť','Northern sea chart':'Severní námořní mapa','Northern ring':'Severní prstenec','Codex of three paths':'Kodex tří cest','Letter to Toledo':'Dopis do Toleda','Sun disc':'Sluneční kotouč','Latin deciphering glossary':'Latinský slovníček pro luštění',
 'Codex · Latin manuscript':'Kodex · latinský rukopis',
 'Prologue complete. The observatory trail continues in future chapters.':'Prolog dokončen. Jsou otevřené tři cesty: získej čočku v Anglii, prstenec v Dánsku a kotouč ve Španělsku. Poté se vydej do Řecka.',
 'The astrolabe is restored. Eliáš is found. Voyage complete.':'Astroláb je obnoven. Eliáš je nalezen. Výprava dokončena.',
 'Meaning partially known':'Význam částečně známý',
 'Archive word notes':'Slovní zásoba archivu',
 'phrase':'fráze','word':'slovo','verb':'sloveso','Word hint':'Nápověda slova','Verb hint':'Nápověda slovesa',
 'Heard rumors':'Zaslechnuté pověsti',
 'Rumors are unverified. Compare them with witnesses and evidence.':'Pověsti nejsou ověřené. Porovnej je s výpověďmi svědků a důkazy.',
 'Ask locals what people are talking about.':'Zeptej se místních, co se tu povídá.',
 'Confident':'Pokročilá znalost','Learning':'Učíš se','New language':'Nový jazyk',
 'Read phrasebooks and practise with locals to recognise sensible replies.':'Čti slovníky a mluv s místními, abys rozpoznal smysluplné odpovědi.',
 'You said':'Tvoje odpověď','Meaning unknown':'Význam neznámý','Required item missing':'Chybí potřebný předmět',
 'The NPC dismissed you. Replay the conversation to try a different response.':'Postava tě odmítla. Zopakuj rozhovor a zkus jinou odpověď.',
 'UI language':'Jazyk rozhraní','Native language':'Mateřský jazyk',
 'The Ninth Meridian':'Devátý poledník',
 'A language-learning RPG · playable prototype':'RPG pro výuku jazyků · hratelný prototyp',
 'A missing cartographer. A broken astrolabe. A secret carried across Europe.':'Zmizelý kartograf. Rozbitý astroláb. Tajemství putující Evropou.',
 'Your voyage':'Tvá výprava','Destinations':'Cíle výpravy',
 'Easy mode · learned translation notes':'Snadný režim · poznámky z přečtených slovníků',
 'Start a new voyage':'Začít novou výpravu','Translation scroll':'Překladový svitek',
 'Translate this line':'Přeložit repliku a odpovědi','Replay conversation':'Zopakovat rozhovor',
 'Satchel & companions':'Brašna a společníci','Quest journal':'Deník výpravy',
 'Read a phrasebook to learn its entries. Follow the words, follow the trail.':'Přečti si slovník a nauč se jeho fráze. Sleduj slova, sleduj stopu.',
 'No translation notes. Read a phrasebook, use a scroll, or recruit an interpreter.':'Žádné poznámky s překladem. Přečti si slovník, použij svitek nebo přiber tlumočníka.',
 'Conversation recorded. Replay it or continue your voyage.':'Rozhovor je zaznamenán. Zopakuj jej nebo pokračuj ve výpravě.',
 'Read again':'Přečíst znovu','Read phrasebook':'Přečíst slovník',
 'clue recorded':'stopa zaznamenána','find the witness':'najdi svědka',
 'This empty sample pocketbook has no quest phrases yet.':'Tento ukázkový kapesní slovník zatím neobsahuje žádné fráze pro výpravu.',
 'Find the five witnesses of the vanished cartographer and recover the pieces of the Concordance Astrolabe.':'Najdi pět svědků zmizení kartografa a získej části Astrolábu svornosti.',
 'Prague':'Praha','Kraków':'Krakov','Lviv':'Lvov','Czechia':'Česko','Slovakia':'Slovensko','Poland':'Polsko','Ukraine':'Ukrajina','Russia':'Rusko',
 'Czech':'Čeština','Slovak':'Slovenština','Polish':'Polština','Ukrainian':'Ukrajinština','Russian':'Ruština','English':'Angličtina','Irish':'Irština','Spanish':'Španělština','Italian':'Italština',
 'Rain on the cobblestones. A sealed letter waits in the mapmaker’s shop.':'Déšť smáčí dlažbu. V kartografově obchodě čeká zapečetěný dopis.',
 'Below the castle, a caravan prepares to leave for the north.':'Pod hradem se karavana připravuje na cestu na sever.',
 'At the old gate, a watchmaker remembers a stranger with a star-shaped compass.':'U staré brány vzpomíná hodinářka na cizince s kompasem ve tvaru hvězdy.',
 'In a candlelit archive, a locked chest holds a piece of the sky.':'V archivu osvětleném svíčkami ukrývá zamčená truhla kousek nebe.',
 'A northern manuscript reveals that the trail is only beginning.':'Severský rukopis odhaluje, že cesta teprve začíná.',
 'Ada · mapmaker':'Ada · kartografka','Mira · caravan guide':'Mira · průvodkyně karavany','Zofia · watchmaker':'Zofia · hodinářka','Oles · archivist':'Oles · archivář','Lev · astronomer':'Lev · astronom',
 'Tomáš · bookseller':'Tomáš · knihkupec','Eva · bookseller':'Eva · knihkupkyně','Jan · bookseller':'Jan · knihkupec','Iryna · bookseller':'Iryna · knihkupkyně','Anna · bookseller':'Anna · knihkupkyně',
 'Border phrasebook':'Příhraniční slovník','Caravan phrasebook':'Slovník karavany','Northern notes':'Severské poznámky','Italian → Spanish fragment':'Italsko-španělský úryvek','English → Irish pocketbook':'Anglicko-irský kapesní slovník',
 'English translation scroll':'Svitek překladu do angličtiny','Scroll of the mother tongue':'Svitek mateřského jazyka','Map of the ninth meridian':'Mapa devátého poledníku','Brass archive key':'Mosazný klíč od archivu','Silver astrolabe star':'Stříbrná hvězda astrolábu',
 'A caravan interpreter. Translates Polish and Ukrainian into Slovak.':'Tlumočnice karavany. Překládá polštinu a ukrajinštinu do slovenštiny.',
 'Ask about the missing cartographer':'Zeptat se na zmizelého kartografa','Accept the map':'Přijmout mapu','Take the archive key':'Vzít klíč od archivu','Invite Mira to join the voyage':'Pozvat Miru na výpravu','Follow the trail to Lviv':'Vydat se po stopě do Lvova','Unlock the chest and take the star':'Odemknout truhlu a vzít hvězdu','Record the observatory clue':'Zaznamenat stopu k observatoři',
 'NPC is not here.':'Tato postava tu není.','Follow the quest trail before travelling here.':'Než se sem vydáš, sleduj stopy výpravy.','This item is not sold here.':'Tento předmět se zde neprodává.','You already own this book.':'Tuto knihu už máš.','Not enough coins.':'Nemáš dost mincí.','You need to own this phrasebook.':'Nejdřív musíš tento slovník získat.','No scroll available.':'Nemáš dostupný svitek.','No authored translation exists for this language; scroll was kept.':'Pro tento jazyk není připravený překlad; svitek ti zůstává.','This line already has a scroll translation.':'Tato replika už má překlad ze svitku.','That choice is unavailable.':'Tato možnost není dostupná.','Unknown effect.':'Neznámý účinek.'
};
Object.assign(UI_CS,{"Beatrice · abbey keeper":"Beatrice · správkyně opatství","Otto · instrument maker":"Otto · výrobce přístrojů","Sanne · navigator":"Sanne · navigátorka","Astrid · harbour master":"Astrid · správkyně přístavu","Luca · manuscript keeper":"Luca · správce rukopisů","Camille · archivist":"Camille · archivářka","Inés · reliquary keeper":"Inés · správkyně relikviáře","Eleni · observatory guardian":"Eleni · strážkyně observatoře","London travel notes":"Londýn · cestovní slovník","London · bookseller":"Londýn · knihkupec","Berlin travel notes":"Berlín · cestovní slovník","Berlin · bookseller":"Berlín · knihkupec","Amsterdam travel notes":"Amsterdam · cestovní slovník","Amsterdam · bookseller":"Amsterdam · knihkupec","Copenhagen travel notes":"Kodaň · cestovní slovník","Copenhagen · bookseller":"Kodaň · knihkupec","Florence travel notes":"Florencie · cestovní slovník","Florence · bookseller":"Florencie · knihkupec","Lyon travel notes":"Lyon · cestovní slovník","Lyon · bookseller":"Lyon · knihkupec","Toledo travel notes":"Toledo · cestovní slovník","Toledo · bookseller":"Toledo · knihkupec","Athens travel notes":"Athény · cestovní slovník","Athens · bookseller":"Athény · knihkupec"});
Object.assign(UI_CS,{"Restored astrolabe":"Obnovený astroláb","Northern token":"Severní znamení","Aurora chart":"Mapa polární záře","Irish gate key":"Klíč od irské brány","Scholar’s compass":"Učenecký kompas","Bag of salt":"Sáček soli","Lavender bundle":"Svazek levandule","Coil of rope":"Svitek lana","Bag of ore":"Sáček rudy","Travelling boots":"Cestovní boty","Healing salve":"Léčivá mast","Brass compass":"Mosazný kompas","Warm cloak":"Teplý plášť","Ingrid · northern guide":"Ingrid · severská průvodkyně","Erik · aurora cartographer":"Erik · kartograf polární záře","Aino · rune reader":"Aino · čtenářka run","Eszter · travelling scholar":"Eszter · cestující učenka","Niamh · final gatekeeper":"Niamh · strážkyně poslední brány","Boris · baker":"Boris · pekař","Dana · dockhand":"Dana · přístavní dělnice","Marie · herbalist":"Marie · bylinkářka","Rosa · gardener":"Rosa · zahradnice","Petros · fisherman":"Petros · rybář","Freja · chandler":"Freja · dodavatelka lodního vybavení","Bjørn · smith":"Bjørn · kovář","Liv · miner":"Liv · hornice","Oslo field notes":"Oslo · cestovní zápisky","Stockholm field notes":"Stockholm · cestovní zápisky","Helsinki field notes":"Helsinki · cestovní zápisky","Budapest field notes":"Budapest · cestovní zápisky","Galway field notes":"Galway · cestovní zápisky","Boris · baker · errand":"Boris · pekař · pochůzka","Marie · herbalist · errand":"Marie · bylinkářka · pochůzka","Petros · fisherman · errand":"Petros · rybář · pochůzka","Bjørn · smith · errand":"Bjørn · kovář · pochůzka"});
Object.assign(UI_CS,{"Bread loaf":"Bochník chleba","Cheese wedge":"Kus sýra","Dried meat":"Sušené maso","Travel rations":"Cestovní zásoby","Water flask":"Polní láhev","Travel rope":"Cestovní lano","Torch":"Pochodeň","Bandage":"Obvaz","Minor healing potion":"Malý léčivý lektvar","Stamina potion":"Lektvar výdrže","Antidote":"Protijed","Arrows":"Šípy","Iron sword":"Železný meč","Short bow":"Krátký luk","Wooden shield":"Dřevěný štít","Leather armor":"Kožená zbroj","Leather boots":"Kožené boty","Matěj · general store":"Matěj · smíšené zboží","Lenka · food stall":"Lenka · potraviny","Václav · arms merchant":"Václav · zbrojíř","Jana · caravan cook":"Jana · kuchařka karavany","Piotr · bowyer":"Piotr · výrobce luků","Greta · outfitter":"Greta · obchodnice s výbavou","Paola · grocer":"Paola · prodavačka potravin","Diego · apothecary":"Diego · lékárník","Daphne · potion seller":"Daphne · prodavačka lektvarů","Tor · weaponsmith":"Tor · zbrojíř","Aoife · general store":"Aoife · smíšené zboží","Food carried as a supply for later exploration.":"Jídlo jako zásoba pro budoucí průzkum.","A basic supply for future exploration and crafting.":"Základní zásoba pro budoucí průzkum a výrobu.","Equipment with metadata for future exploration and combat.":"Výbava připravená pro budoucí průzkum a souboje.","A one-use supply with an authored effect for future gameplay.":"Jednorázová zásoba s definovaným účinkem pro budoucí hraní.","A bottled remedy with an authored effect for future gameplay.":"Lék v lahvičce s definovaným účinkem pro budoucí hraní.","A bundle of twenty arrows for a short bow.":"Balíček dvaceti šípů pro krátký luk.","A weapon with an authored attack value for future combat.":"Zbraň s definovanou silou útoku pro budoucí souboje."});
let uiLanguage='cs';
function t(text){return uiLanguage==='cs'?(UI_CS[text]||text):(text==='Translate this line'?'Translate line & responses':text==='Prologue complete. The observatory trail continues in future chapters.'?'Prologue complete. Three routes are open: collect the lens in England, the ring in Denmark, and the disc in Spain. Then travel to Greece.':text);}
function coins(n){return uiLanguage==='cs'?`${n} mincí`:`${n} coins`;}
function entryCount(n){return uiLanguage==='cs'?`${n} položek`:`${n} entries`;}
function buyLabel(name,price){return `${uiLanguage==='cs'?'Koupit':'Buy'} ${t(name)} · ${coins(price)}`;}
function localizeStaticUI(){
 document.documentElement.lang=uiLanguage;
 document.title=`${t('The Ninth Meridian')} · Voyage`;
 document.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n);});
 document.getElementById('locations').setAttribute('aria-label',t('Destinations'));
 document.getElementById('ui-language').value=uiLanguage;
}
