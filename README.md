<p align="center">
  <br />
  <a href="https://nodejs.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://nodejs.org/static/logos/nodejsLight.svg">
      <img src="https://nodejs.org/static/logos/nodejsDark.svg" width="200px" alt="Node.js Logo">
    </picture>
  </a>
</p>

<p align="center">
  <code>api-docs-tooling</code> is a tool to generate API documentation of Node.js. <a href="https://github.com/nodejs/node/issues/52343">See this issue</a> for more information.
</p>

<p align="center">
  <a title="MIT License" href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </a>
  <a href="https://codecov.io/gh/nodejs/api-docs-tooling" >
    <img src="https://codecov.io/gh/nodejs/api-docs-tooling/graph/badge.svg?token=TZRUKKDICU"/>
  </a>
  <a title="scorecard" href="https://securityscorecards.dev/viewer/?uri=github.com/nodejs/api-docs-tooling">
    <img src="https://api.securityscorecards.dev/projects/github.com/nodejs/api-docs-tooling/badge" alt="api-docs-tooling scorecard badge" />
  </a>
  <a href="https://www.bestpractices.dev/projects/29">
    <img src="https://www.bestpractices.dev/projects/29/badge">
  </a>
</p>

## Usage

Local invocation:

```sh
$ npx api-docs-tooling --help
```

```
Usage: api-docs-tooling [options] [command]

CLI tool to generate and lint Node.js API documentation

Options:
  -h, --help          display help for command

Commands:
  generate [options]  Generate API docs
  lint [options]      Run linter independently
  interactive         Launch guided CLI wizard
  list <types>        List the given type
  help [command]      display help for command
```

### `generate`

```
Usage: api-docs-tooling generate [options]

Generate API docs

Options:
  -i, --input <patterns...>  Input file patterns (glob)
  --ignore [patterns...]     Ignore patterns (comma-separated)
  -o, --output <dir>         Output directory
  -p, --threads <number>      (default: "12")
  -v, --version <semver>     Target Node.js version (default: "v22.14.0")
  -c, --changelog <url>      Changelog URL or path (default: "https://raw.githubusercontent.com/nodejs/node/HEAD/CHANGELOG.md")
  --git-ref <url>            Git ref/commit URL (default: "https://github.com/nodejs/node/tree/HEAD")
  -t, --target [modes...]    Target generator modes (choices: "json-simple", "legacy-html", "legacy-html-all", "man-page", "legacy-json", "legacy-json-all", "addon-verify", "api-links", "orama-db", "llms-txt")
  --no-lint                  Skip lint before generate
  -h, --help                 display help for command
```

### `lint`

```
Usage: api-docs-tooling lint [options]

Run linter independently

Options:
  -i, --input <patterns...>  Input file patterns (glob)
  --ignore [patterns...]     Ignore patterns (comma-separated)
  --disable-rule [rules...]  Disable linter rules (choices: "duplicate-stability-nodes", "invalid-change-version", "missing-introduced-in")
  --dry-run                  Dry run mode (default: false)
  -r, --reporter <reporter>  Linter reporter to use
  -h, --help                 display help for command
```

### `interactive`

```
Usage: api-docs-tooling interactive [options]

Launch guided CLI wizard

Options:
  -h, --help  display help for command
```

### `list`

```
Usage: api-docs-tooling list [options] <types>

List the given type

Arguments:
  types       The type to list (choices: "generators", "rules", "reporters")

Options:
  -h, --help  display help for command
```
