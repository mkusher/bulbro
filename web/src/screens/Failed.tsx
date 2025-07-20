import { Card, CardContent, CardTitle } from "@/ui/shadcn/card";
import { CentralCard } from "@/ui/Layout";

export function Failed() {
	return (
		<CentralCard>
			<Card>
				<CardTitle>
					<h1 className="text-8xl m-32">Failed</h1>
				</CardTitle>
				<CardContent>
					<a href="/">To main</a>
				</CardContent>
			</Card>
		</CentralCard>
	);
}
