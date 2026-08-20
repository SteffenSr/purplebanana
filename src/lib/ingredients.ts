import type { IngredientProfile } from "./types";

/**
 * Bundled ingredient reference data — one entry per ingredient that's worth
 * a details page:
 *   - distinctive spices and dal staples,
 *   - any ingredient recurring across three or more recipes ("onion" and
 *     "canned tomatoes" cross that line; "salt", "water", and one-off items
 *     don't),
 *   - and branded specialty products (vegan meat/dairy substitutes, etc.)
 *     that an average shopper wouldn't know where to find, however few
 *     recipes use them.
 * Referenced from `seed-recipes.ts` via `Ingredient.ingredientId` and
 * rendered at `/ingredients/<id>`. Static content, like `seed-recipes.ts`
 * itself — not stored in IndexedDB, nothing here is user-editable.
 *
 * Nutrition figures for generic ingredients are typical values per the
 * stated basis (usually per 100 g of the raw/dry ingredient), meant to give
 * a general sense rather than lab-precise numbers — see each entry's
 * `nutrition.note` for spices where a 100 g basis is misleading (they're
 * eaten in pinches). `nutrition` is omitted entirely where no real figure
 * is available (some branded products, see below).
 *
 * Branded-product entries (currently "likemeat-chicken-bites" and
 * "naturli-vegan-butter") source their `whereToBuy` stores, allergens (folded
 * into `flavorAndRole`), and any `nutrition` from the Green List vegan
 * product database (https://api.greenlist.dk, OpenAPI spec at
 * /openapi/public.json) — a Danish public API of vegan products, their
 * ingredients, and which stores carry them. That lookup happened once, at
 * authoring time, the same way a human would look up a fact before writing
 * it down; there is no runtime call to that API anywhere in this app. This
 * app has no server and must work fully offline (see AGENTS.md and
 * docs/architecture.md), so wiring a live fetch to an external API at
 * runtime was never on the table — it would silently break on a cold or
 * offline load exactly like the un-precached-page bug the SW precache
 * script exists to prevent. Store availability isn't static, though: if
 * these products stop showing up in the field, re-query the API (see the
 * `products/{slug}` endpoint, e.g. `like-meat-like-chicken-bites` and
 * `block`) and update `whereToBuy` by hand.
 */
export const ingredientProfiles: IngredientProfile[] = [
  {
    id: "cumin-seeds",
    name: { da: "Spidskommen", en: "Cumin" },
    otherNames: [
      { da: "Spidskommenfrø (hele)", en: "Cumin seeds (whole)" },
      { da: "Stødt spidskommen", en: "Ground cumin" },
      { da: "Jeera (hindi navn)", en: "Jeera (Hindi name)" },
    ],
    emoji: "🌰",
    flavorAndRole: {
      da: "Varm, jordagtig og let bitter-nøddeagtig smag med et strejf af citrus. Hele frø sydet kort i varm olie giver en dyb, røget bund-smag til en ret; stødt spidskommen blandes typisk i senere for en mildere, mere jævnt fordelt varme. I dal og karryretter er det ofte den første smag, der rammer gryden.",
      en: "A warm, earthy, slightly bitter-nutty flavor with a hint of citrus. Whole seeds bloomed briefly in hot oil give a dish a deep, toasted base note; ground cumin is usually stirred in later for a milder, more evenly spread warmth. In dal and curries, it's often the first flavor to hit the pot.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 375,
      proteinG: 17.8,
      carbsG: 44.2,
      fatG: 22.3,
      fiberG: 10.5,
      note: {
        da: "Bruges i teskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a teaspoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Krydderihylden i de fleste supermarkeder", en: "The spice aisle of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker (billigere i store poser)", en: "Indian/Asian grocery stores (cheaper in bulk bags)" },
    ],
  },
  {
    id: "ground-turmeric",
    name: { da: "Gurkemeje", en: "Turmeric" },
    otherNames: [
      { da: "Stødt gurkemeje", en: "Ground turmeric" },
      { da: "Gurkemejerod (frisk)", en: "Turmeric root (fresh)" },
      {
        da: "Curcumin — det gule farvestof i gurkemeje, også brugt som fødevarefarve E100",
        en: "Curcumin — turmeric's yellow pigment, also used as the food colorant E100",
      },
    ],
    emoji: "🟡",
    flavorAndRole: {
      da: "Jordagtig, let bitter og svagt peberagtig, med en varm farve der gør enhver gryde tydeligt gylden. Det er sjældent hovedsmagen i en ret, men det farve- og smagslag alle andre krydderier bygger ovenpå. Bruges i små mængder — for meget slår hurtigt over i bitterhed.",
      en: "Earthy, slightly bitter, faintly peppery, and it stains a whole pot a warm gold. It's rarely the headline flavor in a dish — more the color and base note every other spice builds on. Used sparingly; too much tips quickly into bitterness.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 312,
      proteinG: 9.7,
      carbsG: 67.1,
      fatG: 3.3,
      fiberG: 22.7,
      note: {
        da: "Bruges i teskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a teaspoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Krydderihylden i de fleste supermarkeder", en: "The spice aisle of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker (billigere i store poser)", en: "Indian/Asian grocery stores (cheaper in bulk bags)" },
    ],
  },
  {
    id: "fresh-ginger",
    name: { da: "Frisk ingefær", en: "Fresh ginger" },
    otherNames: [
      { da: "Ingefærrod", en: "Ginger root" },
      { da: "Adrak (hindi navn)", en: "Adrak (Hindi name)" },
    ],
    emoji: "🫚",
    flavorAndRole: {
      da: "Skarp, varm og citrusagtig med et strejf af peber — meget mere levende end tørret ingefær. Revet eller finthakket frisk ingefær tilføjer en frisk skarphed, der skærer igennem fede saucer som kokosmælk, og den bruges ofte sammen med hvidløg som en fælles base for en ret.",
      en: "Sharp, warm, and citrusy with a peppery edge — far brighter than dried ginger powder. Grated or minced fresh ginger adds a fresh sharpness that cuts through rich sauces like coconut milk, and it's often paired with garlic as a shared aromatic base for a dish.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 80,
      proteinG: 1.8,
      carbsG: 17.8,
      fatG: 0.8,
      fiberG: 2,
    },
    whereToBuy: [
      { da: "Grøntsagsafdelingen i de fleste supermarkeder", en: "The produce section of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker (ofte friskere og billigere)", en: "Indian/Asian grocery stores (often fresher and cheaper)" },
    ],
  },
  {
    id: "garlic",
    name: { da: "Hvidløg", en: "Garlic" },
    otherNames: [
      { da: "Hvidløgsfed", en: "Garlic clove" },
      { da: "Lasan (hindi navn)", en: "Lasan (Hindi name)" },
    ],
    emoji: "🧄",
    flavorAndRole: {
      da: "Skarp og svovlholdig rå, men bliver sødlig og nøddeagtig, når den steges blidt. Finthakket eller presset hvidløg er en af de mest almindelige aromatiske baser i madlavning verden over, typisk stegt kort efter løget, lige før væske eller krydderier tilsættes.",
      en: "Pungent and sulfurous raw, but turns sweet and nutty once gently cooked. Minced or crushed garlic is one of the most common aromatic bases in cooking worldwide, typically cooked briefly right after the onion, just before liquid or spices go in.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 149,
      proteinG: 6.4,
      carbsG: 33,
      fatG: 0.5,
      fiberG: 2.1,
    },
    whereToBuy: [
      { da: "Grøntsagsafdelingen i alle supermarkeder", en: "The produce section of every supermarket" },
    ],
  },
  {
    id: "red-lentils",
    name: { da: "Røde linser", en: "Red lentils" },
    otherNames: [
      { da: "Masoor dal (hindi navn)", en: "Masoor dal (Hindi name)" },
      { da: "Split røde linser", en: "Split red lentils" },
    ],
    emoji: "🟠",
    flavorAndRole: {
      da: "Mild, let sødlig og jordagtig — de mest neutrale af de gængse linser, hvilket gør dem til et godt lærred for krydderier. Røde linser er skallede og delte, så de koger hurtigt (20-25 minutter) og falder helt fra hinanden til en cremet, næsten puréagtig konsistens uden behov for udblødning.",
      en: "Mild, slightly sweet, and earthy — the most neutral of the common lentils, which makes them a good canvas for spices. Red lentils are hulled and split, so they cook fast (20-25 minutes) and break down completely into a creamy, almost purée-like texture with no soaking needed.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, tørre", en: "Per 100 g, dry" },
      calories: 352,
      proteinG: 24.6,
      carbsG: 63.4,
      fatG: 1.1,
      fiberG: 10.7,
    },
    whereToBuy: [
      { da: "Almindelige supermarkeder (ris- og bønnehylden)", en: "Regular supermarkets (rice and beans aisle)" },
      { da: "Indiske/asiatiske specialbutikker (billigere i store poser)", en: "Indian/Asian grocery stores (cheaper in bulk bags)" },
    ],
  },
  {
    id: "yellow-split-peas",
    name: { da: "Gule tørrede ærter", en: "Yellow split peas" },
    otherNames: [
      { da: "Gule ærter", en: "Yellow peas" },
      { da: "Vatana (hindi navn for hele ærter)", en: "Vatana (Hindi name for whole peas)" },
    ],
    emoji: "🟡",
    flavorAndRole: {
      da: "Jordagtig og let sødlig, med mere bid og en tættere, mere klumpet konsistens end røde linser selv efter lang kogning. De tåler længere simretid godt, og deres tætte struktur gør dem mættende i en dal, hvor de bliver bløde og cremede uden helt at opløses.",
      en: "Earthy and slightly sweet, with more bite and a denser, chunkier texture than red lentils even after a long simmer. They hold up well to longer cooking, and their density makes for a hearty dal where they turn soft and creamy without fully dissolving.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, tørre", en: "Per 100 g, dry" },
      calories: 341,
      proteinG: 24.6,
      carbsG: 60.4,
      fatG: 1.2,
      fiberG: 25.5,
    },
    whereToBuy: [
      { da: "Almindelige supermarkeder (ris- og bønnehylden)", en: "Regular supermarkets (rice and beans aisle)" },
      { da: "Indiske/asiatiske specialbutikker (billigere i store poser)", en: "Indian/Asian grocery stores (cheaper in bulk bags)" },
    ],
  },
  {
    id: "coconut-milk",
    name: { da: "Kokosmælk", en: "Coconut milk" },
    otherNames: [
      { da: "Kokosmælk på dåse", en: "Canned coconut milk" },
      { da: "Kokosfløde (den fedeste version)", en: "Coconut cream (the richest version)" },
    ],
    emoji: "🥥",
    flavorAndRole: {
      da: "Rig, sødlig og let nøddeagtig kokossmag, med en tyk, cremet konsistens takket være det høje fedtindhold. Det er den mest almindelige måde at gøre en dal eller karry cremet og mild på uden mejeriprodukter — rystes godt inden brug, da fedtet ofte skiller sig fra vandet i dåsen.",
      en: "Rich, slightly sweet, faintly nutty coconut flavor, with a thick, creamy body thanks to its high fat content. It's the most common way to make a dal or curry rich and mellow without dairy — shake the can well before opening, since the fat often separates from the water inside.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, fed dåsekokosmælk", en: "Per 100 g, full-fat canned" },
      calories: 230,
      proteinG: 2.3,
      carbsG: 5.5,
      fatG: 24,
      fiberG: 2.2,
    },
    whereToBuy: [
      { da: "Almindelige supermarkeder", en: "Regular supermarkets" },
      { da: "Asiatiske specialbutikker (ofte billigere pr. dåse)", en: "Asian grocery stores (often cheaper per can)" },
    ],
  },
  {
    id: "coconut-oil",
    name: { da: "Kokosolie", en: "Coconut oil" },
    otherNames: [{ da: "Kokosfedt", en: "Coconut fat" }],
    emoji: "🥥",
    flavorAndRole: {
      da: "Neutral til let sødlig kokossmag (mere udtalt i uraffineret olie), og fast ved stuetemperatur. Bruges som stegefedt i mange indiske retter i stedet for smør eller ghee — den tåler middel-høj varme fint og smelter hurtigt, når den rammer en varm gryde.",
      en: "Neutral to lightly sweet coconut flavor (more pronounced in unrefined oil), and solid at room temperature. Used as the cooking fat in many Indian dishes in place of butter or ghee — it handles medium-high heat well and melts fast the moment it hits a hot pot.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 862,
      proteinG: 0,
      carbsG: 0,
      fatG: 100,
    },
    whereToBuy: [
      { da: "Almindelige supermarkeder", en: "Regular supermarkets" },
      { da: "Helsekostbutikker", en: "Health food stores" },
    ],
  },
  {
    id: "garam-masala",
    name: { da: "Garam masala", en: "Garam masala" },
    otherNames: [{ da: "Nordindisk krydderiblanding", en: "North Indian spice blend" }],
    emoji: "🧂",
    flavorAndRole: {
      da: "En varm, sødlig, aromatisk blanding — typisk kanel, kardemomme, nelliker, spidskommen og sort peber — snarere end én enkelt smag. Rørt i mod slutningen af tilberedningen tilføjer den dybde og en behagelig varme uden den skarpe styrke, chili giver. Blandinger varierer meget fra mærke til mærke.",
      en: "A warm, sweet, aromatic mix — typically cinnamon, cardamom, cloves, cumin, and black pepper — rather than one single flavor. Stirred in toward the end of cooking, it adds depth and a pleasant warmth without the sharp heat chili brings. Blends vary a lot from brand to brand.",
    },
    nutrition: {
      per: { da: "Pr. 100 g (varierer meget efter blanding)", en: "Per 100 g (varies a lot by blend)" },
      calories: 379,
      proteinG: 15,
      carbsG: 55,
      fatG: 15,
      fiberG: 30,
      note: {
        da: "Bruges i teskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a teaspoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Krydderihylden i de fleste supermarkeder", en: "The spice aisle of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker", en: "Indian/Asian grocery stores" },
    ],
  },
  {
    id: "ground-coriander",
    name: { da: "Stødt koriander", en: "Ground coriander" },
    otherNames: [{ da: "Malet koriander / dhania", en: "Ground coriander / dhania" }],
    emoji: "🌿",
    flavorAndRole: {
      da: "Varm, sødlig og let citrusagtig — helt anderledes end frisk koriander, som den kommer fra samme plantes frø. Den runder skarpheden fra spidskommen og chili af og giver retten en blødere, mere afrundet baggrundssmag frem for en fremtrædende hovedsmag.",
      en: "Warm, sweet, and slightly citrusy — quite different from fresh cilantro, though it comes from the seeds of the same plant. It rounds off the sharpness of cumin and chili, giving a dish a softer, more rounded background flavor rather than standing out on its own.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 298,
      proteinG: 12.4,
      carbsG: 55,
      fatG: 17.8,
      fiberG: 41.9,
      note: {
        da: "Bruges i teskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a teaspoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Krydderihylden i de fleste supermarkeder", en: "The spice aisle of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker (billigere i store poser)", en: "Indian/Asian grocery stores (cheaper in bulk bags)" },
    ],
  },
  {
    id: "black-mustard-seeds",
    name: { da: "Sorte sennepsfrø", en: "Black mustard seeds" },
    otherNames: [{ da: "Rai / sarson (hindi navn)", en: "Rai / sarson (Hindi name)" }],
    emoji: "⚫",
    flavorAndRole: {
      da: "Skarp og nøddeagtig med en let bitterhed, meget mildere end sennepspulver, når frøene ristes i varm olie først. De tilsættes altid hele i begyndelsen af tilberedningen og syder, til de hopper og knitrer i panden — det er signalet om, at olien er klar til resten af krydderierne.",
      en: "Pungent and nutty with a slight bitterness, much milder than mustard powder once the seeds are toasted in hot oil first. They're always added whole at the start of cooking and sizzle until they pop and crackle in the pan — the cue that the oil is ready for the rest of the spices.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 508,
      proteinG: 26.1,
      carbsG: 28.1,
      fatG: 36.2,
      fiberG: 12.2,
      note: {
        da: "Bruges i teskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a teaspoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Indiske/asiatiske specialbutikker", en: "Indian/Asian grocery stores" },
      { da: "Krydderihylden i nogle supermarkeder", en: "The spice aisle of some supermarkets" },
    ],
  },
  {
    id: "nutritional-yeast",
    name: { da: "Nutritional yeast", en: "Nutritional yeast" },
    otherNames: [
      { da: "Gærflager", en: "Nooch (nickname)" },
      { da: "Inaktiv gær", en: "Inactive/deactivated yeast" },
    ],
    emoji: "🟨",
    flavorAndRole: {
      da: "Ostet, nøddeagtig og umami-rig med en gul, flaget konsistens. Det er en af de mest almindelige måder at give veganske retter en ostelignende dybde uden mejeriprodukter — rørt i mod slutningen af tilberedningen tykner det også let en sauce.",
      en: "Cheesy, nutty, and deeply umami, with a yellow, flaky texture. It's one of the most common ways to give a vegan dish a cheese-like depth without dairy — stirred in toward the end of cooking, it also lightly thickens a sauce.",
    },
    nutrition: {
      per: { da: "Pr. 100 g (varierer efter mærke)", en: "Per 100 g (varies by brand)" },
      calories: 325,
      proteinG: 45,
      carbsG: 36,
      fatG: 5,
      fiberG: 20,
      note: {
        da: "Mange mærker er tilsat vitamin B12 — tjek etiketten, hvis det er en del af grunden til, du bruger det.",
        en: "Many brands are fortified with vitamin B12 — check the label if that's part of why you use it.",
      },
    },
    whereToBuy: [
      { da: "Helsekostbutikker", en: "Health food stores" },
      { da: "Den veganske hylde i de fleste større supermarkeder", en: "The vegan aisle of most larger supermarkets" },
    ],
  },
  {
    id: "chili-powder",
    name: { da: "Chilipulver", en: "Chili powder" },
    otherNames: [{ da: "Ligner cayennepeber i styrke", en: "Similar heat level to cayenne pepper" }],
    emoji: "🌶️",
    flavorAndRole: {
      da: "Ren, direkte chilihede uden andre krydderier blandet i (i modsætning til amerikansk 'chili powder', som er en blanding). Bruges i små mængder til at justere en rets styrke — start lavt, da mærker varierer meget i styrke, og det er let at tilsætte mere, men svært at tage fra.",
      en: "Straightforward chili heat with nothing else blended in (unlike American-style 'chili powder,' which is a spice mix). Used in small amounts to dial in a dish's heat — start low, since brands vary a lot in strength, and it's easy to add more but hard to take away.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 282,
      proteinG: 13.5,
      carbsG: 49.7,
      fatG: 14.3,
      fiberG: 34.8,
      note: {
        da: "Bruges i knivspidser, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a pinch at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Krydderihylden i de fleste supermarkeder", en: "The spice aisle of most supermarkets" },
      { da: "Indiske/asiatiske specialbutikker", en: "Indian/Asian grocery stores" },
    ],
  },
  {
    id: "firm-tofu",
    name: { da: "Fast tofu", en: "Firm tofu" },
    otherNames: [
      { da: "Sojabønneost / doufu", en: "Soybean curd / doufu" },
      { da: "Ekstra fast tofu", en: "Extra-firm tofu" },
    ],
    emoji: "🧊",
    flavorAndRole: {
      da: "Meget mild, næsten neutral smag med en fast, let elastisk konsistens, der holder formen ved stegning. Fordi den smager af så lidt i sig selv, optager tofu marinader og krydrede saucer godt — dens rolle i en ret er struktur og protein, mens saucen leverer smagen.",
      en: "Very mild, almost neutral in flavor, with a firm, slightly springy texture that holds its shape when fried. Because it tastes of so little on its own, tofu takes on marinades and spiced sauces well — its job in a dish is structure and protein, while the sauce carries the flavor.",
    },
    nutrition: {
      per: { da: "Pr. 100 g", en: "Per 100 g" },
      calories: 144,
      proteinG: 15.8,
      carbsG: 2.8,
      fatG: 8.7,
      fiberG: 2.3,
    },
    whereToBuy: [
      { da: "Almindelige supermarkeder (køleafdelingen)", en: "Regular supermarkets (chilled aisle)" },
      { da: "Asiatiske specialbutikker (flere typer og bedre priser)", en: "Asian grocery stores (more varieties, better prices)" },
    ],
  },
  {
    id: "fresh-spinach",
    name: { da: "Frisk spinat", en: "Fresh spinach" },
    otherNames: [{ da: "Palak (hindi navn)", en: "Palak (Hindi name)" }],
    emoji: "🥬",
    flavorAndRole: {
      da: "Mild, let jordagtig og svagt bitter, som bliver blidere, jo mere spinaten varmes. Den falder dramatisk sammen i volumen, når den koges — det, der ser ud som alt for meget spinat rå, ender som en beskeden mængde i gryden. Tilsættes typisk sidst, så den lige akkurat falder sammen.",
      en: "Mild, slightly earthy, and faintly bitter, mellowing further the more it's cooked. It collapses dramatically in volume once heated — what looks like far too much spinach raw ends up a modest amount in the pot. Usually added last, just long enough to wilt.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, frisk", en: "Per 100 g, fresh" },
      calories: 23,
      proteinG: 2.9,
      carbsG: 3.6,
      fatG: 0.4,
      fiberG: 2.2,
    },
    whereToBuy: [
      { da: "Grøntsagsafdelingen i alle supermarkeder", en: "The produce section of every supermarket" },
    ],
  },
  {
    id: "kasuri-methi",
    name: { da: "Bukkehornsblade (kasuri methi)", en: "Dried fenugreek leaves (kasuri methi)" },
    otherNames: [
      { da: "Tørrede bukkehornsblade", en: "Dried fenugreek leaves" },
      { da: "Methi", en: "Methi" },
    ],
    emoji: "🍃",
    flavorAndRole: {
      da: "Karakteristisk bitter-sødlig, lidt lidelig 'karry'-duft, der er umulig at erstatte med noget andet krydderi. Bladene knuses typisk mellem håndfladerne, lige inden de rystes ud i gryden mod slutningen af tilberedningen — det er den signaturduft, mange forbinder med restaurant-karryretter som butter chicken.",
      en: "A distinctive bitter-sweet, faintly maple-like 'curry house' aroma that's hard to substitute with any other spice. The leaves are usually crushed between the palms right before being sprinkled into the pot near the end of cooking — it's the signature smell many people associate with restaurant-style curries like butter chicken.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, tørret", en: "Per 100 g, dried" },
      calories: 323,
      proteinG: 26,
      carbsG: 58,
      fatG: 6,
      fiberG: 24,
      note: {
        da: "Bruges i spiseskefulde, ikke i 100 g-portioner — se disse tal som en generel guide, ikke som næring i én ret.",
        en: "Used a tablespoon at a time, not by the 100 g — treat these as a general guide, not the nutrition of one dish.",
      },
    },
    whereToBuy: [
      { da: "Indiske/asiatiske specialbutikker", en: "Indian/Asian grocery stores" },
      { da: "Online kryddeributikker", en: "Online spice retailers" },
    ],
  },
  {
    id: "onion",
    name: { da: "Løg", en: "Onion" },
    otherNames: [
      { da: "Kartoffelløg (det almindelige gule/brune løg)", en: "Yellow/brown onion" },
      { da: "Skalotteløg — mildere, kan bruges i stedet", en: "Shallot — milder, works as a substitute" },
    ],
    emoji: "🧅",
    flavorAndRole: {
      da: "Skarp og svovlholdig rå, med tårefremkaldende dampe fra skæringen, men bliver sød og mild, jo længere den steges. Finthakket løg er den mest almindelige base i madlavning verden over — stegt blødt og gyldent, før andre aromaer som hvidløg og ingefær tilsættes, bygger den den grundlæggende sødme og dybde, resten af retten hviler på.",
      en: "Sharp and sulfurous raw, with tear-inducing fumes while you chop it, but turns sweet and mellow the longer it's cooked. Finely chopped onion is the most common base in cooking worldwide — sautéed soft and golden before other aromatics like garlic and ginger go in, it builds the foundational sweetness and depth the rest of a dish rests on.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, rå", en: "Per 100 g, raw" },
      calories: 40,
      proteinG: 1.1,
      carbsG: 9.3,
      fatG: 0.1,
      fiberG: 1.7,
    },
    whereToBuy: [
      { da: "Grøntsagsafdelingen i alle supermarkeder", en: "The produce section of every supermarket" },
    ],
  },
  {
    id: "canned-tomatoes",
    name: { da: "Tomater på dåse", en: "Canned tomatoes" },
    otherNames: [
      { da: "Hakkede tomater på dåse", en: "Canned chopped tomatoes" },
      { da: "Knuste tomater på dåse", en: "Canned crushed tomatoes" },
      { da: "Passata — jævnere, uden stykker", en: "Passata — a smoother, chunk-free alternative" },
    ],
    emoji: "🍅",
    flavorAndRole: {
      da: "Syrlig og rund i smagen med en naturlig sødme, der bliver mere koncentreret, jo længere den simrer. Fordi tomaterne er dåsekonserverede på toppunktet af sæsonen, giver de en mere pålidelig smag året rundt end friske tomater uden for sæson. De danner både den flydende base og den syrlige modvægt i alt fra pastasauce til karry.",
      en: "Tangy and rounded, with a natural sweetness that concentrates the longer it simmers. Because the tomatoes are canned at peak ripeness, they give a more reliable flavor year-round than out-of-season fresh tomatoes. They form both the liquid base and the tangy counterweight in everything from pasta sauce to curry.",
    },
    nutrition: {
      per: { da: "Pr. 100 g, med saft", en: "Per 100 g, with juice" },
      calories: 18,
      proteinG: 0.9,
      carbsG: 3.9,
      fatG: 0.2,
      fiberG: 1,
    },
    whereToBuy: [
      { da: "Dåsevarehylden i alle supermarkeder", en: "The canned goods aisle of every supermarket" },
    ],
  },
  {
    id: "likemeat-chicken-bites",
    name: { da: "LikeMeat Chicken Bites", en: "LikeMeat Chicken Bites" },
    otherNames: [
      { da: "Like Chicken Bites — Like Meats officielle varenavn", en: "Like Chicken Bites — Like Meat's official product name" },
      { da: "Kyllingestykker af soja (kødalternativ)", en: "Soy-based chicken-style pieces (meat alternative)" },
    ],
    emoji: "🍗",
    flavorAndRole: {
      da: "Et sojabaseret kødalternativ formet som små, bidstore stykker med en fiberet, let sej konsistens, der minder om stegte kyllingestykker. Smagen i sig selv er ret neutral, så stykkerne trækker godt smag fra en marinade — som i denne opskrift, hvor de trækker natten over i tandoori-krydret yoghurt, før de simrer med i saucen. Bruges til at give en ret bid og protein, hvor en kødret traditionelt ville have kylling. Indeholder soja.",
      en: "A soy-based meat alternative shaped into small, bite-sized pieces with a fibrous, slightly chewy texture reminiscent of pan-fried chicken. The pieces themselves taste fairly neutral, so they take on a marinade well — as in this recipe, where they sit overnight in tandoori-spiced yogurt before simmering into the sauce. Used to add bite and protein where a meat-based version of a dish would use chicken. Contains soy.",
    },
    nutrition: {
      per: { da: "Pr. 100 g (producentens varedeklaration)", en: "Per 100 g (manufacturer's declaration)" },
      calories: 103,
      proteinG: 19,
      carbsG: 0,
      fatG: 1.8,
      fiberG: 6.5,
      note: {
        da: "Kilde: Green List-produktdatabasen (greenlist.dk) — tjek altid emballagen, da producenter opdaterer opskrifter.",
        en: "Source: the Green List product database (greenlist.dk) — always check the pack, since manufacturers do update recipes.",
      },
    },
    whereToBuy: [
      {
        da: "Ikke en fast hylde i de fleste supermarkeder — tjek køleafdelingen for kødalternativer",
        en: "Not a given at most supermarkets — check the chilled meat-alternative aisle",
      },
      { da: "Bilka", en: "Bilka" },
      { da: "Føtex", en: "Føtex" },
    ],
  },
  {
    id: "naturli-vegan-butter",
    name: { da: "Naturli' Smørbar", en: "Naturli' vegan butter" },
    otherNames: [
      { da: "Block (Smørbar) — officielt produktnavn", en: "Block (Smørbar) — official product name" },
      { da: "Vegansk smørerstatning", en: "Vegan butter alternative" },
    ],
    emoji: "🧈",
    flavorAndRole: {
      da: "Fast og smørbar ved køleskabstemperatur, lavet af sheaolie, kokosolie og rapsolie i stedet for mælkefedt — den smelter og opfører sig i gryden nogenlunde som rigtigt smør. Bruges 1:1 i stedet for smør til at give en sauce en rund, fyldig eftersmag, som i denne opskrift, hvor den røres i mod slutningen for at give saucen dens silkede konsistens. Indeholder mandelsmør blandt olierne — værd at vide, hvis nøddeallergi er relevant i din husstand.",
      en: "Firm and spreadable at fridge temperature, made from shea, coconut, and rapeseed oils instead of milkfat — it melts and behaves in a pot much like real butter. Used 1:1 in place of butter to give a sauce a round, rich finish, as in this recipe, where it's stirred in near the end for the sauce's silky texture. Contains almond butter among its oils — worth knowing if tree-nut allergies matter in your kitchen.",
    },
    whereToBuy: [
      { da: "Køledisken i de fleste større supermarkeder", en: "The chilled aisle of most larger supermarkets" },
      { da: "Nemlig", en: "Nemlig" },
      { da: "Netto", en: "Netto" },
      { da: "Føtex", en: "Føtex" },
      { da: "Bilka", en: "Bilka" },
    ],
  },
];

export function getIngredientProfile(id: string): IngredientProfile | undefined {
  return ingredientProfiles.find((ingredient) => ingredient.id === id);
}
