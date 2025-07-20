import { useLocation } from "preact-iso";

export function useRouter() {
	const location = useLocation();

	return {
		toGame: () => location.route("/game"),
	};
}
