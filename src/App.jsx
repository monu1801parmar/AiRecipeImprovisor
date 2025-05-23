import React, { useState, useEffect } from "react";
import './App.css'

function App() {

  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [difficulty, setDifficulty] = useState("Any");
  const [mealType, setMealType] = useState("Any");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => {

    const savedApiKey = localStorage.getItem("openRouterApiKey");
    return savedApiKey || ""; 
  });


  useEffect(() => {
    localStorage.setItem("openRouterApiKey", openRouterApiKey);
  }, [openRouterApiKey]);

  
  async function generateRecipe() {
  
    if (!openRouterApiKey.trim()) {
      setError("Please enter your OpenRouter API Key.");
      return;
    }

  
    setLoading(true);
    setError(null);
    setRecipe("");


    let prompt = `Create a detailed recipe using these ingredients: ${ingredients}.`;

    if (cuisine !== "Any") {
      prompt += ` The cuisine should be ${cuisine}.`;
    }
    if (difficulty !== "Any") {
      prompt += ` The difficulty level should be ${difficulty}.`;
    }
    if (mealType !== "Any") {
      prompt += ` This recipe is for a ${mealType}.`;
    }

    prompt += ` Please include the following sections:
    1. Dish Name
    2. Description
    3. Prep Time
    4. Cook Time
    5. Servings
    6. Ingredients (with quantities)
    7. Instructions (step-by-step)
    8. Estimated Nutritional Information per serving (Calories, Protein, Carbs, Fat - provide approximate values).`;

    try {
    
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterApiKey}`, // Use the key from state
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

    
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to fetch recipe from AI. Please try again.";
        if (errorData.message) {
            errorMessage = errorData.message;
        } else if (response.status === 401) {
            errorMessage = "Invalid API Key. Please check your OpenRouter API Key.";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const generatedRecipe = data.choices[0].message.content;
      setRecipe(generatedRecipe); 
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">

      <div className="max-w-3xl w-full mx-auto p-5 bg-gray-50 rounded-xl shadow-lg flex flex-col box-border overflow-x-hidden">
        <h1 className="text-3xl font-bold text-center mb-5 text-gray-700">
          🍳 AI Recipe Improviser
        </h1>

        {/* Ingredients Input */}
        <div className="mb-5">
          <label htmlFor="ingredients" className="block text-gray-700 text-lg font-semibold mb-2">
            Ingredients (comma-separated):
          </label>
          <textarea
            id="ingredients"
            placeholder="e.g., tomato, basil, mozzarella"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[100px] text-base focus:outline-none focus:ring-2 focus:ring-green-500 box-border max-w-full" /* Added max-w-full */
          />
        </div>

        {/* Preference Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Cuisine Selector */}
          <div>
            <label htmlFor="cuisine" className="block text-gray-700 text-lg font-semibold mb-2">
              Cuisine:
            </label>
            <select
              id="cuisine"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 box-border max-w-full" /* Added max-w-full */
            >
              <option value="Any">Any</option>
              <option value="Italian">Italian</option>
              <option value="Indian">Indian</option>
              <option value="Mexican">Mexican</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Thai">Thai</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="American">American</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label htmlFor="difficulty" className="block text-gray-700 text-lg font-semibold mb-2">
              Difficulty:
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 box-border max-w-full" /* Added max-w-full */
            >
              <option value="Any">Any</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Meal Type Selector */}
          <div>
            <label htmlFor="mealType" className="block text-gray-700 text-lg font-semibold mb-2">
              Meal Type:
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 box-border max-w-full" /* Added max-w-full */
            >
              <option value="Any">Any</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
        </div>

        {/* OpenRouter API Key Input */}
        <div className="mb-5">
          <label htmlFor="apiKey" className="block text-gray-700 text-lg font-semibold mb-2">
            OpenRouter.ai API Key:
          </label>
          <input
            id="apiKey"
            type="password" // Use type="password" for sensitive input
            placeholder="Paste your OpenRouter.ai API Key here"
            value={openRouterApiKey}
            onChange={(e) => setOpenRouterApiKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 box-border max-w-full" /* Added max-w-full */
          />
          <p className="text-sm text-gray-500 mt-1">
            Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">openrouter.ai/keys</a>. It will be saved in your browser.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRecipe}
          disabled={loading || !ingredients.trim() || !openRouterApiKey.trim()}
          className="w-full py-3 px-0 border-none rounded-lg text-lg font-bold text-white bg-green-600 cursor-pointer transition-colors duration-300 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            "Generate Recipe"
          )}
        </button>

        {/* Error Message */}
        {error && (
          <p className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center font-bold">
            ⚠️ {error}
          </p>
        )}

        {/* Generated Recipe Display */}
        {recipe && (
          <div className="mt-8 p-5 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3 text-green-600 text-center">
              🍽️ Your Recipe:
            </h2>
            <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
              {recipe}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;