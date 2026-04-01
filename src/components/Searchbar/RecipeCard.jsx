import React from "react";
import SpotlightCard from "../SpotlightCard";
import { getMissingIngredients, getRecipeMetadata, getCountryFlag, formatCookingTime, getDifficultyStars } from "../../utils/recipeUtils";

function RecipeCard({ recipe, storageIngredients, onClickView, onAddToList, isAddingToList }) {
  const missingIngredients = getMissingIngredients(recipe, storageIngredients);
  const hasAllIngredients = missingIngredients.length === 0;
  const metadata = getRecipeMetadata(recipe);

  return (
    <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
      <div className="bg-gunmetal-300 border-2 border-office-green-500 rounded-lg p-4 h-90 flex flex-col hover:bg-emerald-500/10 transition-colors">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 
              className="text-lg font-bold text-spring-green-400 cursor-pointer hover:text-emerald-400 transition-colors flex-1 line-clamp-2 min-h-[3.5rem]"
              onClick={onClickView}
            >
              {recipe.name}
            </h3>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {hasAllIngredients ? (
                <span className="text-green-400 text-xs font-medium bg-green-500/20 px-2 py-1 rounded-full whitespace-nowrap">✓ Ready</span>
              ) : (
                <span className="text-orange-400 text-xs font-medium bg-orange-500/20 px-2 py-1 rounded-full whitespace-nowrap">{missingIngredients.length} missing</span>
              )}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 mb-3 text-sm flex-wrap min-h-[2rem]">
            {metadata.nationality && (
              <div className="flex items-center gap-1 bg-gunmetal-400/50 px-2 py-1 rounded-full cursor-help" title={`Cuisine: ${metadata.nationality}`}>
                <span className="text-lg">{getCountryFlag(metadata.nationality)}</span>
                <span className="text-gray-300 text-xs capitalize">{metadata.nationality}</span>
              </div>
            )}
            {metadata.cookingTime && (
              <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-full" title={`Cooking time: ${formatCookingTime(metadata.cookingTime)}`}>
                <span className="text-sm">🕐</span>
                <span className="text-blue-300 text-xs">{formatCookingTime(metadata.cookingTime)}</span>
              </div>
            )}
            {metadata.difficulty && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full cursor-help" title={`Difficulty: ${metadata.difficulty}`}>
                <span className="text-yellow-400">{getDifficultyStars(metadata.difficulty)}</span>
                <span className="text-yellow-300 text-xs capitalize">{metadata.difficulty}</span>
              </div>
            )}
          </div>
          
          {/* Ingredients Preview */}
          <p className="text-white mb-3 text-sm line-clamp-2 flex-shrink-0">
            <span className="font-medium">Ingredients:</span> {recipe.ingredients?.map((i) => i.name).join(", ") || "None listed"}
          </p>

          {/* Missing Ingredients Display */}
          <div className="flex-1 min-h-[4rem]">
            {!hasAllIngredients && missingIngredients.length > 0 && (
              <div className="p-2 bg-gunmetal-400/50 rounded-lg">
                <h4 className="text-orange-400 text-xs font-medium mb-1">Missing:</h4>
                <div className="flex items-center gap-1 overflow-hidden">
                  {missingIngredients.slice(0, 2).map((ing, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/30 whitespace-nowrap flex-shrink-0">{ing}</span>
                  ))}
                  {missingIngredients.length > 2 && (
                    <span className="text-gray-400 text-xs px-2 py-1 flex-shrink-0">+{missingIngredients.length - 2} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gunmetal-400/30">
          <button onClick={onClickView} className="flex-1 px-3 py-2 rounded-full border-2 border-spring-green-400 bg-gunmetal-400 text-spring-green-400 text-sm font-medium hover:bg-emerald-500 hover:text-white transition-all">
            View
          </button>
          {!hasAllIngredients && (
            <button onClick={onAddToList} disabled={isAddingToList} className="px-3 py-2 rounded-full border-2 border-blue-400 bg-gunmetal-400 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50">
              🛒
            </button>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

export default RecipeCard;