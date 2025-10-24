export type NowTime = number & { readonly __brand: "NowTime" };
export type DeltaTime = number & { readonly __brand: "DeltaTime" };

export const nowTime = (value: number): NowTime => value as NowTime;
export const deltaTime = (value: number): DeltaTime => value as DeltaTime;
