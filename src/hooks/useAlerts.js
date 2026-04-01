import { useState, useCallback } from "react";

export function useAlerts() {
	const [alerts, setAlerts] = useState([]);

	const addAlert = useCallback((message) => {
		const id = Date.now();
		setAlerts((prevAlerts) => [
			...prevAlerts,
			{ id, message, visible: true },
		]);

		setTimeout(() => {
			setAlerts((prevAlerts) =>
				prevAlerts.map((alert) =>
					alert.id === id ? { ...alert, visible: false } : alert
				)
			);
		}, 500);

		setTimeout(() => {
			setAlerts((prevAlerts) =>
				prevAlerts.filter((alert) => alert.id !== id)
			);
		}, 2500);
	}, []);

	return { alerts, addAlert };
}
