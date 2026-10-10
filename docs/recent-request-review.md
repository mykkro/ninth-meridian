# Review of requests during the credit pause

Reviewed against the current code on 10 October 2026.

| Request | Status |
| --- | --- |
| Alms and exploration icons | Implemented in the center panel and City alms controls. |
| Pay for travelling companion at inns | Fixed in this review: 30 copper per person per night; room quote, buttons and scholar lodging agree. |
| Czech innkeeper label | Fixed in this review: translated role suffix to hostinský. |
| English quest-start labels in Czech | Added Czech mappings for quest/investigation start labels; also translated missing reputation/community/donation history labels. |
| Smaller top bar, Settings dialog, move UI language and sound settings there | Implemented: language, sound effects and difficulty are in Settings; speaker and Settings buttons stay in the compact header. |
| Weathered carving preview for every city | Implemented: 22 individually generated city woodcut panoramas, displayed at the top of the center scene and City dialog. |
| Country name in native language under translated heading | Implemented with smaller native-name captions. |
| Coin sound and brief purchase-cost bubble | Implemented for successful vendor purchases; respects sound setting. |
| Port icon beside city names | Implemented in destinations, City dialog and scene heading. |
| Galway is a port | Already implemented in engine boat-route ports. Visual port badge added. |
| Irish-titled books opening in Czech without translation | Fixed: source editions authored for every reference-library language, translation access gated, and content validation checks source editions. |
| Training difficulty with universal Czech translations | Implemented in Settings: Czech hints for lines/replies/riddles/history and Czech text alongside original book pages. |
| Clearer clue and tide-keeper quest dialogue | Implemented: explicit collect–compare–seal–return steps; expanded tide introduction and evidence puzzle in English, Czech and Irish. |
| Enable Gaelic speech | Implemented, including ga-IE installer mapping and voice test; requires a matching browser voice. |

All 33 Node suites and static checks passed; browser checks cover Settings, Training, original Irish books, purchases, header responsiveness and riddles. The requests in this checklist are now implemented.
