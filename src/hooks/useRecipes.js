import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { filterRecipesByAllergens } from "../utils/recipeUtils";
import { useNavigate } from "react-router-dom"; // Make sure to import this if you use navigate

export function useRecipes(addAlert) {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [recipeOffset, setRecipeOffset] = useState(0);
	const [recipeTotalCount, setRecipeTotalCount] = useState(0);
	const [recipeHasMore, setRecipeHasMore] = useState(false);
	const [isAddingMeal, setIsAddingMeal] = useState(false);
	const navigate = useNavigate();

	const handleSearch = async (
		e,
		selectedIngredients,
		useDietFilter,
		userDietaryPreference,
		userAllergens
	) => {
		setHasSearched(true);
		if (e) e.preventDefault();
		setRecipeOffset(0);

		if (selectedIngredients.length === 0) {
			addAlert("Please select at least one ingredient!");
			return;
		}

		setLoading(true);
		try {
			const requestBody = { ingredients: selectedIngredients };
			if (useDietFilter && userDietaryPreference) {
				requestBody.diet = userDietaryPreference;
			}

			const response = await api.post(
				`/api/recipe-search/?limit=50&offset=0`,
				requestBody
			);
			const data = response.data;
			const filtered = filterRecipesByAllergens(
				data.results,
				userAllergens
			);

			setRecipes(filtered);
			setRecipeTotalCount(data.total_count || filtered.length);
			setRecipeHasMore(data.has_more || false);
			setRecipeOffset(50);

			if (data.results.length > 0 && filtered.length === 0) {
				addAlert(
					"All found recipes contained your allergens and were filtered out."
				);
			}
		} catch (error) {
			console.error("Error fetching recipes:", error);
			addAlert("Failed to fetch recipes. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const loadMoreRecipes = async (
		selectedIngredients,
		useDietFilter,
		userDietaryPreference,
		userAllergens
	) => {
		setLoading(true);
		try {
			const requestBody = { ingredients: selectedIngredients };
			if (useDietFilter && userDietaryPreference) {
				requestBody.diet = userDietaryPreference;
			}

			const response = await api.post(
				`/api/recipe-search/?limit=50&offset=${recipeOffset}`,
				requestBody
			);
			const data = response.data;
			const filtered = filterRecipesByAllergens(
				data.results,
				userAllergens
			);

			setRecipes((prev) => [...prev, ...filtered]);
			setRecipeTotalCount(
				data.total_count || recipes.length + filtered.length
			);
			setRecipeHasMore(data.has_more || false);
			setRecipeOffset((prev) => prev + 50);
		} catch (error) {
			console.error("Error loading more recipes:", error);
			addAlert("Failed to load more recipes.");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveRecipe = async (selectedRecipe) => {
		setIsAddingMeal(true);
		try {
			const token = localStorage.getItem(ACCESS_TOKEN);
			if (!token) {
				navigate("/login");
				return;
			}

			const response = await api.post(
				"/api/meals/",
				{
					recipe_id: selectedRecipe.id,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.status === 201) {
				addAlert(
					"Recipe saved to My Meals! Check the Calendar sidebar to schedule it."
				);
			}
		} catch (error) {
			if (error.response?.status === 401) {
				localStorage.removeItem(ACCESS_TOKEN);
				navigate("/login");
			} else {
				console.error("Error saving recipe:", error);
				addAlert("Failed to save recipe");
			}
		} finally {
			setIsAddingMeal(false);
		}
	};

	return {
		recipes,
		loading,
		hasSearched,
		recipeHasMore,
		isAddingMeal,
		handleSearch,
		loadMoreRecipes,
		handleSaveRecipe,
	};
}
