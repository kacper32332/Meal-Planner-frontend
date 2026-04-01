import React from "react";
import SpotlightCard from "../SpotlightCard";
import {
  getRecipeMetadata,
  getCountryFlag,
  formatCookingTime,
  getDifficultyStars,
  getMissingIngredients,
} from "../../utils/recipeUtils";

function RecipeDetailsModal({
  recipe,
  storageIngredients,
  onClose,
  onSave,
  isAddingMeal,
  onAddToList,
  isAddingToList,
}) {
  const metadata = getRecipeMetadata(recipe);
  const missingIngredients = getMissingIngredients(recipe, storageIngredients);
  const hasAllIngredients = missingIngredients.length === 0;

  return (
    <div
      className="fixed inset-0 bg-gunmetal-500/80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <SpotlightCard>
        <div
          className="bg-gunmetal-300 rounded-lg shadow-xl p-6 max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Metadata */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-spring-green-400 mb-3">
                {recipe.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {metadata.nationality && (
                  <div
                    className="flex items-center gap-2 bg-gunmetal-400/50 px-3 py-2 rounded-full cursor-help hover:bg-gunmetal-400/70 transition-colors"
                    title={`Cuisine: ${metadata.nationality}`}
                  >
                    <span className="text-xl">{getCountryFlag(metadata.nationality)}</span>
                    <span className="text-gray-300 text-sm capitalize font-medium">{metadata.nationality}</span>
                  </div>
                )}
                {metadata.cookingTime && (
                  <div
                    className="flex items-center gap-2 bg-blue-500/20 px-3 py-2 rounded-full"
                    title={`Cooking time: ${formatCookingTime(metadata.cookingTime)}`}
                  >
                    <span className="text-lg">🕐</span>
                    <span className="text-blue-300 text-sm font-medium">{formatCookingTime(metadata.cookingTime)}</span>
                  </div>
                )}
                {metadata.difficulty && (
                  <div
                    className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-full cursor-help hover:bg-yellow-500/30 transition-colors"
                    title={`Difficulty Level: ${metadata.difficulty}`}
                  >
                    <span className="text-yellow-400 text-lg">{getDifficultyStars(metadata.difficulty)}</span>
                    <span className="text-yellow-300 text-sm capitalize font-medium">{metadata.difficulty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Ingredients List */}
            <div className="bg-gunmetal-400/50 rounded-lg p-4">
              <h3 className="text-spring-green-400 font-medium mb-2">Ingredients</h3>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-office-green-500 scrollbar-track-gunmetal-400">
                <ul className="list-disc list-inside space-y-1">
                  {(() => {
                    try {
                      let ingredientsList = [];
                      if (recipe.description) {
                        const desc = recipe.description.trim();
                        if (desc.startsWith("[") && desc.includes('"')) {
                          const cleanedDesc = desc
                            .replace(/^\[/, "").replace(/\]$/, "")
                            .replace(/^"/, "").replace(/"$/, "")
                            .replace(/\\"/g, '"')
                            .replace(/", "/g, "|SPLIT|").replace(/","/g, "|SPLIT|")
                            .replace(/",$/, "").replace(/^"/, "");

                          ingredientsList = cleanedDesc
                            .split("|SPLIT|")
                            .map((ing) => ing.replace(/^"|"$/g, "").trim())
                            .filter((ing) => ing.length > 0 && ing !== '""');
                        }
                      }

                      if (ingredientsList.length === 0 && recipe.ingredients?.length > 0) {
                        ingredientsList = recipe.ingredients.map((ing) => {
                          if (typeof ing === "string") return ing;
                          return `${ing.quantity || ""} ${ing.name || ""} ${ing.preparation || ""}`.trim();
                        });
                      }

                      if (ingredientsList.length > 0) {
                        return ingredientsList.map((ing, idx) => (
                          <li key={idx} className="text-white">{ing}</li>
                        ));
                      }
                      return <li className="text-white">No ingredients available.</li>;
                    } catch (error) {
                      console.error("Error parsing ingredients:", error);
                      if (recipe.ingredients?.length > 0) {
                        return recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="text-white">
                            {typeof ing === "string" ? ing : ing.name || "Unknown ingredient"}
                          </li>
                        ));
                      }
                      return <li className="text-white">Unable to parse ingredients.</li>;
                    }
                  })()}
                </ul>
              </div>
            </div>

            {/* Instructions List */}
            <div className="bg-gunmetal-400/50 rounded-lg p-4">
              <h3 className="text-spring-green-400 font-medium mb-2">Instructions</h3>
              <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-office-green-500 scrollbar-track-gunmetal-400">
                {(() => {
                  try {
                    let directionsList = [];
                    if (recipe.directions) {
                      const dirs = recipe.directions.trim();
                      if (dirs.startsWith("[") && dirs.includes('"')) {
                        const cleanedDirs = dirs
                          .replace(/^\[/, "").replace(/\]$/, "")
                          .replace(/^"/, "").replace(/"$/, "")
                          .replace(/\\"/g, '"')
                          .replace(/", "/g, "|SPLIT|").replace(/","/g, "|SPLIT|")
                          .replace(/",$/, "").replace(/^"/, "");

                        directionsList = cleanedDirs
                          .split("|SPLIT|")
                          .map((dir) => dir.replace(/^"|"$/g, "").trim())
                          .filter((dir) => dir.length > 0 && dir !== '""');
                      }
                    }

                    if (directionsList.length === 0 && recipe.steps) {
                      if (typeof recipe.steps === "string") {
                        directionsList = recipe.steps
                          .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=\.)\s*\d+\.\s*/)
                          .filter((step) => step.trim().length > 10);
                      } else if (Array.isArray(recipe.steps)) {
                        directionsList = recipe.steps;
                      }
                    }

                    if (directionsList.length > 0) {
                      return (
                        <div className="space-y-3">
                          {directionsList.map((direction, idx) => (
                            <div key={idx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div className="text-white leading-relaxed">
                                {direction.replace(/^\d+\.\s*/, "").trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return <div className="text-white">No instructions available.</div>;
                  } catch (error) {
                    console.error("Error parsing directions:", error);
                    return <div className="text-white">Unable to parse instructions.</div>;
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Missing Ingredients Display */}
          <div className="mt-4 p-3 bg-gunmetal-400/30 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Missing Ingredients:</h4>
            {hasAllIngredients ? (
              <p className="text-green-400 text-sm">✓ You have all ingredients!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingIngredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between mt-6">
            <button
              onClick={onAddToList}
              disabled={isAddingToList || hasAllIngredients}
              className="px-4 py-2 rounded-full border-2 border-blue-400 bg-gunmetal-400 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              {isAddingToList ? "Adding..." : "Add to Shopping List"}
            </button>
            <button
              onClick={onSave}
              disabled={isAddingMeal}
              className="px-4 py-2 rounded-full border-2 border-office-green-500 bg-gunmetal-400 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-colors disabled:opacity-50"
            >
              {isAddingMeal ? "Saving..." : "Save Recipe"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border-2 border-office-green-500 bg-gunmetal-400 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

export default RecipeDetailsModal;