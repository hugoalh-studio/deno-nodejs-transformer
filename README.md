# Deno NodeJS Transformer

[**⚖️** MIT](./LICENSE.md)

🔗
[DistBoard @hugoalh](https://hugoalh.github.io/distboard/deno_nodejs_transformer)
● [GitHub](https://github.com/hugoalh/deno-nodejs-transformer)
● [JSR](https://jsr.io/@hugoalh/deno-nodejs-transformer)

Transform Deno code to NodeJS code.

Currently, this is a modified edition of the [Deno DNT](https://github.com/denoland/dnt) which:

- Force with ECMAScript
- Improve file structure
- Unify configuration

| **Support** | **D.N.T.** | **[Deno DNT](https://github.com/denoland/dnt)** | **[`deno pack`](https://docs.deno.com/runtime/reference/cli/pack)** | **[`deno transpile`](https://docs.deno.com/runtime/reference/cli/transpile)** | **[TypeScript Compiler `tsc`](https://www.typescriptlang.org)** |
|:--|:-:|:-:|:-:|:-:|:-:|
| Resolve JSR depends | ✔️ | ✔️ | ⚠️ Only JSR NPM compatibility layer | ⚠️ Only JSR NPM compatibility layer | ❌ |
| Resolve remote depends | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |
| Shim `Deno` | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |
| Polyfills | ✔️ Full control | ✔️ Full control | ✔️ By target | ✔️ By target | ✔️ By target |
| Entrypoints for executables | ✔️ | ✔️ | ❌ | ❌ | N/A |
| Output CommonJS | ❌ | ✔️ | ❌ | ❌ | ✔️ |
| Output UMD | ❌ | ✔️ | ❌ | ❌ | ✔️ |
| Output declaration (`.d.ts`) | ✔️ Only beside | ✔️ | ✔️ | ✔️ | ✔️ |
| Output source map (`.d.ts.map`) | ✔️ | ⚠️ Also output source | ✔️ | ✔️ | ✔️ |
| Type check | ❌ | ✔️ | ❌ | ❌ | ✔️ |
| Test | ❌ | ✔️ | ❌ | ❌ | ❌ |

## ▶️ Begin - Deno

- **[Deno](https://deno.land/)** >= v2.9.0

### 🛡️ Runtime Permissions

- Environment Variable (`env`)
- File System - Read (`read`)
- File System - Write (`write`)
- Network (`net`)

### #️⃣ Entrypoints

| **Name** | **Path** | **Description** |
|:--|:--|:--|
| `.` | `./mod.ts` | Default. |

> [!NOTE]
> - These are not part of the public APIs hence should not be used:
>   - Benchmark/Test file (e.g.: `example.bench.ts`, `example.test.ts`).
>   - Entrypoint name or path include any underscore prefix (e.g.: `_example.ts`, `foo/_example.ts`).
>   - Identifier/Namespace/Symbol include any underscore prefix (e.g.: `_example`, `Foo._example`).

### 🧩 APIs

- ```ts
  function transform(options: TransformOptions): Promise<void>;
  ```
- ```ts
  interface TransformOptions {
    copyEntries?: readonly (string | RegExp | TransformCopyEntriesOptions)[];
    entrypointsExecutable?: Record<string, string>;
    entrypointsScript?: Record<string, string>;
    fixDenoDNTModifications?: boolean;
    generateDeclaration?: boolean;
    generateDeclarationMap?: boolean;
    importsMap?: string;
    lib?: LibName[];
    mappings?: SpecifierMappings;
    metadata: Metadata;
    outputDirectory?: string;
    outputDirectoryPreEmpty?: boolean;
    polyfills?: PolyfillOptions;
    shims?: TransformShimOptions;
    target?: ScriptTarget;
    useTSLibHelper?: boolean;
    workspace?: string;
  }
  ```

> [!NOTE]
> - For the full or prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/doc)
>   - [JSR](https://jsr.io/@hugoalh/deno-nodejs-transformer)

### ✍️ Examples

- ```ts
  await transform({
    copyEntries: [
      /^LICENSE(?:[-\._][^\/\\]+)?\.md$/i,
      /^README(?:[-\._][^\/\\]+)?\.md$/i
    ],
    entrypointsScript: {
      ".": "./mod.ts"
    },
    metadata: {
      name: "@hugoalh/deno-nodejs-transformer-test",
      version: "0.8.0",
      description: "Demo of Deno NodeJS Transformer.",
      keywords: [
        "test"
      ],
      homepage: "https://github.com/hugoalh/deno-nodejs-transformer#readme",
      bugs: {
        url: "https://github.com/hugoalh/deno-nodejs-transformer/issues"
      },
      license: "MIT",
      author: "hugoalh",
      repository: {
        type: "git",
        url: "git+https://github.com/hugoalh/deno-nodejs-transformer.git"
      },
      private: false,
      publishConfig: {
        access: "public"
      }
    },
    outputDirectory: "dist/npm",
    outputDirectoryPreEmpty: true
  });
  ```
