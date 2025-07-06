import type { ComponentChildren } from "preact";

export function CardPosition({ children }: { children: ComponentChildren }) {
	return (
		<div className="flex h-screen md:w-screen mt-30 md:mt-48 xl:mt-60">
			<div className="m-auto flex flex-col gap-6 pb-40">{children}</div>
		</div>
	);
}
