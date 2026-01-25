# Project instructions for agents

The first thing to check is `./README.md`
The project is using `bun` as runtime, package manager and test runner
The project is using `tsgo` instead of `tsc`
The project consist of multiple packages:
 - web/
 - server/
 - packages/*

Respect package roots when running commands or starting LSP

# Typescript rules

Use only erasable syntax, use verbatim module syntax.
Never use `private` ,`protected` and `public` keywords. Whenever private should
be used, only use `#`
