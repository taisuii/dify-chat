import { useCallback, useRef } from 'react'

/**
 * useEffectEvent polyfill for React 18 compatibility
 * 
 * React 19 has built-in useEffectEvent, but for React 18 we need this polyfill.
 * This hook creates a stable callback that always uses the latest values without
 * triggering re-renders when dependencies change.
 * 
 * @see https://react.dev/reference/react/useEffectEvent
 */
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
	const ref = useRef<T>(callback)
	
	// Always keep the ref up to date with the latest callback
	ref.current = callback
	
	// Return a stable function that calls the latest callback
	return useCallback(((...args: any[]) => {
		return ref.current(...args)
	}) as T, [])
}
