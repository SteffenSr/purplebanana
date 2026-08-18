import type { Recipe } from "./types";

/**
 * Bundled starter recipes. This ships inside the static export so the app
 * has content on first load with zero network requests, then gets copied
 * into IndexedDB (see db.ts) so the user can edit/add recipes offline.
 *
 * All recipes are vegan — no meat, fish, dairy, eggs, or honey. See
 * AGENTS.md's "Adding or editing recipes" section before adding more.
 *
 * Every user-facing string is a `{ da, en }` pair — Danish is this app's
 * primary language, English the second. See docs/architecture.md's
 * "Localization" section and AGENTS.md before adding a recipe without both.
 */
export const seedRecipes: Recipe[] = [
  {
    id: "creamy-tomato-pasta",
    title: { da: "Cremet tomatpasta", en: "Creamy Tomato Pasta" },
    description: {
      da: "En hverdagspasta med en rig, mælkefri tomatsauce.",
      en: "A weeknight pasta with a rich, dairy-free tomato sauce.",
    },
    emoji: "🍝",
    tags: ["dinner", "vegan", "pasta"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 20,
    ingredients: [
      { text: { da: "400 g pasta (rigatoni eller penne)", en: "400 g pasta (rigatoni or penne)" } },
      { text: { da: "2 spsk olivenolie", en: "2 tbsp olive oil" } },
      { text: { da: "1 lille løg, finthakket", en: "1 small onion, finely chopped" } },
      { text: { da: "3 fed hvidløg, finthakket", en: "3 cloves garlic, minced" } },
      { text: { da: "700 g knuste tomater", en: "700 g crushed tomatoes" } },
      { text: { da: "150 ml fed kokosmælk", en: "150 ml full-fat coconut milk" } },
      { text: { da: "3 spsk nutritional yeast (gærflager)", en: "3 tbsp nutritional yeast" } },
      { text: { da: "Salt og peber", en: "Salt and pepper" } },
      { text: { da: "Frisk basilikum, revet i stykker", en: "Fresh basil, torn" } },
    ],
    steps: [
      {
        order: 1,
        instruction: { da: "Bring en stor gryde saltet vand i kog.", en: "Bring a large pot of salted water to a boil." },
      },
      {
        order: 2,
        instruction: { da: "Tilsæt pastaen, og kog den, til den er al dente.", en: "Add the pasta and cook until al dente." },
        timerMinutes: 10,
      },
      {
        order: 3,
        instruction: {
          da: "Imens varmes olivenolien i en stor pande ved middel varme.",
          en: "Meanwhile, heat the olive oil in a large pan over medium heat.",
        },
      },
      {
        order: 4,
        instruction: { da: "Tilsæt løget, og steg det, til det er blødt.", en: "Add the onion and cook until soft." },
        timerMinutes: 5,
      },
      {
        order: 5,
        instruction: {
          da: "Tilsæt hvidløget, og steg det, til det dufter, ca. 30 sekunder.",
          en: "Add the garlic and cook until fragrant, about 30 seconds.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Hæld de knuste tomater i, smag til med salt og peber, og lad det simre.",
          en: "Pour in the crushed tomatoes, season with salt and pepper, and simmer.",
        },
        timerMinutes: 10,
      },
      {
        order: 7,
        instruction: {
          da: "Rør kokosmælk og nutritional yeast i, til saucen er jævn.",
          en: "Stir in the coconut milk and nutritional yeast until the sauce is smooth.",
        },
      },
      {
        order: 8,
        instruction: {
          da: "Hæld vandet fra pastaen, og vend den i saucen, til den er godt dækket.",
          en: "Drain the pasta and toss it into the sauce until fully coated.",
        },
      },
      {
        order: 9,
        instruction: {
          da: "Top med frisk basilikum, og server med det samme.",
          en: "Top with fresh basil and serve immediately.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:24:26.000Z",
  },
  {
    id: "morning-oat-porridge",
    title: { da: "Morgenhavregrød", en: "Morning Oat Porridge" },
    description: {
      da: "Varm, enkel og kan varieres i det uendelige.",
      en: "Warm, simple, and endlessly customizable.",
    },
    emoji: "🥣",
    tags: ["breakfast", "vegan", "quick"],
    servings: 2,
    prepMinutes: 2,
    cookMinutes: 8,
    ingredients: [
      { text: { da: "2½ dl havregryn", en: "1 cup rolled oats" } },
      {
        text: {
          da: "5 dl havremælk (eller anden plantemælk) eller vand",
          en: "2 cups oat milk (or other plant milk), or water",
        },
      },
      { text: { da: "Et nip salt", en: "Pinch of salt" } },
      { text: { da: "1 spsk ahornsirup", en: "1 tbsp maple syrup" } },
      { text: { da: "Topping: banan, bær, nødder", en: "Toppings: banana, berries, nuts" } },
    ],
    steps: [
      {
        order: 1,
        instruction: {
          da: "Kom havregryn, plantemælk og salt i en gryde ved middel varme.",
          en: "Combine the oats, plant milk, and salt in a saucepan over medium heat.",
        },
      },
      {
        order: 2,
        instruction: {
          da: "Kog under jævnlig omrøring, til grøden er tyknet.",
          en: "Cook, stirring occasionally, until thickened.",
        },
        timerMinutes: 8,
      },
      {
        order: 3,
        instruction: {
          da: "Tag gryden af varmen, og rør ahornsirup i.",
          en: "Remove from heat and stir in the maple syrup.",
        },
      },
      {
        order: 4,
        instruction: {
          da: "Fordel grøden i skåle, og tilføj din topping.",
          en: "Spoon into bowls and add your toppings.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:24:26.000Z",
  },
  {
    id: "red-lentil-dal",
    title: { da: "Rød linsedal", en: "Red Lentil Dal" },
    description: {
      da: "En hurtig hverdagsdal simret med gurkemeje, spidskommen og ingefær.",
      en: "A quick, everyday dal simmered with turmeric, cumin, and ginger.",
    },
    emoji: "🍛",
    tags: ["dinner", "vegan", "indian", "dal"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 25,
    ingredients: [
      { text: { da: "200 g røde linser, skyllet", en: "1 cup (200 g) red lentils, rinsed" } },
      { text: { da: "1 spsk kokosolie", en: "1 tbsp coconut oil" } },
      { text: { da: "1 tsk spidskommenfrø", en: "1 tsp cumin seeds" } },
      { text: { da: "1 løg, finthakket", en: "1 onion, finely chopped" } },
      { text: { da: "3 fed hvidløg, finthakket", en: "3 cloves garlic, minced" } },
      { text: { da: "1 spsk frisk ingefær, revet", en: "1 tbsp fresh ginger, grated" } },
      { text: { da: "1 tsk stødt gurkemeje", en: "1 tsp ground turmeric" } },
      { text: { da: "1 tsk stødt koriander", en: "1 tsp ground coriander" } },
      { text: { da: "400 g hakkede tomater på dåse", en: "400 g canned chopped tomatoes" } },
      { text: { da: "700 ml vand eller grøntsagsbouillon", en: "700 ml water or vegetable stock" } },
      { text: { da: "Salt, efter smag", en: "Salt, to taste" } },
      { text: { da: "Frisk koriander, hakket, til servering", en: "Fresh cilantro, chopped, to serve" } },
    ],
    steps: [
      {
        order: 1,
        instruction: {
          da: "Skyl linserne i koldt vand, til vandet løber klart.",
          en: "Rinse the lentils in cold water until it runs clear.",
        },
      },
      {
        order: 2,
        instruction: {
          da: "Varm kokosolien i en stor gryde ved middel varme.",
          en: "Heat the coconut oil in a large pot over medium heat.",
        },
      },
      {
        order: 3,
        instruction: {
          da: "Tilsæt spidskommenfrøene, og lad dem syde i 30 sekunder.",
          en: "Add the cumin seeds and let them sizzle for 30 seconds.",
        },
      },
      {
        order: 4,
        instruction: {
          da: "Tilsæt løget, og steg det, til det er blødt og gyldent.",
          en: "Add the onion and cook until soft and golden.",
        },
        timerMinutes: 5,
      },
      {
        order: 5,
        instruction: {
          da: "Rør hvidløg og ingefær i, og steg i 1 minut.",
          en: "Stir in the garlic and ginger and cook for 1 minute.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Tilsæt gurkemeje og koriander, og rør i 30 sekunder.",
          en: "Add the turmeric and coriander and stir for 30 seconds.",
        },
      },
      {
        order: 7,
        instruction: { da: "Tilsæt tomater og linser til gryden.", en: "Add the tomatoes and lentils to the pot." },
      },
      {
        order: 8,
        instruction: { da: "Hæld vandet i, og bring det i kog.", en: "Pour in the water and bring to a boil." },
      },
      {
        order: 9,
        instruction: {
          da: "Skru ned for varmen, og lad det simre, til linserne er møre.",
          en: "Reduce the heat and simmer until the lentils are soft.",
        },
        timerMinutes: 20,
      },
      {
        order: 10,
        instruction: {
          da: "Smag til med salt, og server toppet med frisk koriander.",
          en: "Season with salt and serve topped with fresh cilantro.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:24:26.000Z",
  },
  {
    id: "yellow-split-pea-dal-ginger",
    title: { da: "Gul ærtedal med ingefær", en: "Yellow Split Pea Dal with Ginger" },
    description: {
      da: "En varmende ærtedal, der får ekstra liv af rigeligt frisk ingefær.",
      en: "A warming split pea dal brightened with plenty of fresh ginger.",
    },
    emoji: "🫘",
    tags: ["dinner", "vegan", "indian", "dal"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 40,
    ingredients: [
      { text: { da: "200 g gule tørrede ærter, skyllet", en: "1 cup (200 g) yellow split peas, rinsed" } },
      { text: { da: "1 spsk kokosolie", en: "1 tbsp coconut oil" } },
      { text: { da: "1 tsk sorte sennepsfrø", en: "1 tsp black mustard seeds" } },
      { text: { da: "1 tsk spidskommenfrø", en: "1 tsp cumin seeds" } },
      { text: { da: "1 løg, finthakket", en: "1 onion, finely chopped" } },
      { text: { da: "2 spsk frisk ingefær, revet", en: "2 tbsp fresh ginger, grated" } },
      { text: { da: "3 fed hvidløg, finthakket", en: "3 cloves garlic, minced" } },
      { text: { da: "1 tsk stødt gurkemeje", en: "1 tsp ground turmeric" } },
      { text: { da: "1/2 tsk chilipulver (valgfrit)", en: "1/2 tsp chili powder (optional)" } },
      { text: { da: "950 ml vand eller grøntsagsbouillon", en: "950 ml water or vegetable stock" } },
      { text: { da: "Salt, efter smag", en: "Salt, to taste" } },
      { text: { da: "Saft af 1/2 citron", en: "Juice of 1/2 lemon" } },
    ],
    steps: [
      { order: 1, instruction: { da: "Skyl de gule ærter i koldt vand.", en: "Rinse the split peas in cold water." } },
      {
        order: 2,
        instruction: {
          da: "Varm kokosolien i en stor gryde ved middel varme.",
          en: "Heat the coconut oil in a large pot over medium heat.",
        },
      },
      {
        order: 3,
        instruction: {
          da: "Tilsæt sennepsfrø og spidskommenfrø, og steg, til de begynder at hoppe.",
          en: "Add the mustard seeds and cumin seeds and cook until they start to pop.",
        },
      },
      {
        order: 4,
        instruction: { da: "Tilsæt løget, og steg det, til det er blødt.", en: "Add the onion and cook until soft." },
        timerMinutes: 5,
      },
      {
        order: 5,
        instruction: {
          da: "Rør ingefær og hvidløg i, og steg i 1 minut.",
          en: "Stir in the ginger and garlic and cook for 1 minute.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Tilsæt gurkemeje og chilipulver, og rør kort.",
          en: "Add the turmeric and chili powder and stir briefly.",
        },
      },
      {
        order: 7,
        instruction: { da: "Tilsæt de gule ærter og vandet til gryden.", en: "Add the split peas and water to the pot." },
      },
      {
        order: 8,
        instruction: {
          da: "Bring det i kog, skru så ned for varmen, og læg låg på.",
          en: "Bring to a boil, then reduce the heat and cover.",
        },
      },
      {
        order: 9,
        instruction: {
          da: "Lad det simre, til ærterne er møre og cremede.",
          en: "Simmer until the split peas are soft and creamy.",
        },
        timerMinutes: 35,
      },
      {
        order: 10,
        instruction: {
          da: "Smag til med salt, og rør citronsaften i inden servering.",
          en: "Season with salt and stir in the lemon juice before serving.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:24:26.000Z",
  },
  {
    id: "coconut-spinach-dal",
    title: { da: "Kokos-spinatdal", en: "Coconut Spinach Dal" },
    description: {
      da: "Cremet kokosdal vendt med frisk spinat.",
      en: "Creamy coconut dal folded with fresh spinach.",
    },
    emoji: "🥥",
    tags: ["dinner", "vegan", "indian", "dal"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 25,
    ingredients: [
      { text: { da: "200 g røde linser, skyllet", en: "1 cup (200 g) red lentils, rinsed" } },
      { text: { da: "1 spsk kokosolie", en: "1 tbsp coconut oil" } },
      { text: { da: "1 tsk spidskommenfrø", en: "1 tsp cumin seeds" } },
      { text: { da: "1 løg, finthakket", en: "1 onion, finely chopped" } },
      { text: { da: "3 fed hvidløg, finthakket", en: "3 cloves garlic, minced" } },
      { text: { da: "1 spsk frisk ingefær, revet", en: "1 tbsp fresh ginger, grated" } },
      { text: { da: "1 tsk stødt gurkemeje", en: "1 tsp ground turmeric" } },
      { text: { da: "1 tsk garam masala", en: "1 tsp garam masala" } },
      { text: { da: "400 ml kokosmælk på dåse", en: "400 ml canned coconut milk" } },
      { text: { da: "475 ml vand", en: "475 ml water" } },
      { text: { da: "120 g frisk spinat, groft hakket", en: "4 cups (120 g) fresh spinach, roughly chopped" } },
      { text: { da: "Salt, efter smag", en: "Salt, to taste" } },
    ],
    steps: [
      {
        order: 1,
        instruction: {
          da: "Skyl linserne i koldt vand, til vandet løber klart.",
          en: "Rinse the lentils in cold water until it runs clear.",
        },
      },
      {
        order: 2,
        instruction: {
          da: "Varm kokosolien i en stor gryde ved middel varme.",
          en: "Heat the coconut oil in a large pot over medium heat.",
        },
      },
      {
        order: 3,
        instruction: {
          da: "Tilsæt spidskommenfrøene, og lad dem syde i 30 sekunder.",
          en: "Add the cumin seeds and let them sizzle for 30 seconds.",
        },
      },
      {
        order: 4,
        instruction: { da: "Tilsæt løget, og steg det, til det er blødt.", en: "Add the onion and cook until soft." },
        timerMinutes: 5,
      },
      {
        order: 5,
        instruction: {
          da: "Rør hvidløg og ingefær i, og steg i 1 minut.",
          en: "Stir in the garlic and ginger and cook for 1 minute.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Tilsæt gurkemeje og garam masala, og rør kort.",
          en: "Add the turmeric and garam masala and stir briefly.",
        },
      },
      {
        order: 7,
        instruction: {
          da: "Tilsæt linser, kokosmælk og vand til gryden.",
          en: "Add the lentils, coconut milk, and water to the pot.",
        },
      },
      {
        order: 8,
        instruction: {
          da: "Bring det i kog, skru så ned for varmen, og lad det simre, til linserne er møre.",
          en: "Bring to a boil, then reduce the heat and simmer until the lentils are soft.",
        },
        timerMinutes: 20,
      },
      {
        order: 9,
        instruction: {
          da: "Rør spinaten i, og lad den simre med, til den er faldet sammen.",
          en: "Stir in the spinach and cook until wilted.",
        },
      },
      { order: 10, instruction: { da: "Smag til med salt, og server.", en: "Season with salt and serve." } },
    ],
    updatedAt: "2026-08-18T14:24:26.000Z",
  },
  {
    id: "palak-tofu",
    title: { da: "Palak tofu", en: "Palak Tofu" },
    description: {
      da: "En vegansk udgave af palak paneer — gylden tofu simret i en krydret kokos-tomatsauce med spinat.",
      en: "A vegan take on palak paneer — golden tofu simmered in a spiced coconut-tomato spinach sauce.",
    },
    emoji: "🥬",
    imageUrl: "/images/recipes/palak-tofu.jpg",
    tags: ["dinner", "vegan", "indian"],
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 35,
    ingredients: [
      { text: { da: "400 g fast tofu, skåret i 1,5 cm tern", en: "400 g firm tofu, cut into 1.5 cm cubes" } },
      { text: { da: "2 spsk neutral olie, delt", en: "2 tbsp neutral oil, divided" } },
      { text: { da: "1 tsk spidskommenfrø", en: "1 tsp cumin seeds" } },
      { text: { da: "1 tsk stødt koriander", en: "1 tsp ground coriander" } },
      { text: { da: "1 tsk stødt gurkemeje", en: "1 tsp ground turmeric" } },
      { text: { da: "1 løg, finthakket", en: "1 onion, finely chopped" } },
      { text: { da: "3 fed hvidløg, finthakket", en: "3 cloves garlic, minced" } },
      { text: { da: "400 g hakkede tomater på dåse", en: "400 g canned chopped tomatoes" } },
      { text: { da: "400 ml kokosmælk på dåse", en: "400 ml canned coconut milk" } },
      {
        text: {
          da: "800 g frisk spinat (eller frossen, optøet og presset fri for vand)",
          en: "800 g fresh spinach (or frozen, thawed and squeezed dry)",
        },
      },
      { text: { da: "2 cm frisk ingefær, revet", en: "2 cm fresh ginger, grated" } },
      { text: { da: "Saft fra 1 lime", en: "Juice of 1 lime" } },
      { text: { da: "Salt, efter smag", en: "Salt, to taste" } },
      { text: { da: "1/2 spsk ahornsirup eller agavesirup", en: "1/2 tbsp maple syrup or agave syrup" } },
    ],
    steps: [
      {
        order: 1,
        instruction: {
          da: "Varm 1 spsk af olien i en stor pande ved middel varme.",
          en: "Heat 1 tbsp of the oil in a large pan over medium heat.",
        },
      },
      {
        order: 2,
        instruction: {
          da: "Tilsæt spidskommenfrøene, og lad dem syde i 30 sekunder.",
          en: "Add the cumin seeds and let them sizzle for 30 seconds.",
        },
      },
      {
        order: 3,
        instruction: {
          da: "Rør stødt koriander og gurkemeje i, og steg i 30 sekunder.",
          en: "Stir in the ground coriander and turmeric and cook for 30 seconds.",
        },
      },
      {
        order: 4,
        instruction: {
          da: "Tilsæt tofuen, og steg den, til den er gylden på de fleste sider, og vend den undervejs.",
          en: "Add the tofu and cook until golden on most sides, turning occasionally.",
        },
        timerMinutes: 8,
      },
      {
        order: 5,
        instruction: {
          da: "Tag tofuen ud af panden, og sæt den til side.",
          en: "Remove the tofu from the pan and set aside.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Varm den resterende olie i samme pande ved middel varme.",
          en: "Heat the remaining oil in the same pan over medium heat.",
        },
      },
      {
        order: 7,
        instruction: { da: "Tilsæt løget, og steg det, til det er blødt.", en: "Add the onion and cook until soft." },
        timerMinutes: 5,
      },
      {
        order: 8,
        instruction: {
          da: "Rør hvidløget i, og steg i 1 minut.",
          en: "Stir in the garlic and cook for 1 minute.",
        },
      },
      {
        order: 9,
        instruction: {
          da: "Tilsæt tomater og kokosmælk, og bring det i kog.",
          en: "Add the tomatoes and coconut milk and bring to a simmer.",
        },
      },
      {
        order: 10,
        instruction: {
          da: "Lad det simre, til saucen er let tyknet.",
          en: "Simmer until slightly thickened.",
        },
        timerMinutes: 10,
      },
      {
        order: 11,
        instruction: {
          da: "Tilsæt spinaten lidt ad gangen, og rør, til den falder sammen.",
          en: "Add the spinach in batches, stirring until wilted.",
        },
      },
      {
        order: 12,
        instruction: {
          da: "Læg tofuen tilbage i panden, og lad det simre ved svag varme.",
          en: "Return the tofu to the pan and simmer gently.",
        },
        timerMinutes: 5,
      },
      {
        order: 13,
        instruction: {
          da: "Rør ingefær, limesaft, salt og ahornsirup i, og server.",
          en: "Stir in the ginger, lime juice, salt, and maple syrup, then serve.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:30:00.000Z",
  },
  {
    id: "murgh-makhani",
    title: { da: "Murgh makhani (vegansk butter chicken)", en: "Murgh Makhani (Vegan Butter Chicken)" },
    description: {
      da: "Nok den mest populære indiske ret uden for Indien, gjort helt planebaseret — mild, cremet og perfekt som første indiske ret for nybegyndere.",
      en: "Probably the most popular Indian dish outside India, made fully plant-based — mild, creamy, and a great first Indian recipe for beginners.",
    },
    emoji: "🍲",
    tags: ["dinner", "vegan", "indian", "curry"],
    servings: 4,
    prepMinutes: 20,
    cookMinutes: 50,
    ingredients: [
      {
        text: {
          da: "2 pakker LikeMeat Chicken Bites, optøede",
          en: "2 packages LikeMeat Chicken Bites, thawed",
        },
      },
      { text: { da: "2 dl planteyoghurt", en: "3/4 cup plant yogurt" } },
      { text: { da: "1 spsk tandoori-krydderi", en: "1 tbsp tandoori spice blend" } },
      { text: { da: "1 spsk garam masala", en: "1 tbsp garam masala" } },
      { text: { da: "1 tsk stødt koriander", en: "1 tsp ground coriander" } },
      { text: { da: "1 tsk stødt spidskommen", en: "1 tsp ground cumin" } },
      { text: { da: "1 tsk stødt gurkemeje", en: "1 tsp ground turmeric" } },
      { text: { da: "Olie til stegning", en: "Oil, for frying" } },
      { text: { da: "1 stort løg, hakket", en: "1 large onion, chopped" } },
      { text: { da: "2 fed hvidløg, hakkede", en: "2 cloves garlic, minced" } },
      { text: { da: "3 spsk tomatpuré", en: "3 tbsp tomato paste" } },
      { text: { da: "400 g hakkede tomater på dåse", en: "400 g canned chopped tomatoes" } },
      { text: { da: "1 frisk chili, hakket", en: "1 fresh chili, chopped" } },
      { text: { da: "2 cm frisk ingefær, revet", en: "2 cm fresh ginger, grated" } },
      {
        text: {
          da: "1 spsk knuste bukkehornsblade (kasuri methi) — findes i asiatiske supermarkeder",
          en: "1 tbsp crushed dried fenugreek leaves (kasuri methi) — find them at an Asian grocery store",
        },
      },
      { text: { da: "3 spsk Naturli' Smørbar", en: "3 tbsp Naturli' vegan butter" } },
      { text: { da: "2 dl plantefløde", en: "3/4 cup plant-based cream" } },
      { text: { da: "Salt, efter smag", en: "Salt, to taste" } },
    ],
    steps: [
      {
        order: 1,
        instruction: {
          da: "Bland planteyoghurt og tandoori-krydderi i en skål.",
          en: "Mix the plant yogurt and tandoori spice blend in a bowl.",
        },
      },
      {
        order: 2,
        instruction: {
          da: "Vend Chicken Bites i marinaden, til de er godt dækket.",
          en: "Toss the Chicken Bites in the marinade until well coated.",
        },
      },
      {
        order: 3,
        instruction: {
          da: "Dæk skålen til, og sæt den i køleskabet for at marinere.",
          en: "Cover the bowl and refrigerate to marinate.",
        },
        timerMinutes: 60,
      },
      {
        order: 4,
        instruction: {
          da: "Rist garam masala, koriander, spidskommen og gurkemeje kort på en tør, varm pande, til de dufter.",
          en: "Toast the garam masala, coriander, cumin, and turmeric briefly in a dry, hot pan until fragrant.",
        },
      },
      {
        order: 5,
        instruction: {
          da: "Hæld de ristede krydderier i en skål, og sæt dem til side.",
          en: "Tip the toasted spices into a bowl and set aside.",
        },
      },
      {
        order: 6,
        instruction: {
          da: "Varm olie i en gryde ved middel varme.",
          en: "Heat oil in a pot over medium heat.",
        },
      },
      {
        order: 7,
        instruction: {
          da: "Tilsæt løget, og steg det, til det er blødt.",
          en: "Add the onion and cook until soft.",
        },
        timerMinutes: 5,
      },
      {
        order: 8,
        instruction: {
          da: "Rør hvidløg og tomatpuré i, og steg et par minutter.",
          en: "Stir in the garlic and tomato paste and cook for a couple of minutes.",
        },
      },
      {
        order: 9,
        instruction: {
          da: "Tilsæt de marinerede Chicken Bites sammen med al marinaden.",
          en: "Add the marinated Chicken Bites along with all the marinade.",
        },
      },
      {
        order: 10,
        instruction: {
          da: "Rør de ristede krydderier, de hakkede tomater, chili og ingefær i.",
          en: "Stir in the toasted spices, chopped tomatoes, chili, and ginger.",
        },
      },
      {
        order: 11,
        instruction: {
          da: "Bring det i kog, og skru derefter ned for varmen.",
          en: "Bring to a boil, then reduce the heat.",
        },
      },
      {
        order: 12,
        instruction: {
          da: "Rør bukkehornsbladene og Naturli' Smørbar i, til smørret er smeltet.",
          en: "Stir in the fenugreek leaves and Naturli' butter until melted.",
        },
      },
      {
        order: 13,
        instruction: {
          da: "Lad retten simre ved svag varme.",
          en: "Let the dish simmer over low heat.",
        },
        timerMinutes: 30,
      },
      {
        order: 14,
        instruction: {
          da: "Rør plantefløden i, og smag til med salt, lige inden servering.",
          en: "Stir in the plant cream and season with salt just before serving.",
        },
      },
      {
        order: 15,
        instruction: {
          da: "Server med ris, naan og chutney.",
          en: "Serve with rice, naan, and chutney.",
        },
      },
    ],
    updatedAt: "2026-08-18T14:35:00.000Z",
  },
];
