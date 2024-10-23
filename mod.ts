import { copy as copyFS } from "jsr:@std/fs@^1.0.4/copy";
import { emptyDir as emptyFSDir } from "jsr:@std/fs@^1.0.4/empty-dir";
import { ensureDir as ensureFSDir } from "jsr:@std/fs@^1.0.4/ensure-dir";
import { exists as isFSExists } from "jsr:@std/fs@^1.0.4/exists";
import { dirname as getPathDirname } from "jsr:@std/path@^1.0.6/dirname";
import { join as joinPath } from "jsr:@std/path@^1.0.6/join";
import {
	resolveEntrypoints,
	type DenoNodeJSTransformerEntrypoint
} from "./_entrypoints.ts";
import {
	walkFS,
	type FSWalkEntry
} from "./_fswalk.ts";
import {
	refactorMetadata,
	type Metadata,
} from "./_metadata.ts";
import {
	resolveDNTShimsOptions,
	type DenoNodeJSTransformerShimOptions
} from "./_shims.ts";
import {
	build,
	type BuildOptions,
	type LibName,
	type ScriptTarget,
	type SpecifierMappings
} from "./deps.ts";
export {
	getMetadataFromConfig,
	MetadataFromConfig
} from "./_from_config.ts";
export interface DenoNodeJSTransformerAssetsCopyOptions {
	from: string;
	to: string;
}
export interface DenoNodeJSTransformerOptions {
	/**
	 * Copy assets after the build, by relative path under the {@linkcode root}.
	 */
	assetsCopy?: (string | DenoNodeJSTransformerAssetsCopyOptions)[];
	/**
	 * Whether to enable experimental support for emit type metadata for decorators which works with the NPM package {@linkcode https://www.npmjs.com/package/reflect-metadata reflect-metadata}.
	 * @default {false}
	 */
	emitDecoratorMetadata?: boolean;
	/**
	 * Entrypoints of the package.
	 */
	entrypoints: DenoNodeJSTransformerEntrypoint[];
	/**
	 * Filter out diagnostics that want to ignore during type check and emit.
	 * 
	 * Return `true` to surface the diagnostic, or return `false` to ignore it.
	 */
	filterDiagnostic?: BuildOptions["filterDiagnostic"];
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
	 * Imports map, by relative file path under the {@linkcode root}.
	 */
	importsMap?: string;
	/**
	 * Default set of library options to use. See https://www.typescriptlang.org/tsconfig/#lib.
	 */
	lib?: LibName[];
	/**
	 * Whether to perform type check of declaration files (those in dependencies).
	 * @default {false}
	 */
	libCheck?: boolean;
	/**
	 * Remap specifiers.
	 * 
	 * This can be redirect to a NodeJS specific file:
	 * 
	 * ```ts
	 * {
	 *   mappings: {
	 *     "./file.deno.ts": "./file.node.ts"
	 *   }
	 * }
	 * ```
	 * 
	 * Or remap to an NPM package:
	 * 
	 * ```ts
	 * {
	 *   mappings: {
	 *     "https://deno.land/x/code_block_writer@11.0.0/mod.ts": {
	 *       name: "code-block-writer",
	 *       version: "^11.0.0"
	 *     }
	 *   }
	 * }
	 * ```
	 */
	mappings?: SpecifierMappings;
	/**
	 * Metadata of the NodeJS package (i.e.: `package.json`).
	 */
	metadata: Metadata;
	/**
	 * Directory of the output, by relative directory path under the {@linkcode root}.
	 * @default {"nodejs"}
	 */
	outputDirectory?: string;
	/**
	 * Whether to empty the {@linkcode outputDirectory} before the transform.
	 * @default {false}
	 */
	outputDirectoryPreEmpty?: boolean;
	/**
	 * Workspace, by absolute directory path.
	 * @default {Deno.cwd()}
	 */
	root?: string;
	/**
	 * Shims for NodeJS.
	 */
	shims?: DenoNodeJSTransformerShimOptions;
	/**
	 * Target ECMAScript version.
	 * @default {"ES2022"}
	 */
	target?: ScriptTarget;
	/**
	 * Whether to use NPM package {@linkcode https://www.npmjs.com/package/tslib tslib} to import helper functions once per project instead of include them per-file if necessary.
	 * @default {false}
	 */
	useTSLibHelper?: boolean;
	noImplicitAny?: boolean;
	noImplicitReturns?: boolean;
	noImplicitThis?: boolean;
	noStrictGenericChecks?: boolean;
	noUncheckedIndexedAccess?: boolean;
	strictBindCallApply?: boolean;
	strictFunctionTypes?: boolean;
	strictNullChecks?: boolean;
	strictPropertyInitialization?: boolean;
	useUnknownInCatchVariables?: boolean;
}
export async function invokeDenoNodeJSTransformer(options: DenoNodeJSTransformerOptions): Promise<void> {
	const {
		assetsCopy = [],
		emitDecoratorMetadata = false,
		entrypoints,
		filterDiagnostic,
		generateDeclaration = true,
		generateDeclarationMap = false,
		importsMap,
		lib,
		libCheck = false,
		mappings,
		metadata,
		noImplicitAny,
		noImplicitReturns,
		noImplicitThis,
		noStrictGenericChecks,
		noUncheckedIndexedAccess,
		outputDirectory = "nodejs",
		outputDirectoryPreEmpty = false,
		root = Deno.cwd(),
		shims,
		strictBindCallApply,
		strictFunctionTypes,
		strictNullChecks,
		strictPropertyInitialization,
		target = "ES2022",
		useTSLibHelper = false,
		useUnknownInCatchVariables,
	}: DenoNodeJSTransformerOptions = options;
	const rootOriginal: string = Deno.cwd();
	try {
		Deno.chdir(root);
		await ensureFSDir(outputDirectory);
		if (outputDirectoryPreEmpty) {
			await emptyFSDir(outputDirectory);
		}
		const entrypointsFmt = resolveEntrypoints(entrypoints, generateDeclaration);
		await build({
			compilerOptions: {
				emitDecoratorMetadata,
				importHelpers: useTSLibHelper,
				inlineSources: false,
				lib,
				noImplicitAny,
				noImplicitReturns,
				noImplicitThis,
				noStrictGenericChecks,
				noUncheckedIndexedAccess,
				skipLibCheck: !libCheck,
				sourceMap: false,
				strictBindCallApply,
				strictFunctionTypes,
				strictNullChecks,
				strictPropertyInitialization,
				stripInternal: false,
				target,
				useUnknownInCatchVariables
			},
			declaration: generateDeclaration ? "inline" : false,
			declarationMap: generateDeclarationMap,
			entryPoints: entrypointsFmt.dnt,
			esModule: true,
			filterDiagnostic,
			importMap: importsMap,
			mappings,
			outDir: outputDirectory,
			package: metadata,
			scriptModule: false,
			shims: resolveDNTShimsOptions(shims),
			skipNpmInstall: true,
			skipSourceOutput: false,
			test: false,
			typeCheck: false
		});
		for (const subpath of [
			".npmignore",
			"esm/package.json",
			"esm/package-lock.json",
			"package-lock.json",
			"script",
			"src",
			"types"
		]) {
			const subpathRelative: string = joinPath(outputDirectory, subpath);
			if (await isFSExists(subpathRelative)) {
				await Deno.remove(subpathRelative, { recursive: true }).catch((reason: unknown): void => {
					console.error(reason);
				});
			}
		}
		// Snapshot original files path for move files.
		const outputDirectoryESM: string = joinPath(outputDirectory, "esm");
		const outputDirectoryESMFilesPathSnapshot: FSWalkEntry[] = await Array.fromAsync(walkFS(outputDirectoryESM));
		const renameToken: string = ((): string => {
			let token: string;
			do {
				token = `${crypto.randomUUID().slice(-12)}_`;
			} while (outputDirectoryESMFilesPathSnapshot.some(({ name }: FSWalkEntry): boolean => {
				return name.startsWith(token);
			}));
			return token;
		})();
		for (const {
			isFile,
			name,
			pathRelative
		} of outputDirectoryESMFilesPathSnapshot) {
			if (!isFile) {
				continue;
			}
			// Move files with rename to prevent overwrite original files which not yet moved.
			const pathNewDir: string = joinPath(outputDirectory, getPathDirname(pathRelative));
			await ensureFSDir(pathNewDir);
			await Deno.rename(joinPath(outputDirectoryESM, pathRelative), joinPath(pathNewDir, `${renameToken}${name}`));
		}
		// Snapshot files path again for rename moved files.
		const outputDirectoryFilesPathSnapshot: FSWalkEntry[] = await Array.fromAsync(walkFS(outputDirectory));
		for (const {
			isFile,
			name,
			pathRelative
		} of outputDirectoryFilesPathSnapshot) {
			if (!(isFile && name.startsWith(renameToken))) {
				continue;
			}
			await Deno.rename(joinPath(outputDirectory, pathRelative), joinPath(outputDirectory, getPathDirname(pathRelative), name.slice(renameToken.length)));
		}
		await refactorMetadata({
			entrypoints: entrypointsFmt.metadata,
			metadataPath: joinPath(outputDirectory, "package.json")
		});
		for (const element of assetsCopy) {
			if (typeof element === "string") {
				await copyFS(element, joinPath(outputDirectory, element), { overwrite: true });
			} else {
				await copyFS(element.from, joinPath(outputDirectory, element.to), { overwrite: true });
			}
		}
	} finally {
		Deno.chdir(rootOriginal);
	}
}
export default invokeDenoNodeJSTransformer;
