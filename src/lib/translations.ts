import type { Locale } from "./locale";
import type { ExperimentId } from "./experiments";

export interface Dictionary {
  appName: string;
  auth: {
    signInHeading: string;
    signInSubheading: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendLink: string;
    checkEmailHeading: string;
    checkEmailSubheading: string;
    signOut: string;
  };
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
    viewOnGreenlist: string;
  };
  experiments: {
    openLabel: string;
    hub: {
      heading: string;
      subheading: string;
    };
    items: Record<ExperimentId, { title: string; description: string }>;
    landing: {
      comingSoon: string;
      backToExperiments: string;
    };
    chatbot: {
      title: string;
      close: string;
      greeting: string;
      inputPlaceholder: string;
      send: string;
      thinking: string;
      error: string;
    };
  };
  settings: {
    heading: string;
    account: {
      heading: string;
      signedInAs: (email: string) => string;
      signOut: string;
    };
    tokens: {
      heading: string;
      subheading: string;
      labelPlaceholder: string;
      generate: string;
      revoke: string;
      newTokenNotice: string;
      empty: string;
      createdAt: (date: string) => string;
      neverUsed: string;
      lastUsed: (date: string) => string;
    };
    foodProfile: {
      heading: string;
      subheading: string;
      dietaryPreferences: string;
      dislikes: string;
      favoriteIngredients: string;
      goals: string;
      listPlaceholder: string;
      save: string;
    };
    household: {
      heading: string;
      subheading: string;
      namePlaceholder: string;
      likesPlaceholder: string;
      dislikesPlaceholder: string;
      add: string;
      remove: string;
    };
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  da: {
    appName: "Simmer",
    auth: {
      signInHeading: "Log ind på Simmer",
      signInSubheading: "Indtast din e-mail, så sender vi dig et login-link.",
      emailLabel: "E-mail",
      emailPlaceholder: "dig@eksempel.dk",
      sendLink: "Send login-link",
      checkEmailHeading: "Tjek din indbakke",
      checkEmailSubheading: "Vi har sendt et login-link til din e-mail. Linket udløber snart.",
      signOut: "Log ud",
    },
    home: {
      heading: "Hvad skal vi lave mad?",
      subheading: "Dine opskrifter, gemt i Simmer og tilgængelige fra enhver enhed.",
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
      viewOnGreenlist: "Se lignende produkter på Greenlist.dk",
    },
    experiments: {
      openLabel: "Eksperimenter",
      hub: {
        heading: "Eksperimenter",
        subheading:
          "Udviklerfunktion: genveje til appoplevelser under udvikling — endnu ikke rigtige funktioner.",
      },
      items: {
        onboarding: {
          title: "Onboarding",
          description: "Førstegangsoplevelsen for nye brugere.",
        },
        profile: {
          title: "Profil",
          description: "Profil- og kontoindstillinger.",
        },
        "habit-assistant": {
          title: "Vaneassistent",
          description: "En assistent der hjælper med at ændre madvaner.",
        },
        chatbot: {
          title: "Opskrifts-chatbot",
          description: "Gratis chatbot om opskrifter og ernæring.",
        },
      },
      landing: {
        comingSoon: "Denne funktion er ikke bygget endnu — dette er kun en landingsside til navigationstest.",
        backToExperiments: "← Tilbage til eksperimenter",
      },
      chatbot: {
        title: "Nomi",
        close: "Luk chat",
        greeting: "Hej, jeg er Nomi! Spørg mig om en opskrift, en ingrediens eller ernæring.",
        inputPlaceholder: "Skriv en besked til Nomi…",
        send: "Send",
        thinking: "Nomi tænker…",
        error: "Nomi kunne ikke svare lige nu. Prøv igen.",
      },
    },
    settings: {
      heading: "Indstillinger",
      account: {
        heading: "Konto",
        signedInAs: (email) => `Logget ind som ${email}`,
        signOut: "Log ud",
      },
      tokens: {
        heading: "Adgangstokens til MCP",
        subheading:
          "Et personligt token giver Claude, ChatGPT eller en anden MCP-klient adgang til dine Simmer-data. Indsæt det i klientens forbindelsesopsætning.",
        labelPlaceholder: "f.eks. \"Claude på min bærbare\"",
        generate: "Generér token",
        revoke: "Tilbagekald",
        newTokenNotice: "Kopiér tokenet nu — det vises kun denne ene gang.",
        empty: "Ingen tokens endnu.",
        createdAt: (date) => `Oprettet ${date}`,
        neverUsed: "Aldrig brugt",
        lastUsed: (date) => `Sidst brugt ${date}`,
      },
      foodProfile: {
        heading: "Madprofil",
        subheading: "Fortæl Simmer om dine madpræferencer, så en AI-assistent kan tage hensyn til dem.",
        dietaryPreferences: "Kostpræferencer",
        dislikes: "Kan ikke lide",
        favoriteIngredients: "Yndlingsingredienser",
        goals: "Mål",
        listPlaceholder: "Adskil med komma",
        save: "Gem",
      },
      household: {
        heading: "Husstand",
        subheading: "Tilføj medlemmer af din husstand og deres madpræferencer.",
        namePlaceholder: "Navn",
        likesPlaceholder: "Kan lide (adskil med komma)",
        dislikesPlaceholder: "Kan ikke lide (adskil med komma)",
        add: "Tilføj",
        remove: "Fjern",
      },
    },
  },
  en: {
    appName: "Simmer",
    auth: {
      signInHeading: "Sign in to Simmer",
      signInSubheading: "Enter your email and we'll send you a sign-in link.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      sendLink: "Send sign-in link",
      checkEmailHeading: "Check your inbox",
      checkEmailSubheading: "We've sent a sign-in link to your email. It expires soon.",
      signOut: "Sign out",
    },
    home: {
      heading: "What are we cooking?",
      subheading: "Your recipes, saved in Simmer and available from any device.",
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
      viewOnGreenlist: "See similar products on Greenlist.dk",
    },
    experiments: {
      openLabel: "Experiments",
      hub: {
        heading: "Experiments",
        subheading:
          "Developer feature: shortcuts to app experiences that are still being built — not real features yet.",
      },
      items: {
        onboarding: {
          title: "Onboarding",
          description: "The first-run experience for new users.",
        },
        profile: {
          title: "Profile",
          description: "Profile and account settings.",
        },
        "habit-assistant": {
          title: "Habit assistant",
          description: "An assistant that helps change cooking habits.",
        },
        chatbot: {
          title: "Recipe chatbot",
          description: "A free chatbot about recipes and nutrition.",
        },
      },
      landing: {
        comingSoon: "This feature isn't built yet — this is just a landing page for navigation testing.",
        backToExperiments: "← Back to experiments",
      },
      chatbot: {
        title: "Nomi",
        close: "Close chat",
        greeting: "Hi, I'm Nomi! Ask me about a recipe, an ingredient, or nutrition.",
        inputPlaceholder: "Message Nomi…",
        send: "Send",
        thinking: "Nomi is thinking…",
        error: "Nomi couldn't respond right now. Please try again.",
      },
    },
    settings: {
      heading: "Settings",
      account: {
        heading: "Account",
        signedInAs: (email) => `Signed in as ${email}`,
        signOut: "Sign out",
      },
      tokens: {
        heading: "MCP access tokens",
        subheading:
          "A personal access token lets Claude, ChatGPT, or another MCP client reach your Simmer data. Paste it into the client's connector setup.",
        labelPlaceholder: 'e.g. "Claude on my laptop"',
        generate: "Generate token",
        revoke: "Revoke",
        newTokenNotice: "Copy this token now — it's shown only this once.",
        empty: "No tokens yet.",
        createdAt: (date) => `Created ${date}`,
        neverUsed: "Never used",
        lastUsed: (date) => `Last used ${date}`,
      },
      foodProfile: {
        heading: "Food profile",
        subheading: "Tell Simmer about your food preferences so an AI assistant can take them into account.",
        dietaryPreferences: "Dietary preferences",
        dislikes: "Dislikes",
        favoriteIngredients: "Favorite ingredients",
        goals: "Goals",
        listPlaceholder: "Comma-separated",
        save: "Save",
      },
      household: {
        heading: "Household",
        subheading: "Add members of your household and their food preferences.",
        namePlaceholder: "Name",
        likesPlaceholder: "Likes (comma-separated)",
        dislikesPlaceholder: "Dislikes (comma-separated)",
        add: "Add",
        remove: "Remove",
      },
    },
  },
};
