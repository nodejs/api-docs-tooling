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