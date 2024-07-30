#!/usr/bin/env node

import { argv } from 'node:process';
import { resolve } from 'node:path';

import { Command, Option } from 'commander';

import createGenerator from '../src/generators.mjs';
import createLoader from '../src/loader.mjs';
import createParser from '../src/parser.mjs';
import generators from '../src/generators/index.mjs';

const program = new Command();

program
  .name('api-docs-tooling')
  .description('CLI tool to generate API documentation of a Node.js project.')
  .requiredOption(
    '-i, --input <patterns...>',
    'Specify input file patterns using glob syntax'
  )
  .requiredOption('-o, --output <path>', 'Specify the output directory path')
  .addOption(
    new Option(
      '-t, --target [mode...]',
      'Set the processing target mode'
    ).choices(Object.keys(generators))
  )
  .parse(argv);

/**
 * @typedef {keyof generators} Target A list of the available generator names.
 *
 * @typedef {Object} Options
 * @property {Array<string>|string} input Specifies the glob/path for input files.
 * @property {string} output Specifies the directory where output files will be saved.
 * @property {Target} target Specifies the generator target mode.
 *
 * @name ProgramOptions
 * @type {Options}
 * @description The return type for values sent to the program from the CLI.
 */
const { input, output, target } = program.opts();

const { loadFiles } = createLoader();
const { parseApiDocs } = createParser();

const apiDocFiles = loadFiles(input);

const parsedApiDocs = await parseApiDocs(apiDocFiles);

const { runGenerators } = createGenerator(parsedApiDocs);

await runGenerators({
  generators: target,
  output: resolve(output),
});
