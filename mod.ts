import {
	walk,
	type FSWalkEntry
} from "jsr:@hugoalh/fs@^0.4.0/walk";
import {
	isJSONObject,
	type JSONObject
} from "jsr:@hugoalh/is-json@^1.0.6";
import { copy as copyFS } from "jsr:@std/fs@^1.0.24/copy";
import { emptyDir as emptyFSDir } from "jsr:@std/fs@^1.0.24/empty-dir";
import { ensureDir as ensureFSDir } from "jsr:@std/fs@^1.0.24/ensure-dir";
import {
	parse as parseJSONC,
	type JsonValue
} from "jsr:@std/jsonc@^1.0.2";
import {
	basename as getPathBasename,
	join as joinPath
} from "node:path";
import * as zod from "npm:zod@^4.4.3";
import {
	build,
	type LibName,
	type PolyfillOptions,
	type ScriptTarget,
	type SpecifierMappings
} from "./_deps.ts";
import { fixDenoDNTModification } from "./_fixes.ts";
import {
	refactorMetadata,
	resolveEntrypoints,
	type Metadata,
} from "./_metadata.ts";
import {
	resolveDNTShimsOptions,
	type TransformShimOptions
} from "./_shims.ts";
const zodStringNonEmpty = zod.string().nonempty();
const zodManifestExports = zod.record(zodStringNonEmpty, zodStringNonEmpty);
class ManifestReader {
	#content: JSONObject;
	constructor(content: JSONObject) {
		this.#content = content;
	}
	get _(): JSONObject {
		return structuredClone(this.#content);
	}
	get exports(): Record<string, string> {
		return structuredClone(zodManifestExports.parse(this.#content.exports));
	}
	get license(): string {
		return structuredClone(zodStringNonEmpty.parse(this.#content.license));
	}
	get name(): string {
		return structuredClone(zodStringNonEmpty.parse(this.#content.name));
	}
	get version(): string {
		return structuredClone(zodStringNonEmpty.parse(this.#content.version));
	}
}
export async function readManifest(filePath: string): Promise<ManifestReader> {
	const content: JsonValue = parseJSONC(await Deno.readTextFile(filePath));
	if (!isJSONObject(content)) {
		throw new Error(`Invalid manifest format!`);
	}
	return new ManifestReader(content);
}
export interface TransformCopyEntriesOptions {
	from: string | RegExp;
	to: string;
}
export interface TransformOptions {
	/**
	 * Copy entries as is after the transform, by relative path under the {@link workspace workspace}.
	 */
	copyEntries?: readonly (string | RegExp | TransformCopyEntriesOptions)[];
	/**
	 * Entrypoints of the executable.
	 */
	entrypointsExecutable?: Record<string, string>;
	/**
	 * Entrypoints of the script.
	 */
	entrypointsScript?: Record<string, string>;
	/**
	 * Whether to fix the modifications made by the Deno DNT which cause other issues.
	 * @default {true}
	 */
	fixDenoDNTModifications?: boolean;
	/**
	 * Whether to generate declaration files (`.d.ts`).
	 * @default {true}
	 */
	generateDeclaration?: boolean;
	/**
	 * Whether to generate declaration map files (`.d.ts.map`).
	 * @default {false}
	 */
	generateDeclarationMap?: boolean;
	/**
	 * Imports map, by relative file path under the {@link workspace workspace}.
	 */
	importsMap?: string;
	/**
	 * Sets of the ECMAScript library to use. See https://www.typescriptlang.org/tsconfig/#lib.
	 */
	lib?: LibName[];
	/**
	 * Remap specifiers.
	 * @example Redirect to a NodeJS specific file.
	 * ```ts
	 * {
	 *   "./file.deno.ts": "./file.node.ts"
	 * }
	 * ```
	 * @example Remap to an NPM package.
	 * ```ts
	 * {
	 *   "https://deno.land/x/code_block_writer@11.0.0/mod.ts": {
	 *     name: "code-block-writer",
	 *     version: "^11.0.0"
	 *   }
	 * }
	 * ```
	 */
	mappings?: SpecifierMappings;
	/**
	 * Metadata (i.e.: `package.json`).
	 */
	metadata: Metadata;
	/**
	 * Directory of the output, by relative directory path under the {@link workspace workspace}.
	 * @default {"nodejs"}
	 */
	outputDirectory?: string;
	/**
	 * Whether to empty the {@link outputDirectory output directory} before the transform.
	 * @default {false}
	 */
	outputDirectoryPreEmpty?: boolean;
	/**
	 * Polyfills.
	 * @default {false}
	 */
	polyfills?: PolyfillOptions;
	/**
	 * Shims.
	 */
	shims?: TransformShimOptions;
	/**
	 * Target ECMAScript version.
	 * @default {"ES2022"}
	 */
	target?: ScriptTarget;
	/**
	 * Whether to use {@linkcode https://github.com/Microsoft/tslib TSLib} to import helper functions once per project instead of include them per-file if necessary.
	 * @default {false}
	 */
	useTSLibHelper?: boolean;
	/**
	 * Workspace, by absolute directory path.
	 * @default {Deno.cwd()}
	 */
	workspace?: string;
}
class ChdirDispose {
	#from: string = Deno.cwd();
	constructor(to: string | URL) {
		Deno.chdir(to);
	}
	[Symbol.dispose](): void {
		Deno.chdir(this.#from);
	}
}
export async function transform(options: TransformOptions): Promise<void> {
	const {
		copyEntries = [],
		entrypointsExecutable = {},
		entrypointsScript = {},
		fixDenoDNTModifications = true,
		generateDeclaration = true,
		generateDeclarationMap = false,
		importsMap,
		lib,
		mappings,
		metadata,
		outputDirectory = "nodejs",
		outputDirectoryPreEmpty = false,
		polyfills = false,
		shims,
		target = "ES2022",
		useTSLibHelper = false,
		workspace
	}: TransformOptions = options;
	const workspaceAbsolute: string = (typeof workspace === "undefined") ? Deno.cwd() : joinPath(Deno.cwd(), workspace);
	const copyEntriesPayload: readonly (readonly [string, string] | null)[] = (copyEntries.length > 0) ? await Array.fromAsync(await walk(workspaceAbsolute), ({ pathRelative }: FSWalkEntry): readonly [string, string] | null => {
		for (const copyEntry of copyEntries) {
			if (typeof copyEntry === "string") {
				if (copyEntry === pathRelative) {
					return [pathRelative, joinPath(outputDirectory, pathRelative)];
				}
			} else if (copyEntry instanceof RegExp) {
				if (copyEntry.test(pathRelative)) {
					return [pathRelative, joinPath(outputDirectory, pathRelative)];
				}
			} else {
				if ((copyEntry.from instanceof RegExp) ? copyEntry.from.test(pathRelative) : copyEntry.from === pathRelative) {
					return [pathRelative, joinPath(outputDirectory, (
						copyEntry.to.endsWith("/") ||
						copyEntry.to.endsWith("\\")
					) ? joinPath(copyEntry.to.slice(0, - 1), getPathBasename(pathRelative)) : copyEntry.to)];
				}
			}
		}
		return null;
	}) : [];
	using _: ChdirDispose = new ChdirDispose(workspaceAbsolute);
	await ensureFSDir(outputDirectory);
	if (outputDirectoryPreEmpty) {
		await emptyFSDir(outputDirectory);
	}
	const entrypointsFmt = resolveEntrypoints(entrypointsExecutable, entrypointsScript, generateDeclaration);
	await build({
		compilerOptions: {
			emitDecoratorMetadata: false,
			experimentalDecorators: false,
			importHelpers: useTSLibHelper,
			inlineSources: false,
			lib,
			noImplicitAny: false,
			noImplicitReturns: false,
			noImplicitThis: false,
			noStrictGenericChecks: false,
			noUncheckedIndexedAccess: false,
			skipLibCheck: true,
			sourceMap: false,
			strictBindCallApply: false,
			strictFunctionTypes: false,
			strictNullChecks: false,
			strictPropertyInitialization: false,
			stripInternal: false,
			target,
			useUnknownInCatchVariables: false
		},
		declaration: generateDeclaration ? "inline" : false,
		declarationMap: generateDeclarationMap,
		entryPoints: entrypointsFmt.dnt,
		esModule: true,
		importMap: importsMap,
		mappings,
		outDir: outputDirectory,
		package: metadata,
		polyfills,
		scriptModule: false,
		shims: resolveDNTShimsOptions(shims),
		skipNpmInstall: true,
		skipSourceOutput: true,
		test: false,
		typeCheck: false
	});
	for (const subpath of [
		"package-lock.json"
	]) {
		try {
			await Deno.remove(joinPath(outputDirectory, subpath), { recursive: true });
		} catch (error) {
			if (!(error instanceof Deno.errors.NotFound)) {
				console.error(error);
			}
		}
	}
	if (fixDenoDNTModifications) {
		const jobs: Promise<void>[] = [];
		for await (const { pathRelative } of await walk(outputDirectory, {
			extensions: [".d.ts", ".js"],
			includeDirectories: false,
			includeSymlinkDirectories: false,
			includeSymlinkFiles: false,
			skips: [
				/^_dnt\..+?\.(?:d\.ts|js)$/,
				/^deps[\\\/]/
			]
		})) {
			jobs.push(fixDenoDNTModification(joinPath(workspaceAbsolute, outputDirectory, pathRelative)));
		}
		await Promise.all(jobs);
	}
	await refactorMetadata(joinPath(outputDirectory, "package.json"), entrypointsFmt.metadata);
	for (const copyEntryPayload of copyEntriesPayload) {
		if (copyEntryPayload !== null) {
			const [from, to] = copyEntryPayload;
			await copyFS(from, to, { overwrite: true });
		}
	}
}
export default transform;
