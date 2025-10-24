export const uuid = () => {
	// Check if we're in a browser environment with crypto API
	if (typeof window !== "undefined" && window.crypto?.randomUUID) {
		return window.crypto.randomUUID();
	}
	// Fallback for test environments or older browsers
	return `${Math.random()}-${Math.random()}-${Math.random()}-${Math.random()}`;
};
