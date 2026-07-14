# ESM `@actions/*` Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unblock the `@actions/core` (1.11.1→3.0.1) and `@actions/github` (6.0.1→9.1.1) Dependabot bumps, both of which are ESM-only in their new majors, without converting this CommonJS project to ESM.

**Architecture:** Load `@actions/core` and `@actions/github` via dynamic `import()` instead of static `import`. Compile the real build with `module: node16` (so `tsc` emits a real ESM-capable dynamic import that Node's loader can resolve against ESM-only packages) but compile tests with a separate `tsconfig.test.json` override using `module: commonjs` (so `tsc` downcompiles the dynamic import to `require()`, which Jest's `moduleNameMapper` can intercept and redirect to manual mocks — Jest's own resolver cannot resolve packages with no `require` condition in their `exports` map, so `jest.mock()` alone doesn't work here). `package.json` stays CommonJS throughout (no `"type": "module"`).

**Tech Stack:** TypeScript 5.9.3, ts-jest, Jest 30, `@vercel/ncc` 0.44.1, Node 20 (unchanged, `action.yml` still declares `using: node20`).

## Global Constraints

- Branch from current `origin/main` before starting Task 1, not from any stale local checkout — dependency state on `main` has moved during this investigation (e.g. `eslint` is now `^10.7.0` on `main` via merged PR #1149, `@typescript-eslint/eslint-plugin`/`parser` are now `^8.64.0` via merged PR #1152). Run `git fetch origin main && git log origin/main -1 --oneline` and branch from that commit.
- Do NOT add `"type": "module"` to `package.json` — this is the whole point of the minimal approach; a full ESM migration was explicitly rejected as too large in scope.
- Do NOT change `action.yml`'s `runs.using: "node20"` — neither new `@actions/*` major declares an `engines` requirement above Node 20.
- `npm ci`, `npm run build`, and `npm test` (the three CI-enforced steps in `.github/workflows/test.yml`) must all pass with zero flags/env vars beyond what's already in that workflow file. Do not add `NODE_OPTIONS=--experimental-vm-modules` anywhere — it was tested and rejected because it required changing the CI invocation; the `tsconfig.test.json` override avoids needing it.
- `dist/index.js` will no longer be single-file after this change — `ncc` code-splits at each dynamic-import boundary, producing `dist/index.js` plus per-chunk files (e.g. `dist/NNN.index.js`, exact numeric names are non-deterministic per-build). All emitted files under `dist/` must be committed, matching the existing pattern of committing `dist/` (confirmed via `git ls-files dist/`).
- Every new/modified file must pass `npm run build` (tsc) with zero errors — this project runs `"strict": true`.
- Existing test assertions and `describe`/`it` structure in `__tests__/main.test.ts` are unchanged — only the module-loading mechanics at the top of the file change (from `jest.mock('@actions/core')` module-level auto-mock relying on real resolution, to `moduleNameMapper` redirecting to manual mocks under `__mocks__/@actions/`). All 7 existing test cases must still pass with their original expectations intact.

---

### Task 1: Bump dependencies and confirm the ERESOLVE/build baseline

**Files:**
- Modify: `package.json:28-29` (dependencies block)

**Interfaces:**
- Produces: `@actions/core` at `^3.0.1`, `@actions/github` at `^9.1.1` in `package.json` dependencies — later tasks assume these versions are installed in `node_modules`.

- [ ] **Step 1: Update the dependency versions**

In `package.json`, change:

```json
  "dependencies": {
    "@actions/core": "^1.11.1",
    "@actions/github": "^6.0.0"
  },
```

to:

```json
  "dependencies": {
    "@actions/core": "^3.0.1",
    "@actions/github": "^9.1.1"
  },
```

- [ ] **Step 2: Install and confirm no peer conflicts**

Run: `npm install`
Expected: installs cleanly, no `ERESOLVE` errors (there are no peer-dependency constraints from these two packages on other project deps — confirmed during investigation). `package-lock.json` will be rewritten; that's expected and should be committed later.

- [ ] **Step 3: Confirm the expected-broken state**

Run: `npm run build`
Expected: **succeeds** (tsc's classic module resolution doesn't validate the ESM/CJS runtime boundary, so this compiles without error even though it will crash at runtime — this is the known trap, not a bug to fix in this task).

Run: `node lib/main.js` (after `npm run build`, without any env vars)
Expected: crashes with `Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined in .../node_modules/@actions/core/package.json` — this confirms the ESM-only runtime break exists before we fix it in Task 2. Do not attempt to fix this in this task.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(deps): bump @actions/core to 3.0.1 and @actions/github to 9.1.1"
```

---

### Task 2: Update `tsconfig.json` for real ESM-capable dynamic import, add `tsconfig.test.json`

**Files:**
- Modify: `tsconfig.json:5,6,22,41` (target, module, isolatedModules, moduleResolution)
- Create: `tsconfig.test.json`

**Interfaces:**
- Produces: `tsconfig.json` with `module: "node16"`, `moduleResolution: "node16"`, `target: "es2022"`, `isolatedModules: true` — this is what `npm run build` (plain `tsc`) uses.
- Produces: `tsconfig.test.json` extending `tsconfig.json` but overriding `module: "commonjs"`, `moduleResolution: "node"`, `isolatedModules: false`, and including `__tests__` — Task 4's `jest.config.js` will point `ts-jest` at this file.

- [ ] **Step 1: Edit `tsconfig.json`**

Change line 5 from:
```
    "target": "es6",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
```
to:
```
    "target": "es2022",                       /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
```

Change line 6 from:
```
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
```
to:
```
    "module": "node16",                       /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
```

Change line 22 from:
```
    // "isolatedModules": true,               /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */
```
to:
```
    "isolatedModules": true,                  /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */
```

Change line 41 from:
```
    // "moduleResolution": "node",            /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
```
to:
```
    "moduleResolution": "node16",             /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
```

Reasoning for each (do not skip any — TypeScript enforces `module`/`moduleResolution` must both be `node16` together, `es2022` target is required for `ErrorOptions`/newer lib types used transitively by `@octokit/*`, and `isolatedModules` is required by ts-jest when the real tsconfig uses a `node16`-family module kind):
- `target: es2022`: needed because `@octokit/request-error` (a transitive dep of `@actions/github`) uses the `ErrorOptions` type, which only exists in ES2022+ lib types. `es6` (ES2015) doesn't have it — confirmed this is the exact TS2304 error seen when investigating PR #1091 originally.
- `module: node16` + `moduleResolution: node16`: needed so `tsc` emits a real dynamic `import()` (not downcompiled to `require()`) for the real build, and so type resolution understands package `exports` maps like `@octokit/core`'s `./types` subpath export.
- `isolatedModules: true`: required by ts-jest whenever the effective `module` is a `node16`-family value; without it, ts-jest step in Task 4 will emit a `TS151002` warning (harmless but avoidable) — set here on the real build config for consistency, and required on the real build config regardless of ts-jest.

- [ ] **Step 2: Confirm main tsconfig.json final state**

The full compilerOptions block should read (comments preserved, only the four lines above changed):

```json
{
  "compilerOptions": {
    /* Basic Options */
    // "incremental": true,                   /* Enable incremental compilation */
    "target": "es2022",                       /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
    "module": "node16",                       /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    // "allowJs": true,                       /* Allow javascript files to be compiled. */
    // "checkJs": true,                       /* Report errors in .js files. */
    // "jsx": "preserve",                     /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
    // "declaration": true,                   /* Generates corresponding '.d.ts' file. */
    // "declarationMap": true,                /* Generates a sourcemap for each corresponding '.d.ts' file. */
    // "sourceMap": true,                     /* Generates corresponding '.map' file. */
    // "outFile": "./",                       /* Concatenate and emit output to single file. */
    "outDir": "./lib",                        /* Redirect output structure to the directory. */
    "rootDir": "./src",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "composite": true,                     /* Enable project compilation */
    // "tsBuildInfoFile": "./",               /* Specify file to store incremental compilation information */
    // "removeComments": true,                /* Do not emit comments to output. */
    // "noEmit": true,                        /* Do not emit outputs. */
    // "importHelpers": true,                 /* Import emit helpers from 'tslib'. */
    // "downlevelIteration": true,            /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
    "isolatedModules": true,                  /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

    /* Strict Type-Checking Options */
    "strict": true,                           /* Enable all strict type-checking options. */
    "noImplicitAny": false,                 /* Raise error on expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,              /* Enable strict null checks. */
    // "strictFunctionTypes": true,           /* Enable strict checking of function types. */
    // "strictBindCallApply": true,           /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    // "strictPropertyInitialization": true,  /* Enable strict checking of property initialization in classes. */
    // "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
    // "alwaysStrict": true,                  /* Parse in strict mode and emit "use strict" for each source file. */

    /* Additional Checks */
    // "noUnusedLocals": true,                /* Report errors on unused locals. */
    // "noUnusedParameters": true,            /* Report errors on unused parameters. */
    // "noImplicitReturns": true,             /* Report error when not all code paths in function return a value. */
    // "noFallthroughCasesInSwitch": true,    /* Report errors for fallthrough cases in switch statement. */

    /* Module Resolution Options */
    "moduleResolution": "node16",             /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    // "baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
    // "paths": {},                           /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
    // "rootDirs": [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */
    // "typeRoots": [],                       /* List of folders to include type definitions from. */
    // "types": [],                           /* Type declaration files to be included in compilation. */
    // "allowSyntheticDefaultImports": true,  /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */
    "esModuleInterop": true                   /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
    // "preserveSymlinks": true,              /* Do not resolve the real path of symlinks. */
    // "allowUmdGlobalAccess": true,          /* Allow accessing UMD globals from modules. */

    /* Source Map Options */
    // "sourceRoot": "",                      /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    // "mapRoot": "",                         /* Specify the location where debugger should locate map files instead of having a separate file. */
    // "inlineSourceMap": true,               /* Emit a single file with source maps instead of having a separate file. */
    // "inlineSources": true,                 /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

    /* Experimental Options */
    // "experimentalDecorators": true,        /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,         /* Enables experimental support for emitting type metadata for decorators. */
  },
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

- [ ] **Step 3: Create `tsconfig.test.json`**

Create `tsconfig.test.json` at the project root with this exact content:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "isolatedModules": false
  },
  "include": ["src", "__tests__"]
}
```

This overrides just enough to make `tsc`/ts-jest downcompile `await import(...)` to `require(...)` for the test build, which Jest's `moduleNameMapper` (Task 4) can then intercept — Jest's real module resolver cannot resolve `@actions/core`/`@actions/github` at all (no `require` condition in their `exports` maps), so the dynamic-import-as-real-ESM path used by the production build does not work inside Jest even with `testEnvironment: 'node'`.

- [ ] **Step 4: Verify `npm run build` still succeeds (source not yet updated, but config is)**

Run: `npm run build`
Expected: **fails** at this point with `TS1479: The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module and cannot be imported with 'require'. Consider writing a dynamic 'import("@actions/core")' call instead.` (and the same for `@actions/github`) — because `src/main.ts` still uses static `import * as core from '@actions/core'`, and static imports of an ESM-only package from a CJS-context TS file are rejected by the compiler under `module`/`moduleResolution: node16` (this is the correct, expected error; Task 3 fixes it by switching to dynamic import, exactly as the error message itself suggests).

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json tsconfig.test.json
git commit -m "build: configure tsconfig for ESM-capable dynamic import with a CJS test override"
```

---

### Task 3: Convert `src/main.ts` to dynamic import

**Files:**
- Modify: `src/main.ts` (whole file — remove the two top-of-file static imports, add two dynamic-import declarations as the first two lines inside `run()`, before its `try` block)

**Interfaces:**
- Consumes: nothing from earlier tasks (this is a source-only change).
- Produces: `run()` remains an exported `async function` with the same signature (`export async function run()`) and the same behavior — later tasks (mocks, tests) rely on `run` being callable the same way as before.

- [ ] **Step 1: Replace the two static imports with dynamic imports, declared before `try`**

Current top of file:
```typescript
import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run() {
  try {
```

New top of file — declare the dynamic imports **before** `try`, not inside it, because the `catch` block below also calls `core.setFailed(...)` and needs `core` in scope there too:
```typescript
export async function run() {
  const core = await import('@actions/core');
  const github = await import('@actions/github');
  try {
```

Do not change anything else in the function body — every existing usage (`core.getInput`, `core.setSecret`, `core.getBooleanInput`, `core.setFailed`, `github.context.issue`, `github.getOctokit`) already refers to `core`/`github` as local names, and `const core = await import(...)` / `const github = await import(...)` provide those same local names with the same shape (both packages export named functions directly, matching `import * as X` semantics via `esModuleInterop`).

The full updated file should read:

```typescript
export async function run() {
  const core = await import('@actions/core');
  const github = await import('@actions/github');
  try {
    const repoToken = core.getInput('repo-token', {required: true});
    const issue: {owner: string; repo: string; number: number} =
      github.context.issue;
    core.setSecret(repoToken);

    const pickOneFromPersonsOrTeam = core.getBooleanInput(
      'pick-one-from-persons-or-team',
      {required: false},
    );

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping');
      return;
    }

    // See https://octokit.github.io/rest.js/
    const client = github.getOctokit(repoToken);

    const includeDraft = core.getBooleanInput('include-draft', {
      required: false,
    });

    const pull = await client.rest.pulls.get({
      owner: issue.owner,
      repo: issue.repo,
      pull_number: issue.number,
    });

    // Skip DRAFT PRs
    if (pull.data.draft && !includeDraft) {
      console.log('Skipped: DRAFT Pull Request, not assigning PR.');
      return;
    }

    const skipWithNumberOfReviewers: number = Number(
      core.getInput('skip-with-manual-reviewers') || Number.MAX_VALUE,
    );
    const numberOfReviewers = pull.data.requested_reviewers?.length || 0;
    if (numberOfReviewers >= skipWithNumberOfReviewers) {
      console.log(
        'Skipped: Already ' +
          numberOfReviewers +
          ' assigned reviewers, not assigning PR.',
      );
      return;
    }

    const prAuthor = pull.data.user?.login;

    const teams = core
      .getInput('teams')
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    const persons = core
      .getInput('persons')
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0)
      // filter out PR creator
      .filter((user) => user !== prAuthor);

    if (teams.length === 0 && persons.length === 0) {
      console.log(
        'No eligible reviewers: teams and persons are empty ' +
          '(PR author is excluded from persons)',
      );
      return;
    }

    if (persons.length > 0) {
      console.log('Picking from: ' + persons);
      const reviewers = pickOneFromPersonsOrTeam
        ? [persons[Math.floor(Math.random() * persons.length)]]
        : persons;
      console.log('Adding person(s): ' + reviewers);

      const personResponse = await client.rest.pulls.requestReviewers({
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
        reviewers: reviewers,
      });
      console.log(
        'Request Status:' +
          personResponse.status +
          ', Persons: ' +
          personResponse?.data?.requested_reviewers
            ?.map((r) => r.login)
            .join(','),
      );
    }

    // Making sure that org is provided
    // if user turns on pick-one-from-persons-or-team
    // option and to use teams
    const org: string = core.getInput('org').trim();
    if (pickOneFromPersonsOrTeam && teams.length > 0 && !org) {
      core.setFailed(
        "Please specify 'org' if you want to " +
          'pick one from persons or teams and use Teams',
      );
      return;
    }

    if (teams.length > 0) {
      if (pickOneFromPersonsOrTeam) {
        // Picking out 1 person from first team listed
        console.log('Selecting from first team provided: ' + teams[0]);
        const members = await client.rest.teams.listMembersInOrg({
          org: org,
          team_slug: teams[0],
        });
        console.log(
          'Request Status for getting team members:' + members.status,
        );
        // filter out PR author
        const eligibleMembers = members.data
          .filter((user) => user.login !== prAuthor)
          .map((a) => a.login);
        console.log(
          'Picking reviewer from eligible members:',
          eligibleMembers,
        );

        if (eligibleMembers.length === 0) {
          console.log('No eligible team members to assign');
          return;
        }

        const person = [
          eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)],
        ];
        const personResponse = await client.rest.pulls.requestReviewers({
          owner: issue.owner,
          repo: issue.repo,
          pull_number: issue.number,
          reviewers: person,
        });

        console.log(
          'Request Status:' +
            personResponse.status +
            ', Person from First Team: ' +
            personResponse?.data?.requested_reviewers
              ?.map((r) => r.login)
              .join(','),
        );
      } else {
        console.log('Adding teams: ' + teams);
        const teamResponse = await client.rest.pulls.requestReviewers({
          owner: issue.owner,
          repo: issue.repo,
          pull_number: issue.number,
          team_reviewers: teams,
        });
        console.log(
          'Request Status:' +
            teamResponse.status +
            ', Teams: ' +
            teamResponse?.data?.requested_teams?.map((t) => t.slug).join(','),
        );
      }
    }
  } catch (error) {
    console.error(error);
    core.setFailed('Unknown error' + error);
    throw error;
  }
}

run();
```

- [ ] **Step 2: Attempt build (expected to still fail — mocks/tests not updated yet)**

Run: `npm run build`
Expected: **succeeds** — `src/main.ts` now compiles cleanly under `module: node16`/`moduleResolution: node16`, since dynamic `import()` of an ESM-only package from CJS-context TS is allowed (only *static* `import` of ESM-only packages is rejected by the compiler).

- [ ] **Step 3: Verify real runtime works end-to-end**

Run: `npm run build` then:

```bash
GITHUB_REPOSITORY=owner/repo GITHUB_EVENT_NAME=pull_request GITHUB_EVENT_PATH=/tmp/fake-event.json INPUT_REPO-TOKEN=faketoken INPUT_PERSONS=someuser node lib/main.js
```

First create the fake event file:
```bash
node -e "require('fs').writeFileSync('/tmp/fake-event.json', JSON.stringify({pull_request: {number: 1}, repository: {owner: {login: 'owner'}, name: 'repo'}}))"
```

Expected: no `ERR_PACKAGE_PATH_NOT_EXPORTED` or `ERR_MODULE_NOT_FOUND` crash. The script will attempt a real HTTP call to `api.github.com` with a fake token and fail with an HTTP 401/404 from Octokit (visible as a normal thrown API error, not a module-resolution error) — that HTTP failure is expected and fine; it proves both `@actions/core` and `@actions/github` loaded successfully via dynamic import at real Node runtime. Do not attempt to give it a real token.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "refactor: load @actions/core and @actions/github via dynamic import"
```

---

### Task 4: Add manual mocks and update Jest config

**Files:**
- Create: `__mocks__/@actions/core.ts`
- Create: `__mocks__/@actions/github.ts`
- Modify: `jest.config.js` (add `moduleNameMapper`, point `ts-jest` transform at `tsconfig.test.json`)

**Interfaces:**
- Consumes: `tsconfig.test.json` from Task 2 (path `tsconfig.test.json`, relative to project root).
- Produces: `__mocks__/@actions/core.ts` exporting jest-mocked functions named exactly `getInput`, `getBooleanInput`, `setFailed`, `setSecret` (matching every `core.*` call site used in `src/main.ts` and asserted on in `__tests__/main.test.ts`).
- Produces: `__mocks__/@actions/github.ts` exporting `context` (a mutable `let`, not `const` — the existing test reassigns `github.context` wholesale via `(github.context as any) = {...}`) and `getOctokit` (a jest mock).

- [ ] **Step 1: Create `__mocks__/@actions/core.ts`**

```typescript
export const getInput = jest.fn();
export const getBooleanInput = jest.fn();
export const setFailed = jest.fn();
export const setSecret = jest.fn();
```

Only these four are used by `src/main.ts` (confirmed by grep: `getInput`, `setSecret`, `getBooleanInput`, `setFailed` — no other `core.*` calls exist in the file).

- [ ] **Step 2: Create `__mocks__/@actions/github.ts`**

```typescript
export let context: any = {};
export const getOctokit = jest.fn();
```

`context` must be `let`, not `const` — `__tests__/main.test.ts`'s `setupMocks` function does `(github.context as any) = {issue: {...}};`, a full reassignment of the exported binding, which requires a mutable `let` export. `getOctokit` is the only other `github.*` member used in `src/main.ts`.

- [ ] **Step 3: Update `jest.config.js`**

Current content:
```javascript
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.claude/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}
```

New content:
```javascript
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.claude/'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}]
  },
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/__mocks__/@actions/core.ts',
    '^@actions/github$': '<rootDir>/__mocks__/@actions/github.ts'
  },
  verbose: true
}
```

Only two changes: the `transform` value's `ts-jest` entry becomes a tuple with `{tsconfig: 'tsconfig.test.json'}`, and a new `moduleNameMapper` block is added. Nothing else changes.

`__tests__/main.test.ts` itself needs NO changes — `jest.mock('@actions/core')` and `jest.mock('@actions/github')` (lines 4-5) continue to work as before: `jest.mock(...)` still needs to be called for `clearMocks`/`jest.clearAllMocks()` bookkeeping to reset the mocks between tests, and because `moduleNameMapper` already redirects the module specifier to the manual mock file, Jest treats that manual mock as the module implementation directly (no auto-mocking needed, and none of the `jest.MockedFunction` casts on `core.getInput` etc. change, since the manual mock's `getInput` is already `jest.fn()`).

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all 7 existing test cases in `__tests__/main.test.ts` pass (`Team`, `Reviewer`, `Draft PR` × 2, `PR author filtering`, `Empty inputs`, `Skip with manual reviewers`). No `Cannot find module` errors, no `TypeError: A dynamic import callback was invoked without --experimental-vm-modules` errors, no flags/env vars needed on the `npm test` invocation itself.

If you see `jest-haste-map: duplicate manual mock found` mentioning both a `.ts` and `.js` file under `__mocks__/@actions/`: a stale compiled `.js` artifact exists under `__mocks__/` from a previous `tsc` run with the wrong `outDir`/`rootDir` scope. Delete the stray `.js` file (do not delete the `.ts` source) and rerun — this should not happen if `tsconfig.json`'s `rootDir: "./src"` / Task 2's `tsconfig.test.json` `include: ["src", "__tests__"]` are set correctly, since `__mocks__/` is not part of either config's `include`/`rootDir` and thus never gets compiled by `tsc` directly (only by `ts-jest`, in-memory, when Jest loads it as a mock).

- [ ] **Step 5: Commit**

```bash
git add __mocks__/@actions/core.ts __mocks__/@actions/github.ts jest.config.js
git commit -m "test: mock @actions/core and @actions/github via moduleNameMapper"
```

---

### Task 5: Rebuild `dist/`, run the full verification sequence, commit the multi-chunk bundle

**Files:**
- Modify: `dist/index.js`, `dist/index.js.map` (regenerated)
- Create: `dist/<chunk>.index.js` (one or more new chunk files — exact filenames are non-deterministic per `ncc`/webpack build, determined at build time)
- No change needed to: `dist/licenses.txt`, `dist/sourcemap-register.js` (regenerated but same purpose)

**Interfaces:**
- Consumes: `lib/main.js`, the compiled output of Task 3's `src/main.ts` (produced by `npm run build`).
- Produces: a working `dist/index.js` entry point that `action.yml`'s `main: "dist/index.js"` continues to reference correctly — chunk files are loaded relative to `index.js` automatically by the bundle's own runtime, no `action.yml` change needed.

- [ ] **Step 1: Full clean rebuild**

```bash
rm -rf lib dist
npm run build
npm run package
```

Expected: `npm run build` succeeds silently (no tsc errors). `npm run package` runs `ncc build lib/main.js --source-map --license licenses.txt` and succeeds, printing a build summary listing multiple output files (an `index.js` around 10-15kB plus one or more numbered chunk files, likely 1-2MB combined, since `@actions/github`'s Octokit dependency tree is large) — do not treat multiple listed files as a failure; this is the expected code-splitting behavior from dynamic imports, and was reproduced identically in a throwaway probe using these exact two package versions.

- [ ] **Step 2: Inspect and confirm dist/ contents**

```bash
ls -la dist/
```

Expected: `dist/index.js`, `dist/index.js.map`, `dist/licenses.txt`, `dist/sourcemap-register.js` (all four existed before), plus one or more new files matching a pattern like `dist/<number>.index.js` (new — did not exist before this change).

- [ ] **Step 3: Verify the packaged bundle actually runs**

```bash
node -e "require('fs').writeFileSync('/tmp/fake-event.json', JSON.stringify({pull_request: {number: 1}, repository: {owner: {login: 'owner'}, name: 'repo'}}))"
GITHUB_REPOSITORY=owner/repo GITHUB_EVENT_NAME=pull_request GITHUB_EVENT_PATH=/tmp/fake-event.json INPUT_REPO-TOKEN=faketoken INPUT_PERSONS=someuser node dist/index.js
```

Expected: same result as Task 3 Step 3 — no module-resolution crash; it should reach and fail on the real Octokit HTTP call with a fake token (401/404-style API error), proving the bundled multi-chunk output correctly loads both ESM-only packages via their dynamic imports at runtime, exactly like the unbundled `lib/main.js` did.

- [ ] **Step 4: Run the exact CI sequence from `.github/workflows/test.yml`**

```bash
npm ci
npm run build
npm test
```

Expected: all three succeed with zero errors — this is the literal sequence GitHub Actions runs (see `.github/workflows/test.yml:20-22`). Do not add any environment variables or flags to these three commands; if any of them requires an env var or flag beyond what's already used elsewhere in this plan's verification steps, stop and reconsider the design rather than patching the workflow file, since PR review will run exactly this sequence with no modifications.

- [ ] **Step 5: Run lint as a bonus sanity check (not CI-enforced, but should not be broken further by this change)**

```bash
npm run lint
```

Neither `format-check` nor `lint` runs in CI (confirmed: `.github/workflows/test.yml` only runs `npm ci`, `npm run build`, `npm test`). Do not run `npm run format-check` as a gate here — it already fails against this project's unmodified `src/main.ts` on `main` before any change in this plan (verified: `npx prettier --check src/main.ts` on a clean `main` checkout reports formatting issues, unrelated to this task — the file's existing single-quote style doesn't match this project's installed Prettier 3.9.5 defaults, which prefer double quotes absent a `.prettierrc`). Fixing that is out of scope for this plan.

Expected for `npm run lint`: as of this plan's writing, `origin/main` has `eslint@^10.7.0` (merged via PR #1149), which fails `npm run lint` with `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` regardless of anything in this plan — ESLint 9+ requires flat config and this repo still uses `.eslintrc.yml`. That failure is pre-existing on `main` before this plan's branch starts and is out of scope here (already tracked separately). If `package.json`'s `eslint` version has since changed, re-check with `grep '"eslint"' package.json` — only treat `lint` as a regression if it fails differently than this pre-existing flat-config error.

- [ ] **Step 6: Commit**

```bash
git add dist/
git commit -m "build: rebuild dist/ for dynamic-import @actions/core and @actions/github"
```
