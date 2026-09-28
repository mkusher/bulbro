import {
	expect,
	it,
} from "bun:test";

it("starts with a saved Belarusian locale before the app renders", () => {
	const result =
		Bun.spawnSync(
			{
				cmd: [
					"bun",
					"-e",
					`import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
localStorage.setItem("userSettings", JSON.stringify({ locale: "bel" }));
const { t } = await import("./src/i18n/index.ts");
console.log(t("lobby.title"));`,
				],
				cwd: new URL(
					"../..",
					import.meta
						.url,
				)
					.pathname,
				stdout:
					"pipe",
				stderr:
					"pipe",
			},
		);
	expect(
		new TextDecoder().decode(
			result.stderr,
		),
	).toBe(
		"",
	);
	expect(
		result.exitCode,
	).toBe(
		0,
	);
	expect(
		new TextDecoder()
			.decode(
				result.stdout,
			)
			.trim(),
	).toBe(
		"Лобі",
	);
});
