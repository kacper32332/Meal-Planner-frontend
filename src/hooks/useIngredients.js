import { useState, useEffect } from "react";
import api from "../api";

const popularIngredients = [
	"salt",
	"pepper",
	"olive oil",
	"garlic",
	"onion",
	"butter",
	"flour",
	"eggs",
	"milk",
	"cheese",
	"tomato",
	"chicken",
	"beef",
	"rice",
	"pasta",
	"sugar",
	"lemon",
	"herbs",
	"potatoes",
	"carrots",
];

export function useIngredients() {
	const [searchInput, setSearchInput] = useState("");
	const [selectedIngredients, setSelectedIngredients] = useState([]);
	const [dynamicIngredients, setDynamicIngredients] = useState([]);
	const [filteredIngredients, setFilteredIngredients] = useState([]);
	const [showNoIngredientsMessage, setShowNoIngredientsMessage] =
		useState(false);
	const [userAllergens, setUserAllergens] = useState([]);
	const [selectedAllergens, setSelectedAllergens] = useState([]);
	const [allAvailableIngredients, setAllAvailableIngredients] = useState([]);
	const [userDietaryPreference, setUserDietaryPreference] = useState(null);
	const [useDietFilter, setUseDietFilter] = useState(false);
	const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
	const [dietFilterDebounce, setDietFilterDebounce] = useState(false);

	// Handle diet filter toggle with debounce
	const handleDietFilterToggle = (checked) => {
		setDietFilterDebounce(true);
		setUseDietFilter(checked);
		setTimeout(() => setDietFilterDebounce(false), 300);
	};

	// Fetch user allergens and dietary preference on mount
	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const res = await api.get("/api/user-profiles/");
				if (res.data && res.data.length > 0) {
					const userProfile = res.data[0];

					if (
						userProfile.allergies &&
						Array.isArray(userProfile.allergies)
					) {
						const allergyPromises = userProfile.allergies.map(
							async (allergyId) => {
								try {
									const allergyRes = await api.get(
										`/api/allergies/${allergyId}/`
									);
									return allergyRes.data.name.toLowerCase();
								} catch (err) {
									return null;
								}
							}
						);
						const allergenNames = (
							await Promise.all(allergyPromises)
						).filter((name) => name !== null);
						setUserAllergens(allergenNames);
					}

					if (userProfile.dietary_preference) {
						setUserDietaryPreference(
							userProfile.dietary_preference
						);
						setUseDietFilter(true);
					}
				}
			} catch (err) {
				// fail silently
			}
		};
		fetchUserProfile();
	}, []);

	// Fetch all available ingredients
	useEffect(() => {
		const fetchAllIngredients = async () => {
			try {
				const endpoint = useDietFilter
					? "/api/ingredient-all-data/?limit=1000"
					: "/api/ingredient-all-data-unfiltered/?limit=1000";

				const response = await api.get(endpoint);
				if (response.data && Array.isArray(response.data)) {
					setAllAvailableIngredients(
						response.data.map((item) => item.name)
					);
				}
			} catch (error) {
				console.error("Error fetching all ingredients:", error);
			}
		};
		fetchAllIngredients();
	}, [useDietFilter]);

	// Fetch ingredients from API when searchInput changes
	useEffect(() => {
		const fetchIngredients = async () => {
			setIsLoadingIngredients(true);
			try {
				if (searchInput.trim() === "") {
					let baseIngredients =
						useDietFilter && allAvailableIngredients.length > 0
							? [...allAvailableIngredients]
							: [...popularIngredients];

					const filtered = baseIngredients.filter(
						(ingredient) =>
							!userAllergens.includes(ingredient.toLowerCase())
					);

					const additionalCount = selectedAllergens.length;
					if (
						additionalCount > 0 &&
						allAvailableIngredients.length > 0
					) {
						const availableForReplacement =
							allAvailableIngredients.filter(
								(ingredient) =>
									!userAllergens.includes(
										ingredient.toLowerCase()
									) &&
									!filtered.includes(ingredient) &&
									!selectedIngredients.includes(ingredient)
							);
						const shuffled = availableForReplacement.sort(
							() => 0.5 - Math.random()
						);
						filtered.push(...shuffled.slice(0, additionalCount));
					}

					if (useDietFilter && filtered.length > 20) {
						setDynamicIngredients(
							filtered
								.sort(() => 0.5 - Math.random())
								.slice(0, 20)
						);
						return;
					}

					if (
						filtered.length < 20 &&
						allAvailableIngredients.length > 0
					) {
						const needed = 20 - filtered.length;
						const availableForFilling =
							allAvailableIngredients.filter(
								(ingredient) =>
									!userAllergens.includes(
										ingredient.toLowerCase()
									) &&
									!filtered.includes(ingredient) &&
									!selectedIngredients.includes(ingredient)
							);
						filtered.push(
							...availableForFilling
								.sort(() => 0.5 - Math.random())
								.slice(0, needed)
						);
					}

					setDynamicIngredients(filtered.slice(0, 20));
					return;
				}

				const endpoint = useDietFilter
					? `/api/ingredient-all-data/?search=${searchInput}&limit=50`
					: `/api/ingredient-all-data-unfiltered/?search=${searchInput}&limit=50`;

				const response = await api.get(endpoint);
				if (response.data && Array.isArray(response.data)) {
					setDynamicIngredients(
						response.data.map((item) => item.name).slice(0, 50)
					);
				}
			} catch (error) {
				const fallbackIngredients =
					useDietFilter && allAvailableIngredients.length > 0
						? allAvailableIngredients
								.filter(
									(ing) =>
										!userAllergens.includes(
											ing.toLowerCase()
										)
								)
								.sort(() => 0.5 - Math.random())
								.slice(0, 20)
						: popularIngredients.filter(
								(ing) =>
									!userAllergens.includes(ing.toLowerCase())
						  );
				setDynamicIngredients(fallbackIngredients);
			} finally {
				setIsLoadingIngredients(false);
			}
		};

		const timeoutId = setTimeout(fetchIngredients, 300);
		return () => clearTimeout(timeoutId);
	}, [
		searchInput,
		userAllergens,
		selectedAllergens,
		selectedIngredients,
		allAvailableIngredients,
		useDietFilter,
	]);

	// Determine which ingredients to display
	useEffect(() => {
		const combinedIngredients = Array.from(
			new Set([
				...selectedIngredients,
				...selectedAllergens,
				...dynamicIngredients,
			])
		);
		const sortedIngredients = [...combinedIngredients].sort((a, b) => {
			const isASelected =
				selectedIngredients.includes(a) ||
				selectedAllergens.includes(a);
			const isBSelected =
				selectedIngredients.includes(b) ||
				selectedAllergens.includes(b);
			if (isASelected && !isBSelected) return -1;
			if (!isASelected && isBSelected) return 1;
			return 0;
		});
		setFilteredIngredients(sortedIngredients);
	}, [dynamicIngredients, selectedIngredients, selectedAllergens]);

	// Show "No ingredients found" message
	useEffect(() => {
		if (filteredIngredients.length === 0 && searchInput.trim() !== "") {
			const timeout = setTimeout(
				() => setShowNoIngredientsMessage(true),
				500
			);
			return () => clearTimeout(timeout);
		} else {
			setShowNoIngredientsMessage(false);
		}
	}, [filteredIngredients, searchInput]);

	const toggleIngredient = (ingredient) => {
		const isAllergen = userAllergens.includes(ingredient.toLowerCase());
		if (isAllergen) {
			setSelectedAllergens((prev) =>
				prev.includes(ingredient)
					? prev.filter((item) => item !== ingredient)
					: [...prev, ingredient]
			);
		} else {
			setSelectedIngredients((prev) =>
				prev.includes(ingredient)
					? prev.filter((item) => item !== ingredient)
					: [...prev, ingredient]
			);
		}
	};

	return {
		searchInput,
		setSearchInput,
		selectedIngredients,
		setSelectedIngredients,
		filteredIngredients,
		showNoIngredientsMessage,
		userAllergens,
		selectedAllergens,
		useDietFilter,
		handleDietFilterToggle,
		isLoadingIngredients,
		dietFilterDebounce,
		toggleIngredient,
		userDietaryPreference,
	};
}
