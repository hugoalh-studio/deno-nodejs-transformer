import type {
	Shim,
	ShimOptions
} from "./deps.ts";
export interface DenoNodeJSTransformerShimOptions extends Omit<ShimOptions, "customDev" | "timers"> {
	/**
	 * Shim `Blob`.
	 * 
	 * This value should define to `true` if the target NodeJS version is not 18 or greater.
	 * @default false
	 */
	blob?: boolean;
	/**
	 * Shim `crypto`.
	 * 
	 * This value should define to `true` if the target NodeJS version is not 16 or greater.
	 * @default false
	 */
	crypto?: boolean;
	/**
	 * Shim `Deno` namespace.
	 * @default true
	 */
	deno?: boolean;
	/**
	 * Shim `DOMException` via the NPM package {@linkcode https://www.npmjs.com/package/domexception domexception}.
	 * @default false
	 */
	domException?: boolean;
	/**
	 * Shim `alert`, `confirm`, and `prompt`.
	 * @default true
	 */
	prompts?: boolean;
	/**
	 * Shim `fetch`, `File`, `FormData`, `Headers`, `Request`, and `Response` via the NPM package {@linkcode https://www.npmjs.com/package/undici undici}.
	 * 
	 * This value should define to `true` if the target NodeJS version is not 18 or greater.
	 * @default false
	 */
	undici?: boolean;
	/**
	 * Shim `WeakRef`.
	 * 
	 * This value should define to `true` if the target NodeJS version is not 14 or greater; Some of the sub features only available on NodeJS version 20 or greater.
	 * @default false
	 */
	weakRef?: boolean;
	/**
	 * Shim `WebSocket` via the NPM package {@linkcode https://www.npmjs.com/package/ws ws}.
	 * 
	 * This value should define to `true` if the target NodeJS version is not 22 or greater.
	 */
	webSocket?: boolean;
	/**
	 * Custom shims.
	 */
	custom?: Shim[];
}
/**
 * Resolve to the DNT shims options.
 * @param {DenoNodeJSTransformerShimOptions} [options={}] Shims options.
 * @returns {ShimOptions} DNT shims options.
 */
export function resolveDNTShimsOptions(options: DenoNodeJSTransformerShimOptions = {}): ShimOptions {
	return {
		blob: options.blob ?? false,
		crypto: options.crypto ?? false,
		deno: options.deno ?? true,
		domException: options.domException ?? false,
		prompts: options.prompts ?? true,
		timers: true,
		undici: options.undici ?? false,
		weakRef: options.weakRef ?? false,
		webSocket: options.webSocket ?? false,
		custom: options.custom,
		customDev: []
	};
}
