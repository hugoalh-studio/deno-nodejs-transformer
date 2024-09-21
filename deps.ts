import {
	build,
	type BuildOptions,
	type EntryPoint,
	type LibName,
	type PackageJson,
	type ShimOptions,
	type SourceMapOptions
} from "jsr:@deno/dnt@0.41.3";
import type { 
	Shim,
	SpecifierMappings,
	TransformOutput
} from "jsr:@deno/dnt@0.41.3/transform";
export {
	build,
	type BuildOptions,
	type EntryPoint,
	type LibName,
	type PackageJson,
	type Shim,
	type ShimOptions,
	type SourceMapOptions,
	type SpecifierMappings,
	type TransformOutput
};
export type CompilerOptions = NonNullable<BuildOptions["compilerOptions"]>;
export type ScriptTarget = NonNullable<CompilerOptions["target"]>;
