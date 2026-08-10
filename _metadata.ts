import { sortCollectionByKeys } from "jsr:@hugoalh/sort@^0.4.0/collection";
import type { EntryPoint } from "./_deps.ts";
export interface MetadataBugs {
	email?: string;
	url?: string;
}
export type MetadataDevEngineOnFail =
	| "error"
	| "ignore"
	| "warn";
export interface MetadataDevEngineEntry {
	name: string;
	version?: string;
	onFail?: MetadataDevEngineOnFail;
}
export interface MetadataDevEngines {
	cpu?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	libc?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	os?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	packageManager?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
	runtime?: MetadataDevEngineEntry | MetadataDevEngineEntry[];
}
export interface MetadataEntrypoints {
	bin?: Record<string, string>;
	main?: string;
	module?: string;
	exports?: {
		[x: string]: {
			[x: string]: {
				types?: string;
				default: string;
			};
		};
	};
	types?: string;
}
export interface MetadataFunding {
	type: string;
	url: string;
}
export interface MetadataPerson {
	name: string;
	email?: string;
	url?: string;
}
export interface MetadataRepository {
	type: string;
	url: string;
	directory?: string;
}
export interface Metadata {
	name: string;
	version: string;
	description?: string;
	keywords?: string[];
	homepage?: string;
	bugs?: string | MetadataBugs;
	license?: string;
	author?: string | MetadataPerson;
	contributors?: (string | MetadataPerson)[];
	funding?: string | MetadataFunding | (string | MetadataFunding)[];
	files?: string[];
	repository?: string | MetadataRepository;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	bundleDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	engines?: Record<string, string>;
	os?: string[];
	cpu?: string[];
	libc?: string;
	devEngines?: MetadataDevEngines;
	private?: boolean;
	[name: string]: unknown;
}
const metadataKeysDefaultSort: readonly string[] = [/* UNIQUE */
	"name",
	"version",
	"description",
	"keywords",
	"homepage",
	"bugs",
	"license",
	"author",
	"contributors",
	"funding",
	"files",
	"type",
	"bin",
	"main",
	"module",
	"exports",
	"types",
	"man",
	"repository",
	"scripts",
	"config",
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"bundleDependencies",
	"optionalDependencies",
	"overrides",
	"engines",
	"os",
	"cpu",
	"libc",
	"devEngines",
	"private",
	"publishConfig"
];
const regexpExecutableName = /^[\d\w\-]+$/;
interface MetadataEntrypointPaths {
	types?: string;
	default: string;
}
function resolveEntrypointPaths(path: string, declaration: boolean): MetadataEntrypointPaths {
	if (!path.startsWith("./")) {
		throw new Error(`Entrypoint path must start with \`./\`!`);
	}
	return {
		types: declaration ? path.replace(/\.tsx?$/, ".d.ts") : undefined,
		default: path.replace(/\.tsx?$/, ".js")
	};
}
export function resolveEntrypoints(executables: Record<string, string>, scripts: Record<string, string>, declaration: boolean): {
	dnt: EntryPoint[];
	metadata: MetadataEntrypoints;
} {
	if (Object.entries(executables).length === 0 && Object.entries(scripts).length === 0) {
		throw new ReferenceError(`Entrypoints are not defined!`);
	}
	const metadataBin: Record<string, string> = sortCollectionByKeys(Object.fromEntries(Object.entries(executables).map(([
		name,
		path
	]: readonly [string, string]): readonly [string, string] => {
		if (!regexpExecutableName.test(name)) {
			throw new SyntaxError(`\`${name}\` is not a valid executable name!`);
		}
		return [name, resolveEntrypointPaths(path, declaration).default];
	})));
	let scriptsMap: Map<string, { import: MetadataEntrypointPaths; }> = new Map<string, { import: MetadataEntrypointPaths; }>(Object.entries(scripts).map(([
		name,
		path
	]: readonly [string, string]): readonly [string, { import: MetadataEntrypointPaths; }] => {
		if (name.trim() !== name) {
			throw new Error(`Script name is not well trimmed!`);
		}
		if (!(
			name === "." ||
			name.startsWith("./")
		)) {
			throw new Error(`Script name must be \`.\` or start with \`./\`!`);
		}
		return [name, { import: resolveEntrypointPaths(path, declaration) }];
	}));
	const scriptDot: { import: MetadataEntrypointPaths; } | undefined = scriptsMap.get(".");
	scriptsMap.delete(".");
	scriptsMap = sortCollectionByKeys(scriptsMap);
	if (typeof scriptDot !== "undefined") {
		scriptsMap.set(".", scriptDot);
	}
	const matadataExports: Record<string, { import: MetadataEntrypointPaths; }> = Object.fromEntries(Array.from(scriptsMap.entries()));
	return {
		dnt: [
			...Object.entries(executables).map(([
				name,
				path
			]: readonly [string, string]): EntryPoint => {
				return {
					kind: "bin",
					name,
					path
				};
			}),
			...Object.entries(scripts).map(([
				name,
				path
			]: readonly [string, string]): EntryPoint => {
				return {
					kind: "export",
					name,
					path
				};
			})
		],
		metadata: {
			bin: (Object.entries(metadataBin).length > 0) ? metadataBin : undefined,
			main: matadataExports["."]?.import.default,
			module: matadataExports["."]?.import.default,
			exports: (Object.entries(matadataExports).length > 0) ? matadataExports : undefined,
			types: matadataExports["."]?.import.types
		}
	};
}
export async function refactorMetadata(filePath: string | URL, entrypoints: MetadataEntrypoints): Promise<void> {
	const original = {
		...JSON.parse(await Deno.readTextFile(filePath)),
		...entrypoints,
		type: "module"
	};
	const result: Record<string, unknown> = {};
	for (const metadataKey of metadataKeysDefaultSort) {
		const value = original[metadataKey];
		if (typeof value !== "undefined") {
			result[metadataKey] = (
				metadataKey === "dependencies" ||
				metadataKey === "devDependencies" ||
				metadataKey === "peerDependencies" ||
				metadataKey === "bundleDependencies" ||
				metadataKey === "optionalDependencies" ||
				metadataKey === "overrides" ||
				metadataKey === "engines" ||
				metadataKey === "os" ||
				metadataKey === "cpu" ||
				metadataKey === "devEngines" ||
				metadataKey === "publishConfig"
			) ? sortCollectionByKeys(value as Record<string, unknown>) : value;
			delete original[metadataKey];
		}
	}
	await Deno.writeTextFile(filePath, JSON.stringify({ ...result, ...sortCollectionByKeys(original as Record<string, unknown>) }, undefined, "\t"));
}
