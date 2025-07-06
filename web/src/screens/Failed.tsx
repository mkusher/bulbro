import { useState } from "preact/hooks";

export function Failed() {
	const [v, set] = useState(0);
	return <h1>Failed {v}</h1>;
}
