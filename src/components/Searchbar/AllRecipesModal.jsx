import React from "react";
import RecipeCard from "./RecipeCard";

function AllRecipesModal({
  recipes,
  storageIngredients,
  recipeHasMore,
  loading,
  onClose,
  onLoadMore,
  onOpenRecipe,
  onAddToList,
  isAddingToList
}) {
  return (
    <div
      className="fixed inset-0 bg-gunmetal-500/80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gunmetal-300 rounded-lg shadow-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-spring-green-400">
            All Recipes
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-spring-green-400 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* REUSING THE RECIPE CARD COMPONENT HERE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, idx) => (
            <RecipeCard
              key={recipe.id ? `${recipe.id}-${idx}` : idx}
              recipe={recipe}
              storageIngredients={storageIngredients}
              onClickView={() => onOpenRecipe(recipe)}
              onAddToList={() => onAddToList(recipe)}
              isAddingToList={isAddingToList}
            />
          ))}
        </div>

        {/* Load More Button */}
        {recipeHasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onLoadMore}
              className="px-6 py-3 rounded-full border-2 border-spring-green-400 bg-gunmetal-400 text-spring-green-400 font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Show 50 More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllRecipesModal;