import type { Locale } from "./locale";

export interface Dictionary {
  appName: string;
  online: string;
  offline: string;
  home: {
    heading: string;
    subheading: string;
    loading: string;
    error: (message: string) => string;
    empty: string;
  };
  recipeCard: {
    minutes: (n: number) => string;
    servings: (n: number) => string;
    addFavorite: string;
    removeFavorite: string;
  };
  recipeDetail: {
    loading: string;
    notFound: string;
    backToRecipes: string;
    prep: (n: number) => string;
    cook: (n: number) => string;
    serves: (n: number) => string;
    lastCooked: (date: string) => string;
    startCooking: string;
    ingredients: string;
    steps: string;
  };
  cookMode: {
    loading: string;
    noSteps: string;
    back: string;
    exitCookMode: string;
    step: (n: number) => string;
    startTimer: (minutes: number) => string;
    cancelTimer: string;
    timerDone: string;
    next: string;
    finish: string;
    enjoy: (title: string) => string;
    backToRecipe: string;
    otherStepClock: (n: number, clock: string) => string;
    otherStepDone: (n: number) => string;
  };
  timerAlarm: {
    done: (label: string) => string;
    more: (n: number) => string;
    dismiss: string;
  };
  notes: {
    stepTitle: (n: number) => string;
    ingredientTitle: (name: string) => string;
    amountLabel: string;
    amountPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    save: string;
    cancel: string;
    addNote: string;
    ingredientInfo: string;
  };
  languageSwitcher: {
    label: string;
  };
  ingredientDetail: {
    notFound: string;
    back: string;
    otherNames: string;
    flavorAndRole: string;
    nutrition: string;
    calories: (n: number) => string;
    protein: (n: number) => string;
    carbs: (n: number) => string;
    fat: (n: number) => string;
    fiber: (n: number) => string;
    whereToBuy: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  da: {
    appName: "Køkkenopskrifter",
    online: "Online",
    offline: "Offline-tilstand",
    home: {
      heading: "Hvad skal vi lave mad?",
      subheading:
        "Alle opskrifter herunder er gemt på denne enhed, så appen bliver ved med at virke selv uden forbindelse.",
      loading: "Henter dine opskrifter…",
      error: (message) => `Kunne ikke hente opskrifter: ${message}`,
      empty: "Ingen opskrifter endnu.",
    },
    recipeCard: {
      minutes: (n) => `⏱ ${n} min.`,
      servings: (n) => `🍽 ${n} portioner`,
      addFavorite: "Føj til favoritter",
      removeFavorite: "Fjern fra favoritter",
    },
    recipeDetail: {
      loading: "Henter opskrift…",
      notFound: "Opskriften findes ikke på denne enhed.",
      backToRecipes: "← Tilbage til opskrifter",
      prep: (n) => `⏱ Forberedelse ${n} min.`,
      cook: (n) => `🔥 Tilberedning ${n} min.`,
      serves: (n) => `🍽 ${n} portioner`,
      lastCooked: (date) => `Sidst lavet ${date}`,
      startCooking: "▶ Start madlavning",
      ingredients: "Ingredienser",
      steps: "Trin",
    },
    cookMode: {
      loading: "Henter opskrift…",
      noSteps: "Denne opskrift har ingen trin at følge.",
      back: "← Tilbage",
      exitCookMode: "Afslut kokketilstand",
      step: (n) => `Trin ${n}`,
      startTimer: (minutes) => `⏲ Start ${minutes} min. timer`,
      cancelTimer: "Annullér timer",
      timerDone: "⏰ Færdig — tryk for at afvise",
      next: "Næste →",
      finish: "Færdig 🎉",
      enjoy: (title) => `Nyd din ${title}!`,
      backToRecipe: "Tilbage til opskrift",
      otherStepClock: (n, clock) => `Trin ${n} · ${clock}`,
      otherStepDone: (n) => `Trin ${n} · Færdig ⏰`,
    },
    timerAlarm: {
      done: (label) => `Timer færdig — ${label}`,
      more: (n) => ` (+${n} mere)`,
      dismiss: "Afvis",
    },
    notes: {
      stepTitle: (n) => `Note til trin ${n}`,
      ingredientTitle: (name) => `Note til ${name}`,
      amountLabel: "Din mængde",
      amountPlaceholder: "f.eks. 2 tsk",
      noteLabel: "Din note",
      notePlaceholder: "Hvad vil du huske til næste gang?",
      save: "Gem",
      cancel: "Annullér",
      addNote: "+ Tilføj note",
      ingredientInfo: "Ingrediensinformation",
    },
    languageSwitcher: {
      label: "Sprog",
    },
    ingredientDetail: {
      notFound: "Ingrediensen findes ikke.",
      back: "Tilbage",
      otherNames: "Andre navne",
      flavorAndRole: "Smag, konsistens og rolle i retten",
      nutrition: "Næringsindhold",
      calories: (n) => `${n} kcal`,
      protein: (n) => `${n} g protein`,
      carbs: (n) => `${n} g kulhydrat`,
      fat: (n) => `${n} g fedt`,
      fiber: (n) => `${n} g kostfibre`,
      whereToBuy: "Hvor du kan købe det",
    },
  },
  en: {
    appName: "Kitchen Recipes",
    online: "Online",
    offline: "Offline mode",
    home: {
      heading: "What are we cooking?",
      subheading:
        "Every recipe below is saved on this device, so the app keeps working even without a signal.",
      loading: "Loading your recipe box…",
      error: (message) => `Couldn't load recipes: ${message}`,
      empty: "No recipes yet.",
    },
    recipeCard: {
      minutes: (n) => `⏱ ${n} min`,
      servings: (n) => `🍽 ${n} servings`,
      addFavorite: "Add to favorites",
      removeFavorite: "Remove from favorites",
    },
    recipeDetail: {
      loading: "Loading recipe…",
      notFound: "Recipe not found on this device.",
      backToRecipes: "← Back to recipes",
      prep: (n) => `⏱ Prep ${n} min`,
      cook: (n) => `🔥 Cook ${n} min`,
      serves: (n) => `🍽 Serves ${n}`,
      lastCooked: (date) => `Last cooked ${date}`,
      startCooking: "▶ Start Cooking",
      ingredients: "Ingredients",
      steps: "Steps",
    },
    cookMode: {
      loading: "Loading recipe…",
      noSteps: "This recipe has no steps to cook.",
      back: "← Back",
      exitCookMode: "Exit cook mode",
      step: (n) => `Step ${n}`,
      startTimer: (minutes) => `⏲ Start ${minutes} min timer`,
      cancelTimer: "Cancel timer",
      timerDone: "⏰ Done — tap to dismiss",
      next: "Next →",
      finish: "Finish 🎉",
      enjoy: (title) => `Enjoy your ${title}!`,
      backToRecipe: "Back to recipe",
      otherStepClock: (n, clock) => `Step ${n} · ${clock}`,
      otherStepDone: (n) => `Step ${n} · Done ⏰`,
    },
    timerAlarm: {
      done: (label) => `Timer done — ${label}`,
      more: (n) => ` (+${n} more)`,
      dismiss: "Dismiss",
    },
    notes: {
      stepTitle: (n) => `Note for step ${n}`,
      ingredientTitle: (name) => `Note for ${name}`,
      amountLabel: "Your amount",
      amountPlaceholder: "e.g. 2 tsp",
      noteLabel: "Your note",
      notePlaceholder: "What do you want to remember for next time?",
      save: "Save",
      cancel: "Cancel",
      addNote: "+ Add note",
      ingredientInfo: "Ingredient information",
    },
    languageSwitcher: {
      label: "Language",
    },
    ingredientDetail: {
      notFound: "This ingredient doesn't exist.",
      back: "Back",
      otherNames: "Other names",
      flavorAndRole: "Flavor, texture & role in a dish",
      nutrition: "Nutrition",
      calories: (n) => `${n} kcal`,
      protein: (n) => `${n} g protein`,
      carbs: (n) => `${n} g carbs`,
      fat: (n) => `${n} g fat`,
      fiber: (n) => `${n} g fiber`,
      whereToBuy: "Where to buy it",
    },
  },
};
