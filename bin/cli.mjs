#!/usr/bin/env node

import process from 'node:process';
import { Argument, Command, Option } from 'commander';

import interactive from './commands/interactive.mjs';
import list, { types } from './commands/list.mjs';
import commands from './commands/index.mjs';

const program = new Command()
  .name('api-docs-tooling')
  .description('CLI tool to generate and lint Node.js API documentation');

/**
 * Returns a wrapped version of the given async function that catches and rethrows any errors.
 *
 * @function
 * @param {Function} fn - The async function to wrap.
 * @returns {Function} A new function that calls `fn` with any given arguments and rethrows errors.
 */
const errorWrap =
  fn =>
  (...args) =>
    fn(...args).catch(e => {
      console.error(e);
      process.exit(1);
    });

// Registering generate and lint commands
commands.forEach(({ name, description, options, action }) => {
  const cmd = program.command(name).description(description);

  // Add options to the command
  Object.values(options).forEach(({ flags, desc, prompt }) => {
    const option = new Option(flags.join(', '), desc).default(
      prompt.initialValue
    );

    if (prompt.required) {
      option.makeOptionMandatory();
    }

    if (prompt.type === 'multiselect') {
      option.choices(prompt.options.map(({ value }) => value));
    }

    cmd.addOption(option);
  });

  // Set the action for the command
  cmd.action(errorWrap(action));
});

// Register the interactive command
program
  .command('interactive')
  .description('Launch guided CLI wizard')
  .action(errorWrap(interactive));

// Register the list command
program
  .command('list')
  .addArgument(new Argument('<types>', 'The type to list').choices(types))
  .description('List the given type')
  .action(errorWrap(list));

// Parse and execute command-line arguments
program.parse(process.argv);
