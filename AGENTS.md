# Testing

- **Runner**: Bun's built-in test runner (`bun:test`) from within specific package
- **File convention**: `*.spec.ts` co-located with source files (not `.test.ts`)

# Tasks implementation

1. Follow instructions for the task
2. Write code with any formatting, rely on `bun format` after to fix it
3. Run `tsgo` and `bun test` after for verifications
4. Always use `bun` and never other runtimes, package managers
