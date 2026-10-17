# Testing

- **Runner**: Bun's built-in test runner (`bun:test`) from within specific package
- **File convention**: `*.spec.ts` co-located with source files (not `.test.ts`)

# Tasks implementation

1. Follow instructions for the task
2. Write code with any formatting, rely on `bun format` after to fix it
3. After the final changes, run `bun run format`, `bun run check`, and `bun run types` from the repository root, then run `bun test` from each affected package. All checks are required before completing a task; formatting does not replace `bun run check`.
4. Always use `bun` and never other runtimes, package managers
5. Fix verification failures caused by your changes and rerun the failed checks. In the final response, report the verification results and explicitly identify any check that could not be run or still fails.
