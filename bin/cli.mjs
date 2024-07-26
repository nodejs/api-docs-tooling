#!/usr/bin/env node

import { argv } from 'node:process';
import { resolve } from 'node:path';

import { Command, Option } from 'commander';

import createGenerator from '../src/generators.mjs';
import createLoader from '../src/loader.mjs';
import createParser from '../src/parser.mjs';
import { CLI_TARGET_MAPPING } from '../src/constants.mjs';

const program = new Command();

program
  .requiredOption(
    '-i, --input <patterns...>',
    'Specify input file patterns using glob syntax'
  )
  .requiredOption('-o, --output <path>', 'Specify the output directory path')
  .addOption(
    new Option(
      '-t, --target [mode...]',
      'Set the processing target mode'
    ).choices(Object.keys(CLI_TARGET_MAPPING))
  )
  .parse(argv);

/**
 * Defines the structure for command line options after parsing.
 *
 * @typedef {Object} Options
 * @property {Array<string>|string} input Specifies the glob/path for input files.
 * @property {string} output Specifies the directory where output files will be saved.
 * @property {keyof CLI_TARGET_MAPPING} target Specifies the execution target mode.
 */

/** @type {Options} */
const { input, output, target } = program.opts();

const { loadFiles } = createLoader();
const { parseApiDocs } = createParser();

const apiDocFiles = loadFiles(input);

const parsedApiDocs = await parseApiDocs(apiDocFiles);

const { runGenerators } = createGenerator(parsedApiDocs);

await runGenerators({
  generators: target.map(mode => CLI_TARGET_MAPPING[mode]),
  output: resolve(output),
});
