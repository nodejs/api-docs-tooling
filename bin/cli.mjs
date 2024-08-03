#!/usr/bin/env node

import { resolve } from 'node:path';
import { argv } from 'node:process';

import { Command, Option } from 'commander';

import { coerce } from 'semver';
import { DOC_NODE_CHANGELOG_URL, DOC_NODE_VERSION } from '../src/constants.mjs';
import createGenerator from '../src/generators.mjs';
import generators from '../src/generators/index.mjs';
import createLoader from '../src/loader.mjs';
import createParser from '../src/parser.mjs';
import createNodeReleases from '../src/releases.mjs';

const availableGenerators = Object.keys(generators);

const program = new Command();

program
  .name('api-docs-tooling')
  .description('CLI tool to generate API documentation of a Node.js project.')
  .addOption(
    new Option(
      '-i, --input <patterns>',
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
 *
 * @name ProgramOptions
 * @type {Options}
 * @description The return type for values sent to the program from the CLI.
 */
const { input, output, target = [], version, changelog } = program.opts();

const { loadFiles } = createLoader();
const { parseApiDocs } = createParser();

const apiDocFiles = loadFiles(input);

const parsedApiDocs = await parseApiDocs(apiDocFiles);

const { runGenerators } = createGenerator(parsedApiDocs);

// Retrieves Node.js release metadata from a given Node.js version and CHANGELOG.md file
const { getAllMajors } = createNodeReleases(changelog);

await runGenerators({
  // A list of target modes for the API docs parser
  generators: target,
  // Resolved `output` path to be used
  output: resolve(output),
  // Resolved SemVer of current Node.js version
  version: coerce(version),
  // A list of all Node.js major versions with LTS status
  releases: await getAllMajors(),
});
