Lore books are authored in `data/books.json`, a separate manifest bundle. It contains six fictional volumes. The original three are: The Patient Furnace (alchemy), Chronicle of Broken Crowns (history and Aurelith), and Dispatches from the Eastern Roads (the looming Mongol threat).

The original volumes have three pages; the three new tomes have six pages, each with two paragraphs per page. Titles and full page text exist in every one of the game's 20 languages. Content validation rejects missing translations or paragraph structure. The prose belongs to the fictional story; the renewed invasion is its established alternate-history premise.

Copies are available free on local shelves in Prague, Pressburg, Krakow, Lviv, Novgorod, London, Bologna, Buda and Pest, Stockholm, Gaillimh, and Mainistir na Naoi Réalta. A local copy uses that location's language. Internal language completeness does not grant the player free translation: the reader shows the original and offers translations from the active companion's known source languages to their supported output languages. A fully fluent reader may also render the copy in their native language.

For a short three-page book, an available translation scroll translates the entire volume into its target language, consuming one scroll. Its translation persists for that volume and source language when reopening the book, until a new voyage. Existing companion or scroll translations prevent duplicate consumption. Consultation records one journal event per volume and grants no repeated rewards or language points. Existing riddle references and the Latin quest codex retain their reading behavior.

Validation: `node tests/books.test.cjs` and the browser page `tests/books-ui.html`.

New six-page volumes:

- **The Pilot's Book of Western Tides** — conflicting coastal records, the three bells, practical sea provisions, and the ninth star. Shelves: London, Amsterdam, Venice, Turku, Gaillimh, and Mainistir na Naoi Réalta.
- **The Workshop Beneath the Dawn** — Aurelith's shared workshops, winter gardens, distant voices, fallible inventors, and ethical limits on weapons. Shelves: Prague, Bologna, Buda and Pest, Athens, and Mainistir na Naoi Réalta.
- **Letters Kept Beneath the Eastern Gate** — missing caravans, uncertain warnings, protection of civilians, common stores, and cautious hopes of western knowledge. Shelves: Krakow, Lviv, Novgorod, Buda and Pest, and Gaillimh.

All six volumes have localized titles, page headings and prose in all 20 languages. Some localized editions use more concise wording while retaining the narrative and clues. The six-page books require a resident library scholar: 3 silver (300 copper) per target language and source-language copy, saved for subsequent reading. Their full text cannot be translated by companions or scrolls, though companions can still explain titles. Native or fluent players can read the original text. Payment is rejected atomically if funds are insufficient or that translation already exists. They add lore rather than mandatory quest requirements.

Books weigh 0.35 kg; the six-page tomes weigh 2.4 kg and have distinct metal-bound icons. These are descriptive weights, not an encumbrance mechanic. A tome is left at its local library for three voyage days, paid on commission, then collected at the same destination. Its text is unavailable there while the scholar holds it. Travel and community work advance the deadline; a local one-day wait is also offered. The quest journal tracks outstanding orders and collection readiness. Collection unlocks the saved translated edition; reset clears orders and translations.
