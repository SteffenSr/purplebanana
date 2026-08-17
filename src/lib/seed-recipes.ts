import type { Recipe } from "./types";

/**
 * Bundled starter recipes. This ships inside the static export so the app
 * has content on first load with zero network requests, then gets copied
 * into IndexedDB (see db.ts) so the user can edit/add recipes offline.
 */
export const seedRecipes: Recipe[] = [
  {
    id: "creamy-tomato-pasta",
    title: "Creamy Tomato Pasta",
    description: "A weeknight pasta with a rich tomato-cream sauce.",
    emoji: "🍝",
    tags: ["dinner", "vegetarian", "pasta"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 20,
    ingredients: [
      { text: "400 g pasta (rigatoni or penne)" },
      { text: "2 tbsp olive oil" },
      { text: "1 small onion, finely chopped" },
      { text: "3 cloves garlic, minced" },
      { text: "700 g crushed tomatoes" },
      { text: "150 ml heavy cream" },
      { text: "50 g parmesan, grated" },
      { text: "Salt and pepper" },
      { text: "Fresh basil, torn" },
    ],
    steps: [
      { order: 1, instruction: "Bring a large pot of salted water to a boil.", timerMinutes: undefined },
      { order: 2, instruction: "Add the pasta and cook until al dente.", timerMinutes: 10 },
      { order: 3, instruction: "Meanwhile, heat olive oil in a large pan over medium heat. Add onion and cook until soft." , timerMinutes: 5 },
      { order: 4, instruction: "Add garlic and cook until fragrant, about 30 seconds." },
      { order: 5, instruction: "Pour in the crushed tomatoes, season with salt and pepper, and simmer.", timerMinutes: 10 },
      { order: 6, instruction: "Stir in the cream and parmesan until the sauce is smooth." },
      { order: 7, instruction: "Drain the pasta and toss it into the sauce until fully coated." },
      { order: 8, instruction: "Top with fresh basil and extra parmesan. Serve immediately." },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "sheet-pan-chicken-veg",
    title: "Sheet-Pan Chicken & Vegetables",
    description: "One pan, minimal cleanup, big flavor.",
    emoji: "🍗",
    tags: ["dinner", "one-pan"],
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 35,
    ingredients: [
      { text: "6 chicken thighs, bone-in" },
      { text: "500 g baby potatoes, halved" },
      { text: "2 bell peppers, chunked" },
      { text: "1 red onion, wedged" },
      { text: "3 tbsp olive oil" },
      { text: "2 tsp smoked paprika" },
      { text: "1 tsp garlic powder" },
      { text: "Salt and pepper" },
    ],
    steps: [
      { order: 1, instruction: "Preheat the oven to 220°C (425°F)." },
      { order: 2, instruction: "Toss potatoes, peppers, and onion with half the oil, paprika, garlic powder, salt, and pepper on a sheet pan." },
      { order: 3, instruction: "Rub chicken thighs with the remaining oil and spices, then nestle them among the vegetables." },
      { order: 4, instruction: "Roast until chicken is golden and vegetables are tender, turning once.", timerMinutes: 35 },
      { order: 5, instruction: "Rest for 5 minutes, then serve straight from the pan.", timerMinutes: 5 },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "morning-oat-porridge",
    title: "Morning Oat Porridge",
    description: "Warm, simple, and endlessly customizable.",
    emoji: "🥣",
    tags: ["breakfast", "vegetarian", "quick"],
    servings: 2,
    prepMinutes: 2,
    cookMinutes: 8,
    ingredients: [
      { text: "1 cup rolled oats" },
      { text: "2 cups milk or water" },
      { text: "Pinch of salt" },
      { text: "1 tbsp honey or maple syrup" },
      { text: "Toppings: banana, berries, nuts" },
    ],
    steps: [
      { order: 1, instruction: "Combine oats, milk, and salt in a saucepan over medium heat." },
      { order: 2, instruction: "Cook, stirring occasionally, until thickened.", timerMinutes: 8 },
      { order: 3, instruction: "Remove from heat and stir in honey." },
      { order: 4, instruction: "Spoon into bowls and add your toppings." },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
