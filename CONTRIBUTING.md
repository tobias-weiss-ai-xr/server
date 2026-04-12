# Contributing to World-Office

Thanks for your interest. This guide covers how to report bugs, submit changes, and follow project conventions.

## Reporting Bugs

1. Search existing issues on [Codeberg](https://codeberg.org/World-Office/server/issues) first.
2. Open a new issue using the bug report template.
3. Include: steps to reproduce, expected vs. actual behavior, OS, version, and logs if available.
4. One issue per report. Don't bundle unrelated problems.

## Setting Up

```sh
git clone git@codeberg.org:<your-username>/server.git
cd server
pnpm install
pnpm build
cargo build --workspace
```

## Submitting Changes

### Branches

Create a descriptive branch from `main`:

```sh
git checkout -b fix/document-parse-error main
```

Keep branches focused on one concern.

### Commit Messages

Use conventional commit format:

```
feat: add XLSX export support
fix: resolve page break rendering in tables
docs: update API reference for format module
refactor: simplify font lookup in core engine
test: add property tests for ODF parser
chore: update Cargo dependencies
```

The prefix tells reviewers what kind of change to expect. The subject line should be concise and lowercase.

### Pull Requests

1. Push your branch to your fork.
2. Open a PR against `main`.
3. Describe what the PR does and why. Link related issues.
4. Keep PRs small and focused.
5. All PRs require tests for new behavior or bug fixes.
6. A maintainer will review. Be ready to iterate.

## Coding Standards

### Rust (core engine, services)

- Run `cargo fmt --all` before committing.
- Run `cargo clippy --workspace -- -D warnings` and fix all findings.
- Follow standard Rust naming conventions and idioms.
- Document public APIs with `///` doc comments.
- Write tests alongside code. Run the full suite with `cargo test --workspace`.

### TypeScript / React (web UI)

- Follow the existing ESLint/Biome configuration in the repo.
- Use TypeScript strict mode. Avoid `any`.
- Components go in `apps/`, shared packages in `packages/`.
- Prefer functional components with hooks.

### General

- All code comments and commit messages in English.
- Match the style of surrounding code when in doubt.
- No binary blobs, minified files, or obfuscated code.

## Testing

Rust tests:

```sh
cargo test --workspace
```

TypeScript tests:

```sh
pnpm test
```

All PRs must pass CI, which runs both suites.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
