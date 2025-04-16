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
   <a title="scorecard" href="https://securityscorecards.dev/viewer/?uri=github.com/nodejs/api-docs-tooling">
    <img src="https://api.securityscorecards.dev/projects/github.com/nodejs/api-docs-tooling/badge" alt="api-docs-tooling scorecard badge" />
  </a>
</p>

## Usage

### `help`

```sh
npx api-docs-tooling help [command]
```

### `generate`

Generate API documentation from Markdown files.

```sh
npx api-docs-tooling generate [options]
```

**Options:**

- `-i, --input <patterns...>` Input file patterns (glob)
- `--ignore [patterns...]` Files to ignore
- `-o, --output <dir>` Output directory
- `-v, --version <semver>` Target Node.js version (default: latest)
- `-c, --changelog <url>` Changelog file or URL
- `--git-ref <url>` Git ref/commit URL
- `-t, --target [modes...]` Generator target(s): `json-simple`, `legacy-html`, etc.
- `--no-lint` Skip linting before generation

### `lint`

Run the linter on API documentation.

```sh
npx api-docs-tooling lint [options]
```

**Options:**

- `-i, --input <patterns...>` Input file patterns (glob)
- `--ignore [patterns...]` Files to ignore
- `--disable-rule [rules...]` Disable specific linting rules
- `--dry-run` Run linter without applying changes
- `-r, --reporter <reporter>` Reporter format: `console`, `github`, etc.

### `interactive`

Launches a fully interactive CLI prompt to guide you through all available options.

```sh
npx api-docs-tooling interactive
```

### `list`

See available modules for each subsystem.

```sh
npx api-docs-tooling list generators
npx api-docs-tooling list rules
npx api-docs-tooling list reporters
```
