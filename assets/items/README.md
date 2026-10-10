# Item icons

Original, transparent SVG illustrations for every registered item, including keys, the silver star, equipment, resources, dictionaries, and lore books. Heavy tomes use a thicker, metal-bound silhouette distinct from small books. Inventory entries use 36px icons; quest reward notifications use 26px icons alongside names and quantities. Currency rewards use `coins.svg`.

Regenerate with `node tools/generate-item-icons.cjs`. The generator reads the world item and book manifests, assigns illustrated silhouettes and accent colors, and fails if an item has no design. Add new designs or mappings there when introducing items.
