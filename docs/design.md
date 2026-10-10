# The Ninth Meridian — game design and technical architecture

This document describes the current browser prototype and the principles that should guide its development. See [README](../README.md) for a walkthrough and commands. Future systems are identified explicitly below.

## Philosophy

The voyage makes understanding people part of exploration. The player is a Czech-speaking traveller looking for the missing cartographer Eliáš, crossing Europe through conversations, evidence, and local help. A language barrier should invite curiosity: recognize a word, compare a phrasebook, ask an interpreter, or spend a translation scroll. The reward is access to someone's meaning and the next piece of the journey.

Language knowledge is deliberately incomplete. Buying a dictionary does not grant fluency, and a word hint does not become a sentence translation. Companions can interpret into a language the player must still decipher. Each small discovery should make earlier uncertainty easier to navigate.

The central design principles are:

- **Authored, fair puzzles.** Quest-critical lines and translations are written content. The player can infer an answer from evidence and context; the UI does not mark the correct answer. Scrolls are retained when an authored translation is unavailable.
- **Recoverable experimentation.** Absurd replies provoke rebukes, threats may end an exchange, and conversations can be reopened. These mistakes currently have no permanent reputation penalty.
- **Progress through relationships and evidence.** People unlock routes and interpret objects. Important gates check possession as well as milestones, so the story's evidence matters mechanically.
- **Freedom within a clear trail.** The opening establishes the mystery; the relic routes allow different orders; the journal makes unfinished work visible. Errands and Hungary are optional.
- **A small, inspectable prototype.** Static files, declarative content, and a separate engine keep new dialogue and quests approachable to author and test.

The geographical map establishes the feeling of a continental journey. Country discovery and route visibility communicate progress. Borders serve orientation; the game is an authored adventure, not a historical or political simulation.

Country labels use medieval-inspired story names: Bohemia, Upper Hungary, Kyivan Rus, the Novgorod Republic, the Holy Roman Empire, the Low Countries, the Republics of Florence and Venice, the Papal States, the Crown of Castile, the Duchy of Athens, and named kingdoms elsewhere. The political briefs use 1453 as their historical reference year, while the map still uses today's country borders. The quest characters and supernatural mysteries remain fictional. `COUNTRY_NAMES` in `i18n.js` supplies English and Czech display names. Location `country` values and GIS identifiers stay modern so terrain, border matching, discovery, and highlighting remain consistent. Language names remain modern for learning clarity.

The minimap supports left-button dragging and wheel zoom anchored at the cursor. Dragging switches European views to manual framing; World mode keeps its projection. Pointer capture keeps an active drag attached to the map, and a four-pixel threshold distinguishes clicks from drags. Dragging over a marker suppresses travel; ordinary clicks and keyboard activation retain travel requirements. Wheel events prevent page scrolling over the map. Reset view returns to automatic discovered-region framing. `mapPoint` accounts for SVG letterboxing, while bounded zoom preserves the view aspect ratio. `tests/map-mouse-ui.html` checks these interactions in the browser.

## Experience and progression

The core loop is: travel to an unlocked destination, meet an NPC, interpret their line and available responses, present evidence or make a decision, gain a clue or item, and consult the journal for the next route. Shops, reading, rumors, and gathering support this loop.

The opening runs Prague → Bratislava → Krakow → Lviv → Novgorod. Novgorod opens three independent relic branches:

| Branch | Destinations | Result |
| --- | --- | --- |
| Western | London | Crystal lens |
| Northern | Berlin → Leipzig and Hamburg in either order → Berlin → Amsterdam → Copenhagen | Northern ring |
| Southern | Florence → Bologna and Venice in either order → Florence → Lyon → Toledo, with the Latin codex puzzle | Sun disc |

Athens requires the branch milestones and all three relics. Restoring the astrolabe reunites the player with Eliáš, then opens Oslo → Stockholm → Turku → Gaillimh. Gaillimh opens three independent sanctuary investigations: the Teampall na Fuinseoige, Scrín na Taoide, and Mainistir na Naoi Réalta. Each requires examining local evidence and interpreting its keeper’s account; all three seals are required to open the library with Niamh. Ireland is the mystery-resolution milestone. The three seals reveal a chart toward Aurelith; the explicit westward departure from Gaillimh is the story-completion milestone. Before departure, the player may continue exploring and return through the journal. The illustrated final scene ends with the ship leaving Ireland, keeping the lost city beyond the horizon. Post-story exploration and a title return preserve progress. Budapest is an optional post-reunion detour. Six additional late-game resource errands reward supplies or useful phrasebooks, independently of the main quest.

Local errands exchange delivered resources for coins and inventory rewards. Some resources can also be gathered through **Explore nearby** after accepting the relevant quest. Sources have finite per-voyage limits; collected resources still need to be handed in. The journal records delivery quantities, route progress, and rumors without duplicating entries.

Germany and Italy have mandatory country investigations to give each leg room to develop. Finishing the capital's initial clue opens two sibling cities. Each city pairs a local witness with an expert: Greta and Konrad in Leipzig, Hannes and Marta in Hamburg, Paolo and Chiara in Bologna, Nadia and Vittorio in Venice. Record the witness account before testing written records or reconstructing physical evidence. These are different dialogue paths and questions leading to the same verified finding; both city orders work. Reckless wrong conclusions now become signed orders: false warrants or damaged evidence block the investigation until restitution. Affected players travel to Buda/Budapest, recover a surviving copy, and have Eszter repair the record before returning. This recovery route opens before Greece when needed. Choosing to study before committing is safe. Each city pays eight coins once.

Both city findings must be reported to Otto in Berlin or Luca in Florence. Their report grants `german_route` or `italian_route`; Amsterdam and Lyon require this milestone alongside the original capital milestone. The other relic branches remain independent and can be interleaved. Klara and Lucia stay with the player through the new cities and offer local event advice. Existing German and Italian travel notes include the new authored phrases, so a solo player can study them without recruiting a companion. Country investigation journal entries list leads, mark individual steps, and link to witnesses, experts, and the return visit.

## Language and difficulty

The native language starts at knowledge 100. Other languages start at 0 and cap at 100. Current rules in `data/world.json` grant 3 points per distinct studied phrase, 1 per distinct word/verb lemma, and 8 per first sensible exchange at an NPC node. Shared phrases and lemmas are credited only once across books; replaying an exchange does not farm knowledge.

Knowledge changes the choice set: rude replies disappear at 30, nonsense at 60. Sensible choices can still be optional hints or decisions, and evidence requirements still apply. The engine retains original choice indices when filtering, so selecting a visible response always selects the intended authored choice.

In easy mode, read dictionaries supply whole-phrase translations and individual word/verb hints. In hard mode these dictionary hints disappear. Companion and scroll translations continue to work. Changing the Czech/English UI language changes interface text, not the language spoken by an NPC.

Dictionary direction is explicit (`from` → `to`). Word matching normalizes Unicode, ignores case, preserves accents, and matches complete tokens. Inflected forms must be listed by the author. The engine does not infer grammar or synthesize sentence translations. A scroll is consumed once and covers the current NPC line plus visible responses; moving to another exchange clears its active translation. Rumor entries retain scroll notes already obtained.

## Companions and relationships

The travelling party has one companion slot. Tereza in Prague, Mira in Bratislava, Rowan in London, Klara in Berlin, Lucia in Florence, and Sigrid in Oslo offer different interpretation skills and travel commitments. Recruitment is free in this prototype. A second candidate gives an authored refusal asking the player to dismiss their current companion first; the engine does not silently replace anyone or execute other effects on the refused choice.

The companion panel provides conversation and dismissal from every city. A dedicated chat menu offers wisdom, rumors, local happenings, and quest discussion independently of the NPC's recruitment or main-story dialogue. Contextual lines reflect the current city and recorded quest milestones/items. These conversations help orient the player without paying rewards or advancing the mystery automatically. They use the same authored-language, dictionary, scroll, practice, and journal rules as other conversations.

Companions interpret known source languages into their configured outputs, including their own native language when the output differs. Tereza and the new guides provide Czech notes; Mira continues to provide Slovak notes for Polish/Ukrainian. This preserves a choice between broad Czech interpretation and the existing indirect language puzzle.

Travel boundaries express each companion's commitments. Tereza stops on arrival in Bratislava, Klara in Copenhagen, Rowan in Athens, and Sigrid in Gaillimh. Mira stays on the initial caravan route, Lucia on the southern relic route, and Rowan cannot embark on the northern finale. A departure before travel leaves the NPC in the origin city; an arrival departure leaves them in the destination. An explicit dismissal leaves them in the current city. The NPC is removed from their former waiting location and appears at the new one. The Known companions panel records these meeting points and provides a visit button using normal travel gates.

Companions can be recruited again at their waiting city after the slot is empty. Their travel rules remain in force. Reopening a conversation or selecting the same current destination does not cause a new departure. A persistent farewell message identifies where the departing companion waits and retains the interpretation available at departure; its dictionary notes remain subject to easy/hard mode.

## Runtime architecture

The game runs from a static HTTP server without a build, backend, or account. `index.html` loads local scripts; the browser fetches the content manifest and its registered JSON files. State lives in memory and resets on refresh.

| File | Responsibility |
| --- | --- |
| `content.js` | Fetch registered content, assemble the world, validate references and supported structures |
| `engine.js` | Own game state, enforce requirements, execute dialogue, travel, purchases, study, translation, rewards, and gathering |
| `app.js` | Connect engine actions to DOM panels, inventory, journal, choices, and error messages |
| `i18n.js` | Translate interface labels independently of dialogue content |
| `map.js` | Render country geometry, discovery, routes, markers, and map controls; delegate travel to the engine |
| `relief.js` | Define the regional image extent and the projection shared by European geometry and terrain |
| `style.css` | Layout, visual states, responsive presentation, and map blending |

Content is assembled before the engine is created. Validation rejects invalid references rather than allowing a missing item, phrase, or dialogue node to fail during play. The engine remains the authority: hiding or disabling a button is presentation, while the underlying action independently checks its requirements.

## Content structures

`data/world.json` has `schemaVersion`, language names, learning rules, `activeQuest`, and a `content` registry of relative paths. Adding a JSON file requires registering it in the appropriate group. Assembly builds keyed objects for items, NPCs, companions, dialogues, phrases, and quests, and an array of locations.

| Content | Main fields and relationships |
| --- | --- |
| Location | `id`, `name`, `country`, geographic `coordinates`, ordered `npcs`, optional `requires`, `milestone`, `mapLabelOffset`, and gathering `actions` |
| Character | `id`, `name`, `language`, `dialogue`, description, optional stock/requirements; an embedded `companion` is extracted into the companion registry |
| Dialogue | `id`, `start`, and a `nodes` object keyed by node ID |
| Node | `phrase`, `choices`, optional language override, ordered `contexts` with requirements/phrase variants, shop flag, rumor ID, or terminal `outcome` |
| Choice | Phrase ID, `next` node, `quality`, optional `requires`, effects, language override, `recruitBlocked`, `companionOnly`, and Easter egg metadata |
| Phrase | A shared phrase ID maps to authored strings keyed by language code |
| Item | ID, type, name/description, optional price and type-specific data |
| Quest | Declared milestones; delivery quests describe completion, resource/count, giver/location, and rewards; `kind: investigation` quests describe `started`, `completion`, return giver/location, and `steps` with milestone, label, location, and giver |

A dialogue is a directed graph. Greeting, evidence, hint, rebuke, reward, farewell, and dismissal nodes are ordinary nodes; choices define graph edges and effects. `quality` controls knowledge filtering, not whether the UI reveals an answer. `outcome` ends the exchange.

Requirements accept a milestone string or an object combining `item`, `items`, `milestone`, `milestones`, `quantities`, and a current `location`. All specified conditions must be satisfied. For example:

```json
{"milestone":"wood_errand_started","quantities":{"wood":3}}
```

Effects support `give`, `milestone`, `recruit`, `dismiss`, and `reward`. Recruitment checks the single slot and location; dismissal applies only to the current companion and records their waiting city. Recruitment choices require an authored refusal node, and dismissal responses are marked `companionOnly`. `give` ensures possession of a quest item without multiplying it on replay. A reward ID makes a payment one-time; `take` consumes delivery materials and `items` grants counted rewards:

```json
{"type":"reward","id":"wood_errand","gold":12,"take":[{"item":"wood","count":3}],"items":[{"item":"torch","count":2}]}
```

Journal reward descriptions in quest files should match executable dialogue effects. Quest definitions alone do not execute payments.

Dictionaries use `from`, `to`, and `entries`. An entry is a phrase reference or a word/verb with a source lemma, translation, and optional forms. Legacy phrase arrays remain supported. Scrolls specify a target language or `native`. Carried books specify an NPC whose dialogue can be opened anywhere while the book is owned. Companion definitions list `native`, `knows`, `outputs`, `home`, `chatStart`, and `dismissedNode`, plus optional recruitment requirements and travel rules (`route`, `leaveBefore`, `leaveAt`) with departure/arrival phrases. Lifecycle references are validated when content loads.

Supply items can include `purchaseQuantity`, `stackable`, `slot`, `stats`, `effects`, `ammunition`, and `compatibleWeapon`. Current purchases check the active shop node, seller stock, coins, and duplicate restrictions. Weapon and consumable statistics are preparation for later systems; carrying them currently does not apply combat or healing effects.

A gathering action declares an ID, label, item, per-click count, total limit, and requirements. The total limit measures material collected, not the number of clicks. Each action's counter persists across travel and conversation replay until a new voyage.

## State and invariants

`DialogueEngine.state` contains:

| Fields | Meaning |
| --- | --- |
| `native`, `easy` | Player language and dictionary-hint mode |
| `gold`, `inventory` | Coins and item counts keyed by item ID |
| `location`, `visitedLocations` | Current destination and travel history |
| `learned`, `knowledge` | Read dictionaries and per-language scores |
| `studiedEntries`, `practicedExchanges` | Deduplication records for learning |
| `companions`, `milestones` | Zero or one travelling interpreter, and persistent quest flags |
| `metCompanions`, `companionLocations` | Encountered companion IDs and waiting-city overrides; an absent override uses the authored home |
| `companionNotice` | Latest automatic departure: companion, waiting city, reason, authored phrase/language, and interpretation snapshot |
| `rumors` | Collected entries with source phrase/NPC/language and retained scroll notes |
| `rewarded`, `gathered` | Paid reward IDs and finite-source usage counters |

The current `npcId`, `nodeId`, `ended`, `scrollNote`, `lastResponse`, and `companionConversation` are engine fields outside `state`. A future save system must deliberately preserve or reconstruct this conversation context as well as persistent state, including the companion's waiting location and travel commitment.

Key invariants are: learning and rewards cannot be farmed by replay; travel and choices use the same requirement semantics; locked actions cannot be invoked through direct engine calls; consumed materials must be present before payment; restarting resets exploration and all deduplication records; and unknown response meanings remain selectable when their gameplay requirements are satisfied.

The public action surface includes `open`, `travel`, `choose`, `buy`, `read`, `cast`, and `gather`. Query methods such as `visibleChoices`, `available`, `canTravel`, `missingRequirements`, `notes`, `knowledge`, and `canGather` drive presentation. Invalid actions throw readable errors that the UI displays.

## Map and visual design

The active European relief is the supplied [4096 × 4096 EuroDEM texture](../media/europe_relief_4096.jpg). Its square aspect ratio is preserved as one image. The original generation scripts and GeoTIFF metadata confirm EPSG:3035 on the GRS80 ellipsoid. `relief.js` implements this ellipsoidal projection and the renderer's original square extent. Cities, labels, routes, and discovery bounds use that georeferencing; European country paths come directly from the supplied GISCO political SVG in the same pixel frame. `assets/europe-relief.metadata.json` records the reproducible frame and coordinate checks.

The image is clipped to country land shapes, converted to grayscale, and multiplied over the country colors. Countries begin gray and acquire a persistent color when visited. Labels and controls remain above terrain; zoom keeps borders and marker interaction usable. World mode uses the original global equirectangular projection without the regional image.

The initial view fits visited countries and newly unlocked destinations. Country labels and route connections reveal with progress; locked destinations remain interactive so their missing requirements can be explained. Europe, World, Around me, and Discovered regions provide alternate views, while manual zoom retains the chosen framing. Markers support click and Enter/Space activation.

The supplied terrain covers selected European land, with no terrain detail over some eastern destinations and neighboring countries. Their country vectors remain present. `assets/europe-borders.json` holds 60 GISCO country/territory paths extracted from the political SVG; fills, borders, and land clipping use them in European views. Natural Earth supplies the World view and fallback outlines. Country coloring and discovery remain dynamic. See [relief source notes](../assets/europe-relief.source.md), including attribution and source limitations, and [alignment preview](../assets/map-alignment-preview.png).

## Authoring and verification

When extending content, register the file, keep IDs stable, declare new milestones, author the source-language phrases and intended translations, and make all item/node references valid. Put evidence requirements on the action that uses the evidence. Provide recovery paths for misunderstandings and keep optional errands separate from main-story gates. Check executable rewards against journal descriptions.

Run the Node suites under `tests/` for progression, branches, dictionaries, rumors, shops, gathering, and map behavior. `python tests/check_static.py` checks local HTML assets, DOM targets, manifest files, JSON syntax, and map geometry. Regenerate the alignment image with `tests/render_map_alignment.ps1` after changing the raster or projection. Browser review should cover both UI languages, easy/hard mode, keyboard travel, narrow layouts, map view changes, and reward replay.

`tests/regions.test.cjs` covers both city orders and reasoning paths, evidence prerequisites, hint recovery, country report gates, companions, solo phrasebook translations, reward replay, and reset. `tests/regions-ui.html` exercises the actual journal buttons, NPC responses, travel gates, map destinations, scrolls, and Czech/English copy. The full browser runner contains 13 gameplay suites.

## Future development

Optional sage encounters use a shared Czech/English tongue so the wager tests reasoning rather than untranslated vocabulary. Five sages divide a reusable ten-riddle bank. A fixed one-silver stake is debited before revealing the question; correct answers return twice the stake and wrong answers return nothing. One global pending wager survives leaving, and completed riddle IDs prevent retry farming. New voyages reset wagers. These encounters do not grant language practice or alter quest restitution.

Free local reference books supply indirect clues before committing money. Their pages have Czech/English text and use the book reader; access is tied to the library location rather than inventory. The bank, sage assignments, and library references are validated during content loading. Engine and browser tests cover payment, invalid answers, pending wagers, one-attempt settlement, translated pages, and insufficient funds.

Save/load should introduce a versioned state schema and validate loaded references against content. Exploration, equipping, consumable use, combat, and creature quests need explicit rules before the existing item statistics become active. Further language puzzles can add evidence comparisons and carefully selected vocabulary without treating a dictionary as full fluency. Companion relationships can later develop costs or imperfect interpretation on top of the implemented recruitment conditions, travel commitments, and conversations; quest-critical interpretation must remain fair and reliable.

## Consequences near the resolution

Dialogue can apply a registered recovery obstruction using `setback`, advancing the calendar and retaining the harm across conversation replay. Its `resolve` effect consumes case-specific evidence and clears only that obstruction; `repairedSetbacks` preserves the ending’s scars. Requirements support active and excluded setbacks, excluded completion milestones, and conditional response visibility. Recovery locations can open through `recoveryAccess`, independently of the normal quest gate. Each recovery quest specifies its giver, source action, proof item, and lost days; content validation checks those references.

The Irish sanctuary errors expel families, detain a witness, or burn multilingual records. Niamh repairs them only after physical recovery evidence is brought from the refuge or sanctuary. The final patron bargain obstructs the opening ceremony and requires a sea journey to Eszter for an independent charter counterseal. All remaining obstructions block the final acceptance. High language knowledge does not hide these ethical risks, and harmful choices award no practice points. Early comic banter remains, but closing main-quest encounters use sober dialogue. The journal records active restitution routes, and the ending lists repaired harms beside an uneasy epilogue.

The medieval eastern Baltic stop is Turku / Åbo, not Helsinki (founded in 1550). Its registered ID, dialogue directions, companion routes, item labels, city lore, crest, and coordinates use Turku. Österland belongs to the Swedish realm. Northern briefs describe the disputed Kalmar Union in 1453: Christian I rules Denmark and Norway; Charles VIII rules Sweden. Amsterdam is in the County of Holland under Philip the Good, while Toledo belongs to the Crown of Castile under John II. Lutheran and Protestant institutions are not presented as established features of the 1453 setting.

The eastern shadow is a fictional divergence from the 1453 historical setting: renewed Mongol mustering, tribute demands, and refugee reports foreshadow a later European invasion. The threat affects rumours and the motivation for sailing west; it adds no invasion timer or combat to this story. Aurelith’ advanced inventors and magicians offer a conjectured defence, not a guaranteed weapon or victory. The present story ends at departure; discovery, diplomacy, preparation, and any war belong to a possible sequel.

Aurelith is the original name of the lost western realm and its vanished capital. The name evokes an ancient, luminous civilization; the story leaves its survival unresolved. The ending artwork predates the rename and its saved generation prompt is preserved as provenance.
