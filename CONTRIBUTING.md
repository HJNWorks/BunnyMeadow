# Contributing to Bunny Meadow

Thanks for your interest. This is a source-available project (see [LICENSE](LICENSE)):
you may read the source and propose changes by pull request. Merged contributions are
assigned to the project.

## Local setup

Requires Node 20+. Commands use PowerShell syntax.

```powershell
npm ci        # install exact dependencies
npm run dev   # local dev server
npm run build # full build gate; must pass before a PR merges
```

`npm run build` chains the content checks (`check:path`, `check:jumps`, `check:endless`),
a TypeScript no-emit pass, and the Vite build. CI runs the same command.

## Branch and PR flow

- Branch from `main` with a short-lived feature branch.
- Keep PRs small and focused on one iteration item.
- CI must be green before merge. `main` stays deployable and auto-ships to GitHub Pages.
- Update the relevant docs in the same PR. Start at [docs/README.md](docs/README.md).

## Commit messages (Conventional Commits)

Format: `type(scope): summary`.

- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `chore`, `build`, `ci`.
- Scopes: `meadow`, `story`, `tasks`, `endless`, `core`, `data`, `render`, `ci`, `docs`.
- Summary in the imperative, lower case, no trailing period.

Examples:

```
feat(endless): seeded biome route walker
fix(endless): start input bus so keys move the rabbit
docs(universe): add biome graph
```

A local `commit-msg` hook and a CI check enforce this format. See
[commitlint.config.js](commitlint.config.js).

## Versioning

Semantic versioning, pre-1.0 while in development. Record changes under Unreleased in
[CHANGELOG.md](CHANGELOG.md). Tag a version after a track of work (for example I1-I4),
not after every iteration. Minor for a new track, patch for fixes.

## Contribution terms

By submitting a contribution you assign your rights in it to the project, or grant the
project a perpetual, worldwide, irrevocable, royalty-free license where assignment is
not permitted by law. You confirm you have the right to contribute the work. Full terms
are in [LICENSE](LICENSE).
