import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { getMissingIngredients } from "../utils/recipeUtils";

export function useShoppingList(addAlert) {
	const [shoppingList, setShoppingList] = useState([]);
	const [showShoppingList, setShowShoppingList] = useState(false);
	const [storageIngredients, setStorageIngredients] = useState([]);
	const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false);

	useEffect(() => {
		const fetchShoppingList = async () => {
			try {
				const response = await api.get("/api/shopping-list/");
				const ingredients = response.data.map((item) =>
					item.name.toLowerCase()
				);
				setStorageIngredients(ingredients);
			} catch (error) {
				console.error("Error fetching shopping list:", error);
			}
		};

		fetchShoppingList();
	}, []);

	const addMissingIngredientsToShoppingList = useCallback(
		async (recipe) => {
			setIsAddingToShoppingList(true);
			try {
				const missingIngredients = getMissingIngredients(
					recipe,
					storageIngredients
				);

				if (missingIngredients.length === 0) {
					addAlert("You have all ingredients for this recipe!");
					return;
				}

				// Add ingredients to shopping list, avoiding duplicates
				const newIngredients = missingIngredients.filter(
					(ingredient) =>
						!shoppingList.some(
							(item) => item.name.toLowerCase() === ingredient
						)
				);

				if (newIngredients.length === 0) {
					addAlert(
						"All missing ingredients are already in your shopping list!"
					);
					return;
				}

				const shoppingListItems = newIngredients.map((ingredient) => ({
					id: Date.now() + Math.random(),
					name: ingredient,
					recipe: recipe.name,
					completed: false,
				}));

				setShoppingList((prev) => [...prev, ...shoppingListItems]);
				addAlert(
					`Added ${newIngredients.length} ingredients to shopping list!`
				);
			} catch (error) {
				console.error("Error adding to shopping list:", error);
				addAlert("Failed to add ingredients to shopping list.");
			} finally {
				setIsAddingToShoppingList(false);
			}
		},
		[storageIngredients, shoppingList, addAlert]
	);

	const removeFromShoppingList = (itemId) => {
		setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
	};

	const toggleShoppingListItem = (itemId) => {
		setShoppingList((prev) =>
			prev.map((item) =>
				item.id === itemId
					? { ...item, completed: !item.completed }
					: item
			)
		);
	};

	const clearCompletedItems = () => {
		setShoppingList((prev) => prev.filter((item) => !item.completed));
	};

	const clearShoppingList = () => {
		setShoppingList([]);
	};

	return {
		shoppingList,
		showShoppingList,
		setShowShoppingList,
		storageIngredients,
		isAddingToShoppingList,
		addMissingIngredientsToShoppingList,
		removeFromShoppingList,
		toggleShoppingListItem,
		clearCompletedItems,
		clearShoppingList,
	};
}
