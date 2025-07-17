#!/usr/bin/env node

import process from 'node:process';

import { Argument, Command, Option } from 'commander';

import commands from './commands/index.mjs';
import interactive from './commands/interactive.mjs';
import list, { types } from './commands/list.mjs';
import { errorWrap } from './utils.mjs';

const program = new Command()
  .name('@nodejs/doc-kit')
  .description('CLI tool to generate and lint Node.js API documentation');

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
