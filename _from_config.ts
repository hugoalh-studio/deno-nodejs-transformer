import {
	parse as parseJSONC,
	type JsonValue
} from "jsr:@std/jsonc@^1.0.1/parse";
import type { DenoNodeJSTransformerEntrypoint } from "./_entrypoints.ts";
class MetadataFromConfig {
	#context: {
		[key: string]: JsonValue | undefined;
	};
	#filePath: string;
	constructor(filePath: string, context: JsonValue) {
		if (!(typeof context === "object" && !Array.isArray(context) && context !== null)) {
			throw new Error(`\`${filePath}\` is not a valid configuration file!`);
		}
		this.#context = context;
		this.#filePath = filePath;
	}
	get exports(): DenoNodeJSTransformerEntrypoint[] {
		if (!(typeof this.#context.exports === "object" && !Array.isArray(this.#context.exports) && this.#context.exports !== null)) {
			throw new Error(`Configuration file \`${this.#filePath}\` does not contain a valid property \`exports\`!`);
		}
		return Object.entries(this.#context.exports).map(([key, value]) => {
			if (typeof value !== "string") {
				throw new TypeError(`\`${value}\` (export \`${key}\`) is not a valid export!`);
			}
			return {
				name: key,
				path: value.replace(/^\.\//, "")
			};
		});
	}
	get version(): string {
		if (typeof this.#context.version !== "string") {
			throw new Error(`Configuration file \`${this.#filePath}\` does not contain a valid property \`version\`!`);
		}
		return this.#context.version;
	}
}
export async function getMetadataFromConfig(filePath: string = "deno.jsonc"): Promise<MetadataFromConfig> {
	return new MetadataFromConfig(filePath, parseJSONC(await Deno.readTextFile(filePath)));
}
