import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ACCESS_TOKEN } from "../constants"
import api from "../api"
import "react-datepicker/dist/react-datepicker.css"
import "../assets/layered-waves-haikei.svg"
import SpotlightCard from "./SpotlightCard"
import {
  getCountryFlag,
  getDifficultyStars,
  formatCookingTime,
  filterRecipesByAllergens,
  getRecipeMetadata,
  getMissingIngredients
} from "../utils/recipeUtils"
import { s } from "framer-motion/client"
import { useAlerts } from "../hooks/useAlerts"
import { useShoppingList } from "../hooks/useShoppingList"
import { useRecipes } from "../hooks/useRecipes"
import { useIngredients } from "../hooks/useIngredients"
import RecipeCard from "./Searchbar/RecipeCard"
import RecipeDetailsModal from "./Searchbar/RecipeDetailsModal"
import ShoppingListModal from "./Searchbar/ShoppingListModal"
import AllRecipesModal from "./Searchbar/AllRecipesModal";

function Searchbar() {
  // 1. Initialize Custom Hooks
  const { alerts, addAlert } = useAlerts();
  const {
    shoppingList, showShoppingList, setShowShoppingList, storageIngredients, 
    isAddingToShoppingList, addMissingIngredientsToShoppingList, 
    removeFromShoppingList, toggleShoppingListItem, clearCompletedItems, clearShoppingList
  } = useShoppingList(addAlert);

  const {
    searchInput, setSearchInput, selectedIngredients, setSelectedIngredients, 
    filteredIngredients, showNoIngredientsMessage, userAllergens, selectedAllergens, 
    useDietFilter, handleDietFilterToggle, isLoadingIngredients, dietFilterDebounce, 
    toggleIngredient, userDietaryPreference
  } = useIngredients();

  const {
    recipes, loading, hasSearched, recipeHasMore, isAddingMeal, 
    handleSearch, loadMoreRecipes, handleSaveRecipe
  } = useRecipes(addAlert);

  // 2. Local Component State (Just Modals)
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  // 3. Helper Functions that tie hooks together
  const handleStorageSearch = () => {
    if (storageIngredients.length === 0) {
      addAlert("You have no ingredients in storage!");
      return;
    }
    
    const safeStorageIngredients = storageIngredients.filter(ingredient => 
      !userAllergens.includes(ingredient.toLowerCase())
    );
    
    if (safeStorageIngredients.length === 0) {
      addAlert("All your storage ingredients are allergens!");
      return;
    }
    
    setSelectedIngredients(prev => [...new Set([...prev, ...safeStorageIngredients])]);
    setSearchInput("");
    addAlert(`Added ${safeStorageIngredients.length} ingredients from your storage!`);
  };

  const executeSearch = (e) => handleSearch(e, selectedIngredients, useDietFilter, userDietaryPreference, userAllergens);
  const executeLoadMore = () => loadMoreRecipes(selectedIngredients, useDietFilter, userDietaryPreference, userAllergens);
  const executeSaveRecipe = () => handleSaveRecipe(selectedRecipe);

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gunmetal-500/0">
      
      {/* ALERTS */}
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-warning fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${alert.visible ? "opacity-80" : "opacity-0"}`}>
          <span>{alert.message}</span>
        </div>
      ))}

      {/* SEARCH INPUT AREA */}
      <div className="flex items-center justify-center pt-10 gap-4 max-w-xl mx-auto">
        <button onClick={() => handleDietFilterToggle(!useDietFilter)} className={`px-4 py-2 rounded-full border-2 ${useDietFilter ? "bg-emerald-500 text-white" : "bg-gunmetal-400 text-office-green-500"}`}>
          {useDietFilter ? "✓ Filter by My Diet" : "Filter by My Diet"}
        </button>
        <form className="flex-1 relative flex items-center">
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="block w-full p-4 ps-5 rounded-full" placeholder="Search Ingredients..." />
          <button type="button" onClick={handleStorageSearch} className="ml-2 px-3 py-2 rounded-full absolute right-2">My Storage</button>
        </form>
      </div>

      {/* INGREDIENT GRID */}
      <div className="p-5 max-w-4xl mx-auto w-full min-h-[320px]">
        {isLoadingIngredients ? (
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        ) : (
          <motion.div layout className="grid grid-cols-5 gap-4 justify-items-center">
            <AnimatePresence mode="wait">
              {filteredIngredients.map((ing) => (
                <motion.div key={ing} layout onClick={() => toggleIngredient(ing)} className={`px-4 py-3 border-2 rounded-3xl cursor-pointer ${selectedIngredients.includes(ing) ? "bg-emerald-500" : "bg-gunmetal-400"}`}>
                  {ing}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-center mt-4 px-5 mb-6 max-w-md mx-auto gap-2">
        <button onClick={executeSearch} className="flex-1 px-6 py-3 rounded-full border-2 border-spring-green-400 font-bold">Search Recipes</button>
        <button onClick={() => setShowShoppingList(true)} className="px-4 py-3 rounded-full border-2 border-blue-400 font-bold relative">
          🛒 {shoppingList.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{shoppingList.length}</span>}
        </button>
      </div>

      {/* RECIPE RESULTS */}
      <div className="p-5 pb-100">
        {loading ? (
          <span className="loading loading-dots loading-xl flex justify-center mx-auto"></span>
        ) : recipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {recipes.slice(0, 3).map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  storageIngredients={storageIngredients}
                  onClickView={() => { setSelectedRecipe(recipe); setIsModalOpen(true); }}
                  onAddToList={() => addMissingIngredientsToShoppingList(recipe)}
                  isAddingToList={isAddingToShoppingList}
                />
              ))}
            </div>
            {recipes.length > 3 && (
              <div className="flex justify-center mt-6">
                <button onClick={() => setShowAllRecipes(true)} className="px-6 py-3 rounded-full border-2 font-bold">Show All Recipes</button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* MODALS */}
      {showShoppingList && (
        <ShoppingListModal 
          list={shoppingList} 
          onClose={() => setShowShoppingList(false)}
          onToggleItem={toggleShoppingListItem}
          onRemoveItem={removeFromShoppingList}
          onClearCompleted={clearCompletedItems}
          onClearAll={clearShoppingList}
        />
      )}

      {isModalOpen && selectedRecipe && (
        <RecipeDetailsModal 
          recipe={selectedRecipe}
          storageIngredients={storageIngredients}
          onClose={() => { setSelectedRecipe(null); setIsModalOpen(false); }}
          onSave={executeSaveRecipe}
          isAddingMeal={isAddingMeal}
          onAddToList={() => addMissingIngredientsToShoppingList(selectedRecipe)}
          isAddingToList={isAddingToShoppingList}
        />
      )}

      {showAllRecipes && (
        <AllRecipesModal 
          recipes={recipes}
          storageIngredients={storageIngredients}
          recipeHasMore={recipeHasMore}
          loading={loading}
          onClose={() => setShowAllRecipes(false)}
          onLoadMore={executeLoadMore}
          onOpenRecipe={(recipe) => { setShowAllRecipes(false); setSelectedRecipe(recipe); setIsModalOpen(true); }}
          onAddToList={addMissingIngredientsToShoppingList}
          isAddingToList={isAddingToShoppingList}
        />
      )}
    </div>
  );
}

export default Searchbar;