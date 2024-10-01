import { partition } from "jsr:@std/collections@^1.0.6/partition";
export interface SortObjectOptions {
	/**
	 * Which "cending" the rest keys (i.e.: not specified keys) should use to sort. Define negative number for ascending, otherwise for descending.
	 * @default {-1}
	 */
	orderRestCending?: number;
	/**
	 * Which position the rest keys (i.e.: not specified keys) should place with the specified keys. Define negative number for place before, otherwise for place after.
	 * @default {1}
	 */
	orderRestPosition?: number;
	/**
	 * Sort these specify keys in this specify order.
	 */
	orderSpecifyKeys?: string[];
}
export function sortObject<T>(o: { [key: string]: T; }, options: SortObjectOptions = {}): { [key: string]: T; } {
	const {
		orderRestCending = -1,
		orderRestPosition = 1,
		orderSpecifyKeys = []
	}: SortObjectOptions = options;
	const [entriesSpecify, entriesRest]: [[string, T][], [string, T][]] = partition(Object.entries(o), ([key]: [string, T]): boolean => {
		return orderSpecifyKeys.includes(key);
	});
	const objectSpecify: { [key: string]: T; } = Object.fromEntries(entriesSpecify.sort(([a]: [string, T], [b]: [string, T]): number => {
		return (orderSpecifyKeys.indexOf(a) - orderSpecifyKeys.indexOf(b));
	}));
	const objectRestKeySort: string[] = entriesRest.map(([key]: [string, T]): string => {
		return key;
	}).sort();
	const objectRest: { [key: string]: T; } = Object.fromEntries(entriesRest.sort(([a]: [string, T], [b]: [string, T]): number => {
		const aIndex: number = objectRestKeySort.indexOf(a);
		const bIndex: number = objectRestKeySort.indexOf(b);
		return ((orderRestCending < 0) ? (aIndex - bIndex) : (bIndex - aIndex));
	}));
	return ((orderRestPosition < 0) ? { ...objectRest, ...objectSpecify } : { ...objectSpecify, ...objectRest });
}
