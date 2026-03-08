// hooks/usePolling.js or usePolling.ts
import { useEffect } from "react";

/**
 * A custom hook to implement polling for a given callback function.
 * @param {() => void} callback - The function to execute at intervals.
 * @param {number | null} delay - The interval in milliseconds. If null, polling stops.
 */
export function usePolling(callback: () => void, delay: number | null) {
	useEffect(() => {
		if (delay === null) {
			return;
		}

		const intervalId = setInterval(() => {
			callback();
		}, delay);

		// Cleanup function to clear the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [callback, delay]); // Re-run effect if callback or delay changes
}
