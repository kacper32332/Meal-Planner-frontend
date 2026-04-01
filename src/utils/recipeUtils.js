export const getCountryFlag = (nationality) => {
	if (!nationality) return "🌍"; // Default fallback

	const countryFlags = {
		// Match the exact cuisine types from the AI categorization script
		italian: "🇮🇹",
		mexican: "🇲🇽",
		asian: "🥢",
		american: "🇺🇸",
		mediterranean: "🌊",
		indian: "🇮🇳",
		thai: "🇹🇭",
		chinese: "🇨🇳",
		french: "🇫🇷",
		greek: "🇬🇷",
		"middle eastern": "🕌",
		japanese: "🇯🇵",
		korean: "🇰🇷",
		spanish: "🇪🇸",
		british: "🇬🇧",
		german: "🇩🇪",
		other: "🌍",
	};

	const normalizedNationality = nationality.toLowerCase().trim();
	return countryFlags[normalizedNationality] || "🌍"; // Always return a flag
};

export const getDifficultyStars = (difficulty) => {
	const level = difficulty?.toLowerCase();
	switch (level) {
		case "easy":
		case "beginner":
		case "1":
			return "⭐";
		case "medium":
		case "intermediate":
		case "2":
			return "⭐⭐";
		case "hard":
		case "difficult":
		case "advanced":
		case "3":
			return "⭐⭐⭐";
		default:
			return "⭐";
	}
};

export const formatCookingTime = (time) => {
	if (!time) return null;

	if (typeof time === "string") {
		const lowerTime = time.toLowerCase();

		// Check for hour patterns first
		const hourMatch = lowerTime.match(
			/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/
		);
		if (hourMatch) {
			const hours = parseFloat(hourMatch[1]);
			if (hours >= 1) {
				return hours % 1 === 0 ? `${hours}h` : `${hours}h`;
			}
		}

		// Check for minute patterns
		const minuteMatch = lowerTime.match(/(\d+)\s*(?:minutes?|mins?|m)/);
		if (minuteMatch) {
			const minutes = parseInt(minuteMatch[1]);
			if (minutes >= 60) {
				const hours = Math.floor(minutes / 60);
				const remainingMins = minutes % 60;
				return remainingMins > 0
					? `${hours}h ${remainingMins}m`
					: `${hours}h`;
			}
			return `${minutes}m`;
		}

		// Check for combined format like "1h 30m" or "1 hour 30 minutes"
		const combinedMatch = lowerTime.match(
			/(\d+)\s*(?:hours?|hrs?|h)\s*(?:and\s*)?(\d+)\s*(?:minutes?|mins?|m)/
		);
		if (combinedMatch) {
			const hours = parseInt(combinedMatch[1]);
			const minutes = parseInt(combinedMatch[2]);
			return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
		}

		// Fallback: extract just numbers and assume minutes if under 10, hours if over
		const numberMatch = time.match(/\d+/);
		if (numberMatch) {
			const num = parseInt(numberMatch[0]);
			if (num >= 60) {
				const hours = Math.floor(num / 60);
				const remainingMins = num % 60;
				return remainingMins > 0
					? `${hours}h ${remainingMins}m`
					: `${hours}h`;
			}
			return `${num}m`;
		}
	}

	// Handle numeric values (assume minutes)
	if (typeof time === "number") {
		if (time >= 60) {
			const hours = Math.floor(time / 60);
			const remainingMins = time % 60;
			return remainingMins > 0
				? `${hours}h ${remainingMins}m`
				: `${hours}h`;
		}
		return `${time}m`;
	}

	return null;
};

export const getRecipeMetadata = (recipe) => {
	// Check multiple possible field names for nationality/cuisine
	const nationality =
		recipe.nationality || recipe.cuisine_type || recipe.cuisineType || null;
	const cookingTime = recipe.cooking_time || recipe.cookingTime || null;
	const difficulty = recipe.difficulty || null;

	return {
		nationality,
		cookingTime,
		difficulty,
	};
};

// Get missing ingredients from a recipe
export const getMissingIngredients = (recipe, storageIngredients) => {
	if (!recipe || !recipe.ingredients) return [];
	const recipeIngredients = recipe.ingredients.map((ing) =>
		ing.name.toLowerCase()
	);
	return recipeIngredients.filter(
		(ingredient) => !storageIngredients.includes(ingredient)
	);
};

export const filterRecipesByAllergens = (recipesList, userAllergens = []) => {
	if (!userAllergens.length) return recipesList;
	return recipesList.filter((recipe) => {
		const ingredientNames = (recipe.ingredients || []).map(
			(i) => i.name?.toLowerCase?.() || ""
		);
		const containsAllergens = (recipe.contains_allergens || []).map(
			(a) => a.name?.toLowerCase?.() || ""
		);
		return !userAllergens.some(
			(allergen) =>
				ingredientNames.some((ing) => ing.includes(allergen)) ||
				containsAllergens.some((ca) => ca.includes(allergen))
		);
	});
};
