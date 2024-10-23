import {
	isJSONObject,
	type JSONObject,
	type JSONValue
} from "https://raw.githubusercontent.com/hugoalh-studio/is-json-es/v1.0.3/mod.ts";
import {
	parse as parseJSONC,
	type JsonValue
} from "jsr:@std/jsonc@^1.0.1/parse";
import type { DenoNodeJSTransformerEntrypoint } from "./_entrypoints.ts";
export class MetadataFromConfig {
	get [Symbol.toStringTag](): string {
		return "MetadataFromConfig";
	}
	#context: JSONObject;
	#filePath: string;
	private constructor(filePath: string, context: JsonValue) {
		if (!isJSONObject(context)) {
			throw new Error(`\`${filePath}\` is not a valid configuration file!`);
		}
		this.#context = context;
		this.#filePath = filePath;
	}
	getExports(): DenoNodeJSTransformerEntrypoint[] {
		if (!isJSONObject(this.#context.exports)) {
			throw new Error(`Configuration file \`${this.#filePath}\` does not contain a valid property \`exports\`!`);
		}
		return Object.entries(this.#context.exports).map(([key, value]: [string, JSONValue]): DenoNodeJSTransformerEntrypoint => {
			if (typeof value !== "string") {
				throw new TypeError(`\`${value}\` (property \`exports.${key}\`) is not a valid export!`);
			}
			return {
				name: key,
				path: value.replace(/^\.\//, "")
			};
		});
	}
	getName(): string {
		if (typeof this.#context.name !== "string") {
			throw new Error(`Configuration file \`${this.#filePath}\` does not contain a valid property \`name\`!`);
		}
		return this.#context.name;
	}
	getVersion(): string {
		if (typeof this.#context.version !== "string") {
			throw new Error(`Configuration file \`${this.#filePath}\` does not contain a valid property \`version\`!`);
		}
		return this.#context.version;
	}
}
export async function getMetadataFromConfig(filePath: string = "deno.jsonc"): Promise<MetadataFromConfig> {
	//@ts-ignore Access private constructor.
	return new MetadataFromConfig(filePath, parseJSONC(await Deno.readTextFile(filePath)));
}
