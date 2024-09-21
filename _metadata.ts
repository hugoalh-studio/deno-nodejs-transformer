import type { MetadataEntrypoints } from "./_entrypoints.ts";
import { sortObject } from "./_sort_object.ts";
export interface MetadataBugs {
	email?: string;
	url?: string;
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
	/**
	 * Name of the package.
	 */
	name: string;
	/**
	 * Version of the package.
	 */
	version: string;
	/**
	 * Description of the package.
	 */
	description?: string;
	/**
	 * Keywords of the package.
	 */
	keywords?: string[];
	/**
	 * Homepage of the package.
	 */
	homepage?: string;
	/**
	 * Where to report package issue.
	 * 
	 * If only provide an URL, can use `string` instead.
	 */
	bugs?: string | MetadataBugs;
	/**
	 * License {@link https://spdx.org/licenses SPDX} expression/ID of the package.
	 */
	license?: string;
	/**
	 * Author of the package.
	 */
	author?: string | MetadataPerson;
	/**
	 * Contributors of the package.
	 */
	contributors?: (string | MetadataPerson)[];
	/**
	 * Fundings of the package.
	 */
	funding?: string | MetadataFunding | (string | MetadataFunding)[];
	/**
	 * Files of the package.
	 */
	files?: string[];
	/**
	 * Repository of the package.
	 */
	repository?: string | MetadataRepository;
	/**
	 * Scripts of the package.
	 */
	scripts?: { [name: string]: string; };
	/**
	 * Dependencies of the package.
	 */
	dependencies?: { [name: string]: string; };
	/**
	 * Development dependencies of the package.
	 */
	devDependencies?: { [name: string]: string; };
	/**
	 * Peer dependencies of the package.
	 */
	peerDependencies?: { [name: string]: string; };
	/**
	 * Bundle dependencies of the package.
	 */
	bundleDependencies?: { [name: string]: string; };
	/**
	 * Optional dependencies of the package.
	 */
	optionalDependencies?: { [name: string]: string; };
	/**
	 * Engines/Runtimes restriction of the package.
	 */
	engines?: { [name: string]: string; };
	/**
	 * OS restriction of the package.
	 */
	os?: string[];
	/**
	 * CPU restriction of the package.
	 */
	cpu?: string[];
	/**
	 * Whether this package is private.
	 */
	private?: boolean;
	[name: string]: unknown;
}
const metadataKeysDefaultSort: string[] = [
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
	"private",
	"publishConfig"
];
export interface RefactorMetadataParameters {
	entrypoints: MetadataEntrypoints;
	metadataIndentation?: number | string;
	metadataKeysSort?: string[];
	metadataPath: string;
}
export async function refactorMetadata({
	entrypoints,
	metadataIndentation = "\t",
	metadataKeysSort = metadataKeysDefaultSort,
	metadataPath
}: RefactorMetadataParameters): Promise<void> {
	const metadata = JSON.parse(await Deno.readTextFile(metadataPath));
	await Deno.writeTextFile(metadataPath, JSON.stringify(sortObject({
		...metadata,
		...entrypoints,
		type: "module"
	}, { orderSpecifyKeys: metadataKeysSort }), undefined, metadataIndentation));
}
