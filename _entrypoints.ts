import { partition } from "jsr:@std/collections@^1.0.7/partition";
import type { EntryPoint } from "./deps.ts";
import { sortObject } from "./_sort_object.ts";
export interface DenoNodeJSTransformerEntrypoint {
	/**
	 * Whether this is an executable entrypoint.
	 * @default {false}
	 */
	executable?: boolean;
	/**
	 * Name of the entrypoint. Use `.` for the default export entrypoint.
	 */
	name: string;
	/**
	 * Relative file path to the entrypoint.
	 */
	path: string;
}
interface DenoNodeJSTransformerEntrypointFmt {
	/**
	 * Whether this is an executable entrypoint.
	 */
	executable: boolean;
	/**
	 * Name of the entrypoint. Use `.` for the default export entrypoint.
	 */
	name: string;
	/**
	 * Relative declaration file path to the entrypoint.
	 */
	pathDeclaration?: string;
	/**
	 * Relative script file path to the entrypoint.
	 */
	pathScript: string;
}
export interface MetadataEntrypoints {
	bin?: { [name: string]: string; };
	main?: string;
	module?: string;
	exports?: {
		[x: string]: {
			[x: string]: {
				types?: string;
				[x: string]: string | undefined;
			};
		};
	};
	types?: string;
}
export function resolveEntrypoints(entrypoints: DenoNodeJSTransformerEntrypoint[], declaration: boolean): {
	dnt: EntryPoint[];
	metadata: MetadataEntrypoints;
} {
	if (entrypoints.length === 0) {
		throw new Error("Missing entrypoints!");
	}
	const entrypointsFmt: DenoNodeJSTransformerEntrypointFmt[] = entrypoints.map(({
		executable = false,
		name,
		path
	}: DenoNodeJSTransformerEntrypoint): DenoNodeJSTransformerEntrypointFmt => {
		return {
			executable,
			name,
			pathDeclaration: declaration ? `./${path.replace(/\.tsx?$/, ".d.ts")}` : undefined,
			pathScript: `./${path.replace(/\.tsx?$/, ".js")}`
		};
	});
	const [
		entrypointsBin,
		entrypointsExports
	]: [DenoNodeJSTransformerEntrypointFmt[], DenoNodeJSTransformerEntrypointFmt[]] = partition(entrypointsFmt, ({ executable }: DenoNodeJSTransformerEntrypointFmt): boolean => {
		return executable;
	});
	const entrypointsBinName: string[] = entrypointsBin.map(({ name }: DenoNodeJSTransformerEntrypointFmt): string => {
		return name;
	});
	if (entrypointsBinName.some((name: string): boolean => {
		return name.startsWith(".");
	})) {
		throw new Error("Executable name must not start with `.`!");
	}
	if (entrypointsBinName.length !== new Set(entrypointsBinName).size) {
		throw new Error("Found duplicated executables name!");
	}
	const entrypointsExportsName: string[] = entrypointsExports.map(({ name }: DenoNodeJSTransformerEntrypointFmt): string => {
		return name;
	});
	if (entrypointsExportsName.length !== new Set(entrypointsExportsName).size) {
		throw new Error("Found duplicated exports name!");
	}
	const entrypointsMainIndex: number = entrypointsExports.findIndex(({ name }: DenoNodeJSTransformerEntrypointFmt): boolean => {
		return (name === ".");
	});
	const entrypointsMain: DenoNodeJSTransformerEntrypointFmt | undefined = (entrypointsMainIndex < 0) ? undefined : entrypointsExports[entrypointsMainIndex];
	const entrypointsRest: DenoNodeJSTransformerEntrypointFmt[] = (entrypointsMainIndex < 0) ? entrypointsExports : entrypointsExports.toSpliced(entrypointsMainIndex, 1);
	const entrypointsMetadataExports: MetadataEntrypoints["exports"] = sortObject(Object.fromEntries(entrypointsRest.map(({
		name,
		pathDeclaration,
		pathScript
	}: DenoNodeJSTransformerEntrypointFmt) => {
		return [
			name,
			{
				import: {
					types: pathDeclaration,
					default: pathScript
				}
			}
		];
	})));
	if (typeof entrypointsMain !== "undefined") {
		entrypointsMetadataExports[entrypointsMain.name] = {
			import: {
				types: entrypointsMain.pathDeclaration,
				default: entrypointsMain.pathScript
			}
		};
	}
	return {
		dnt: entrypoints.map(({
			executable = false,
			name,
			path
		}: DenoNodeJSTransformerEntrypoint): EntryPoint => {
			return {
				kind: executable ? "bin" : "export",
				name,
				path
			};
		}),
		metadata: {
			bin: sortObject(Object.fromEntries(entrypointsBin.map(({
				name,
				pathScript
			}: DenoNodeJSTransformerEntrypointFmt): [string, string] => {
				return [name, pathScript];
			}))),
			main: entrypointsMain?.pathScript,
			module: entrypointsMain?.pathScript,
			exports: entrypointsMetadataExports,
			types: entrypointsMain?.pathDeclaration,
		}
	};
}
