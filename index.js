
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function generateHealthyRecipe(
  dietType,
  calories,
  preferences,
  restrictions
) {
  const prompt = `You are a professional nutritionist and chef. Generate a detailed, healthy recipe with the following requirements:

Diet Type: ${dietType}
Target Calories: ${calories}
Preferences: ${preferences || "No specific preferences"}
Dietary Restrictions: ${restrictions || "No restrictions"}

Please provide the recipe in the following JSON format:
{
  "name": "Recipe Name",
  "servings": number,
  "prepTime": "minutes",
  "cookTime": "minutes",
  "totalCalories": number,
  "caloriesPerServing": number,
  "macronutrients": {
    "protein": "grams",
    "carbohydrates": "grams",
    "fats": "grams",
    "fiber": "grams"
  },
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "quantity",
      "unit": "g/ml/piece",
      "calories": number
    }
  ],
  "instructions": [
    "step 1",
    "step 2"
  ],
  "nutritionTips": [
    "tip 1",
    "tip 2"
  ],
  "healthBenefits": "description of health benefits"
}

Ensure the total calories matches the target approximately. Make it practical and delicious.`;

  console.log("\n🍳 Generating healthy recipe...\n");

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse recipe JSON from response");
  }

  const recipe = JSON.parse(jsonMatch[0]);
  return recipe;
}

function displayRecipe(recipe) {
  console.log("\n" + "=".repeat(60));
  console.log(`🍽️  ${recipe.name}`);
  console.log("=".repeat(60));

  console.log(
    `\n⏱️  Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime}`
  );
  console.log(`👥 Servings: ${recipe.servings}`);

  console.log("\n📊 NUTRITION INFORMATION:");
  console.log(`  Total Calories: ${recipe.totalCalories} kcal`);
  console.log(`  Per Serving: ${recipe.caloriesPerServing} kcal`);

  console.log("\n💪 MACRONUTRIENTS (per serving):");
  console.log(`  Protein: ${recipe.macronutrients.protein}`);
  console.log(`  Carbohydrates: ${recipe.macronutrients.carbohydrates}`);
  console.log(`  Fats: ${recipe.macronutrients.fats}`);
  console.log(`  Fiber: ${recipe.macronutrients.fiber}`);

  console.log("\n🥘 INGREDIENTS:");
  recipe.ingredients.forEach((ing) => {
    console.log(
      `  • ${ing.item}: ${ing.amount}${ing.unit} (${ing.calories} kcal)`
    );
  });

  console.log("\n👨‍🍳 INSTRUCTIONS:");
  recipe.instructions.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });

  console.log("\n💡 NUTRITION TIPS:");
  recipe.nutritionTips.forEach((tip) => {
    console.log(`  • ${tip}`);
  });

  console.log("\n❤️  HEALTH BENEFITS:");
  console.log(`  ${recipe.healthBenefits}`);

  console.log("\n" + "=".repeat(60) + "\n");
}

async function main() {
  console.log("🥗 HEALTHY RECIPE GENERATOR WITH CALORIES");
  console.log("=========================================\n");

  try {
    // Get user inputs
    const dietType = await question(
      "What type of diet? (Mediterranean, Keto, Vegan, Paleo, Low-carb, Balanced): "
    );
    const caloriesInput = await question(
      "Target calories per serving (e.g., 400): "
    );
    const calories = parseInt(caloriesInput) || 400;
    const preferences = await question(
      "Any food preferences? (e.g., seafood, spicy, comfort food): "
    );
    const restrictions = await question(
      "Any dietary restrictions? (e.g., gluten-free, no nuts): "
    );

    // Generate recipe
    const recipe = await generateHealthyRecipe(
      dietType || "Balanced",
      calories,
      preferences,
      restrictions
    );

    // Display recipe
    displayRecipe(recipe);

    // Generate follow-up recipes
    const generateMore = await question(
      "Would you like another recipe? (yes/no): "
    );
    if (
      generateMore.toLowerCase() === "yes" ||
      generateMore.toLowerCase() === "y"
    ) {
      rl.close();
      const