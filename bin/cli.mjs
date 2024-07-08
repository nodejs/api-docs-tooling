#!/usr/bin/env node

import { Command } from 'commander';
import { glob } from 'glob';
import { basename, join } from 'node:path';
import { argv, exit } from 'node:process';

/**
 * @fileoverview
 *
 * The CLI used to help create API documentation for the Node.js project.
 * The CLI processes files and generates API documentation based on the provided options.
 */

/**
 * Process files based on provided command line arguments.
 *
 * @param {string} filePath - The path of the file to be processed.
 * @param {Options['output']} outputDir - The directory where the processed file will be saved.
 * @param {Options['target']} target - The processing mode to be applied to the file.
 * @returns {Promise<void>} A promise that resolves when the file processing is complete.
 */
const processFile = async (filePath, outputDir, target) => {
  try {
    const fileName = basename(filePath);
    const outputPath = join(outputDir, fileName);

    console.info(
      `Processing file ${filePath} to ${outputPath} with target ${target}...`
    );

    // TODO: Implement file processing logic here
    return new Promise();
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    exit(1);
  }
};

const program = new Command();

program
  .requiredOption(
    '-i, --input <patterns...>',
    'Specify input file patterns using glob syntax'
  )
  .option(
    '-e, --exclude <patterns...>',
    'Specify patterns to exclude files from being processed'
  )
  .requiredOption('-o, --output <path>', 'Specify the output directory path')
  .option('-t, --target <mode>', 'Set the processing mode', 'mdx')
  .parse(argv);

/**
 * Defines the structure for command line options after parsing.
 *
 * @typedef {Object} Options
 * @property {Array<string>|string} input - Specifies the glob/path for input files.
 * @property {string} output - Specifies the directory where output files will be saved.
 * @property {Array<string>|string} exclude - Specifies the glob patterns for files to exclude from processing.
 * @property {'mdx'} target - Specifies the execution target mode. Currently, only 'mdx' mode is supported.
 */

/** @type {Options} */
const { input, output, exclude, target } = program.opts();

try {
  // Get all files based on the input glob pattern
  const files = await glob(input, exclude ? { ignore: exclude } : {});

  console.info(`${files.length} files found.`);

  await Promise.all(
    files.map(filePath => processFile(filePath, output, target))
  );
} catch (error) {
  console.error(error);
  exit(1);
}
