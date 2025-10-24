import { Shop, type ShopItem } from "@/shop/Shop";
import {
	pistol,
	smg,
	doubleBarrelShotgun,
	ak47,
	laserGun,
	sword,
	knife,
	brick,
} from "@/weapons-definitions";

export default {
	title: "Shop/Shop",
	component: Shop,
};

// Default shop with 4 random items
export const DefaultShop = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: pistol, price: 50 },
			{ weapon: sword, price: 75 },
			{ weapon: smg, price: 100 },
			{ weapon: doubleBarrelShotgun, price: 150 },
		] as ShopItem[],
		availableMaterials: 200,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};

// Shop with low materials (can't afford most items)
export const LowMaterials = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: pistol, price: 50 },
			{ weapon: sword, price: 75 },
			{ weapon: ak47, price: 200 },
			{ weapon: laserGun, price: 300 },
		] as ShopItem[],
		availableMaterials: 60,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};

// Shop with high materials (can afford everything)
export const HighMaterials = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: pistol, price: 50 },
			{ weapon: sword, price: 75 },
			{ weapon: smg, price: 100 },
			{ weapon: doubleBarrelShotgun, price: 150 },
		] as ShopItem[],
		availableMaterials: 1000,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};

// Shop with expensive items
export const ExpensiveShop = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: ak47, price: 200 },
			{ weapon: laserGun, price: 300 },
			{ weapon: doubleBarrelShotgun, price: 250 },
			{ weapon: smg, price: 150 },
		] as ShopItem[],
		availableMaterials: 500,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};

// Shop with cheap items
export const CheapShop = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: knife, price: 25 },
			{ weapon: brick, price: 30 },
			{ weapon: pistol, price: 50 },
			{ weapon: sword, price: 60 },
		] as ShopItem[],
		availableMaterials: 100,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};

// Empty materials
export const NoMaterials = {
	render: (args: any) => <Shop {...args} />,
	args: {
		items: [
			{ weapon: pistol, price: 50 },
			{ weapon: sword, price: 75 },
			{ weapon: smg, price: 100 },
			{ weapon: doubleBarrelShotgun, price: 150 },
		] as ShopItem[],
		availableMaterials: 0,
		onPurchase: (item: ShopItem) => {
			console.log("Purchased:", item.weapon.name, "for", item.price);
		},
	},
};
