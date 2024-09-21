import { invokeDenoNodeJSTransformer } from "./mod.ts";
await invokeDenoNodeJSTransformer({
	entrypoints: [{
		name: ".",
		path: "mod.ts"
	}],
	metadata: {
		name: "@hugoalh/deno-nodejs-transformer-test",
		version: "0.1.0",
		description: "Demo of Deno NodeJS Transformer.",
		keywords: [
			"dnt",
			"test"
		],
		homepage: "https://github.com/hugoalh-studio/deno-nodejs-transformer#readme",
		bugs: {
			url: "https://github.com/hugoalh-studio/deno-nodejs-transformer/issues"
		},
		license: "MIT",
		author: "hugoalh",
		repository: {
			type: "git",
			url: "git+https://github.com/hugoalh-studio/deno-nodejs-transformer.git"
		},
		scripts: {
		},
		engines: {
			node: ">=16.13.0"
		},
		private: false,
		publishConfig: {
			access: "public"
		}
	},
	outputDirectory: "npm",
	outputDirectoryPreEmpty: true
});
