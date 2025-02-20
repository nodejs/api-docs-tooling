#!/usr/bin/env node

import { resolve } from 'node:path';
import { argv, exit } from 'node:process';

import { Command, Option } from 'commander';

import { coerce } from 'semver';
import { DOC_NODE_CHANGELOG_URL, DOC_NODE_VERSION } from '../src/constants.mjs';
import createGenerator from '../src/generators.mjs';
import generators from '../src/generators/index.mjs';
import createMarkdownLoader from '../src/loaders/markdown.mjs';
import createMarkdownParser from '../src/parsers/markdown.mjs';
import createNodeReleases from '../src/releases.mjs';
import { Linter } from '../src/linter/index.mjs';
import reporters from '../src/linter/reporters/index.mjs';

const availableGenerators = Object.keys(generators);

const program = new Command();

program
  .name('api-docs-tooling')
  .description('CLI tool to generate API documentation of a Node.js project.')
  .addOption(
    new Option(
      '-i, --input [patterns...]',
      'Specify input file patterns using glob syntax'
    ).makeOptionMandatory()
  )
  .addOption(
    new Option(
      '-o, --output <path>',
      'Specify the relative or absolute output directory'
    ).makeOptionMandatory()
  )
  .addOption(
    new Option(
      '-v, --version <semver>',
      'Specify the target version of Node.js, semver compliant'
    ).default(DOC_NODE_VERSION)
  )
  .addOption(
    new Option(
      '-c, --changelog <url>',
      'Specify the path (file: or https://) to the CHANGELOG.md file'
    ).default(DOC_NODE_CHANGELOG_URL)
  )
  .addOption(
    new Option(
      '-t, --target [mode...]',
      'Set the processing target modes'
    ).choices(availableGenerators)
  )
  .addOption(new Option('--skip-linting', 'Skip linting').default(false))
  .addOption(
    new Option('-r, --reporter [reporter]', 'Specify the linter reporter')
      .choices(Object.keys(reporters))
      .default('console')
  )
  .parse(argv);

/**
 * @typedef {keyof generators} Target A list of the available generator names.
 *
 * @typedef {Object} Options
 * @property {Array<string>|string} input Specifies the glob/path for input files.
 * @property {string} output Specifies the directory where output files will be saved.
 * @property {Target[]} target Specifies the generator target mode.
 * @property {string} version Specifies the target Node.js version.
 * @property {string} changelog Specifies the path to the Node.js CHANGELOG.md file
 * @property {boolean} skipLinting Specifies whether to skip linting
 * @property {keyof reporters} reporter Specifies the linter reporter
 *
 * @name ProgramOptions
 * @type {Options}
 * @description The return type for values sent to the program from the CLI.
 */
const {
  input,
  output,
  target = [],
  version,
  changelog,
  skipLinting,
  reporter,
} = program.opts();

const linter = skipLinting ? undefined : new Linter();

const { loadFiles } = createMarkdownLoader();
const { parseApiDocs } = createMarkdownParser();

const apiDocFiles = loadFiles(input);

const parsedApiDocs = await parseApiDocs(apiDocFiles);

const { runGenerators } = createGenerator(parsedApiDocs);

// Retrieves Node.js release metadata from a given Node.js version and CHANGELOG.md file
const { getAllMajors } = createNodeReleases(changelog);

linter?.lintAll(parsedApiDocs);

await runGenerators({
  // A list of target modes for the API docs parser
  generators: target,
  // Resolved `input` to be used
  input: input,
  // Resolved `output` path to be used
  output: resolve(output),
  // Resolved SemVer of current Node.js version
  version: coerce(version),
  // A list of all Node.js major versions with LTS status
  releases: await getAllMajors(),
});

if (linter) {
  linter.report(reporter);

  if (linter.hasError) {
    exit(1);
  }
}
