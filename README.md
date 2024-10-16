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
  <code>api-docs-tooling</code> is a tool to generate API documentation of a Node.js project. <a href="https://github.com/nodejs/node/issues/52343">See this issue</a> for more information.
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

Local invocation:

```sh
$ npx api-docs-tooling --help
```

```sh
Usage: api-docs-tooling [options]

CLI tool to generate API documentation of a Node.js project.

Options:
  -i, --input [patterns...]  Specify input file patterns using glob syntax
  -o, --output <path>        Specify the relative or absolute output directory
  -v, --version <semver>     Specify the target version of Node.js, semver compliant (default: "v22.6.0")
  -c, --changelog <url>      Specify the path (file: or https://) to the CHANGELOG.md file (default: "https://raw.githubusercontent.com/nodejs/node/HEAD/CHANGELOG.md")
  -t, --target [mode...]     Set the processing target modes (choices: "json-simple", "legacy-html", "legacy-html-all", "man-page")
  -h, --help                 display help for command
```
