# Deno NodeJS Transformer

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh-studio/deno-nodejs-transformer](https://img.shields.io/github/v/release/hugoalh-studio/deno-nodejs-transformer?label=hugoalh-studio/deno-nodejs-transformer&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh-studio/deno-nodejs-transformer")](https://github.com/hugoalh-studio/deno-nodejs-transformer)

A Deno module for transform Deno package to NodeJS package.

This is a modified edition of the JSR package [`dnt`](https://jsr.io/@deno/dnt) which aim for:

- Always ModuleJS
- Improve file structure
- Unify configuration

## 🔰 Begin

### 🎯 Targets

|  | **HTTP** | **HTTPS** |
|:--|:--|:--|
| **[Deno](https://deno.land/)** >= v1.46.0 | ❌ | ✔️ |

> [!NOTE]
> - It is possible to use the module in other methods/ways which not listed in here, however those methods/ways are not officially supported, and should beware maybe cause security issues.

### #️⃣ Resources Identifier

- **HTTPS - GitHub Raw:**
  ```
  https://raw.githubusercontent.com/hugoalh-studio/deno-nodejs-transformer/{Tag}/mod.ts
  ```

> [!NOTE]
> - It is recommended to import the entire module with the main path `mod.ts`, however it is also able to import part of the module with sub path if available, but do not import if:
>
>   - it's path has an underscore prefix (e.g.: `_foo.ts`, `_util/bar.ts`), or
>   - it is a benchmark or test file (e.g.: `foo.bench.ts`, `foo.test.ts`), or
>   - it's symbol has an underscore prefix (e.g.: `_bar`, `_foo`).
>
>   These elements are not considered part of the public API, thus no stability is guaranteed for them.

### 🛡️ Require Runtime Permissions

- [Deno](https://docs.deno.com/runtime/fundamentals/security/)
  - File System - Read (`read`)
    - *Resources*
  - File System - Write (`write`)
    - *Resources*
  - Network (`net`)
    - *Resources*

## 🧩 APIs

> [!NOTE]
> - For the prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/documentation_generator/)

## ✍️ Examples
