import { partition } from "jsr:@std/collections@^1.0.7/partition";
import { sortObject } from "./_sort_object.ts";
import type { EntryPoint } from "./deps.ts";
export interface DenoNodeJSTransformerEntrypoint {
	/**
	 * Whether the entrypoint is for executable.
	 * @default {false}
	 */
	executable?: boolean;
	/**
	 * Name of the entrypoint.
	 * 
	 * Use `.` for the default entrypoint.
	 */
	name: string;
	/**
	 * Relative file path of the entrypoint.
	 */
	path: string;
}
interface DenoNodeJSTransformerEntrypointFmt extends Required<Omit<DenoNodeJSTransformerEntrypoint, "path">> {
	/**
	 * Relative declaration file path of the entrypoint.
	 */
	pathDeclaration?: string;
	/**
	 * Relative script file path of the entrypoint.
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
				default: string;
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
		throw new ReferenceError(`Entrypoints are not defined!`);
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
	let entrypointsMetadataExports: MetadataEntrypoints["exports"] = (entrypointsRest.length > 0) ? sortObject(Object.fromEntries(entrypointsRest.map(({
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
	}))) : undefined;
	if (typeof entrypointsMain !== "undefined") {
		entrypointsMetadataExports ??= {};
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
			bin: (entrypointsBin.length > 0) ? sortObject(Object.fromEntries(entrypointsBin.map(({
				name,
				pathScript
			}: DenoNodeJSTransformerEntrypointFmt): [string, string] => {
				return [name, pathScript];
			}))) : undefined,
			main: entrypointsMain?.pathScript,
			module: entrypointsMain?.pathScript,
			exports: entrypointsMetadataExports,
			types: entrypointsMain?.pathDeclaration,
		}
	};
}
