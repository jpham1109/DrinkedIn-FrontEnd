import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
	// Get from local storage
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key)
			// JWT token is already a string so no need to parse it
			return item !== null ? item : initialValue
		} catch (error) {
			console.log(error)
			return initialValue
		}
	})

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value) => {
		try {
			// Allow value to be a function so we have the same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value
			// Save state
			setStoredValue(valueToStore)
			// Save to local storage
			window.localStorage.setItem(key, valueToStore)
		} catch (error) {
			console.log(error)
		}
	}

	return [storedValue, setValue]
}
