#!/usr/bin/env node

import { resolve } from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { cpus } from 'node:os';

import { Argument, Command, Option } from 'commander';

import { coerce } from 'semver';
import { DOC_NODE_CHANGELOG_URL, DOC_NODE_VERSION } from '../src/constants.mjs';
import createGenerator from '../src/generators.mjs';
import { publicGenerators } from '../src/generators/index.mjs';
import createLinter from '../src/linter/index.mjs';
import reporters from '../src/linter/reporters/index.mjs';
import rules from '../src/linter/rules/index.mjs';
import createMarkdownLoader from '../src/loaders/markdown.mjs';
import createMarkdownParser from '../src/parsers/markdown.mjs';
import createNodeReleases from '../src/releases.mjs';

import {
  intro,
  outro,
  select,
  multiselect,
  text,
  confirm,
  isCancel,
  cancel,
} from '@clack/prompts';

// Derive available options dynamically from imported modules
const availableGenerators = Object.keys(publicGenerators); // e.g. ['html', 'json']
const availableRules = Object.keys(rules); // Linter rule names
const availableReporters = Object.keys(reporters); // Reporter implementations

// Initialize Commander.js
const program = new Command();
program
  .name('api-docs-tooling')
  .description('CLI tool to generate and lint Node.js API documentation');

// Instantiate loader and parser once to reuse
const loader = createMarkdownLoader();
const parser = createMarkdownParser();

/**
 * Load and parse markdown API docs.
 * @param {string[]} input - Glob patterns for input files.
 * @param {string[]} [ignore] - Glob patterns to ignore.
 * @returns {Promise<ApiDocMetadataEntry[]>} - Parsed documentation objects.
 */
async function loadAndParse(input, ignore) {
  const files = await loader.loadFiles(input, ignore);
  return parser.parseApiDocs(files);
}

/**
 * Run the linter on parsed documentation.
 * @param {ApiDocMetadataEntry[]} docs - Parsed documentation objects.
 * @param {object} [opts]
 * @param {string[]} [opts.disableRule] - List of rule names to disable.
 * @param {boolean} [opts.lintDryRun] - If true, do not throw on errors.
 * @param {string} [opts.reporter] - Reporter to use for output.
 * @returns {boolean} - True if no errors, false otherwise.
 */
function runLint(
  docs,
  { disableRule = [], lintDryRun = false, reporter = 'console' } = {}
) {
  const linter = createLinter(lintDryRun, disableRule);
  linter.lintAll(docs);
  linter.report(reporter);
  return !linter.hasError();
}

/**
 * Require value to have a length > 0
 * @param {string} value
 * @returns {boolean}
 */
function requireValue(value) {
  if (value.length === 0) return 'Value is required!';
}

/**
 * Get the message for a prompt
 * @param {{ message: string, required: boolean }} prompt
 * @returns {string}
 */
function getMessage({ message, required, initialValue }) {
  return required || initialValue ? message : `${message} (Optional)`;
}

/**
 * Centralized command definitions.
 * Each command has a description and a set of options with:
 * - flags: Commander.js flag definitions
 * - desc: description for help output
 * - prompt: metadata for interactive mode
 */
const commandDefinitions = {
  generate: {
    description: 'Generate API docs',
    options: {
      input: {
        flags: ['-i, --input <patterns...>'],
        desc: 'Input file patterns (glob)',
        prompt: {
          type: 'text',
          message: 'Enter input glob patterns',
          variadic: true,
          required: true,
        },
      },
      ignore: {
        flags: ['--ignore [patterns...]'],
        desc: 'Ignore patterns (comma-separated)',
        prompt: {
          type: 'text',
          message: 'Enter ignore patterns',
          variadic: true,
        },
      },
      output: {
        flags: ['-o, --output <dir>'],
        desc: 'Output directory',
        prompt: { type: 'text', message: 'Enter output directory' },
      },
      threads: {
        flags: ['-p, --threads <number>'],
        prompt: {
          type: 'text',
          message: 'How many threads to allow',
          initialValue: String(Math.max(cpus().length, 1)),
        },
      },
      version: {
        flags: ['-v, --version <semver>'],
        desc: 'Target Node.js version',
        prompt: {
          type: 'text',
          message: 'Enter Node.js version',
          initialValue: DOC_NODE_VERSION,
        },
      },
      changelog: {
        flags: ['-c, --changelog <url>'],
        desc: 'Changelog URL or path',
        prompt: {
          type: 'text',
          message: 'Enter changelog URL',
          initialValue: DOC_NODE_CHANGELOG_URL,
        },
      },
      gitRef: {
        flags: ['--git-ref <url>'],
        desc: 'Git ref/commit URL',
        prompt: {
          type: 'text',
          message: 'Enter Git ref URL',
          initialValue: 'https://github.com/nodejs/node/tree/HEAD',
        },
      },
      target: {
        flags: ['-t, --target [modes...]'],
        desc: 'Target generator modes',
        prompt: {
          required: true,
          type: 'multiselect',
          message: 'Choose target generators',
          options: availableGenerators.map(g => ({
            label: g,
            value: `${publicGenerators[g].name || g} (v${publicGenerators[g].version}) - ${publicGenerators[g].description}`,
          })),
        },
      },
      skipLint: {
        flags: ['--no-lint'],
        desc: 'Skip lint before generate',
        prompt: {
          type: 'confirm',
          message: 'Skip lint before generate?',
          initialValue: false,
        },
      },
    },
  },
  lint: {
    description: 'Run linter independently',
    options: {
      input: {
        flags: ['-i, --input <patterns...>'],
        desc: 'Input file patterns (glob)',
        prompt: {
          type: 'text',
          message: 'Enter input glob patterns',
          variadic: true,
          required: true,
        },
      },
      ignore: {
        flags: ['--ignore [patterns...]'],
        desc: 'Ignore patterns (comma-separated)',
        prompt: {
          type: 'text',
          message: 'Enter ignore patterns',
          variadic: true,
        },
      },
      disableRule: {
        flags: ['--disable-rule [rules...]'],
        desc: 'Disable linter rules',
        prompt: {
          type: 'multiselect',
          message: 'Choose rules to disable',
          options: availableRules.map(r => ({ label: r, value: r })),
        },
      },
      lintDryRun: {
        flags: ['--lint-dry-run'],
        desc: 'Dry run lint mode',
        prompt: {
          type: 'confirm',
          message: 'Enable dry run mode?',
          initialValue: false,
        },
      },
      reporter: {
        flags: ['-r, --reporter <reporter>'],
        desc: 'Linter reporter to use',
        prompt: {
          type: 'select',
          message: 'Choose a reporter',
          options: availableReporters.map(r => ({ label: r, value: r })),
        },
      },
    },
  },
};

// Dynamically register commands based on definitions
Object.entries(commandDefinitions).forEach(
  ([cmdName, { description, options }]) => {
    // Create a new command in Commander
    const cmd = program.command(cmdName).description(description);

    // Register each option
    Object.values(options).forEach(({ flags, desc, prompt }) => {
      const option = new Option(flags.join(', '), desc);
      option.default(prompt.initialValue);
      if (prompt.required) option.makeOptionMandatory();
      if (prompt.type === 'multiselect')
        option.choices(prompt.options.map(({ label }) => label));
      cmd.addOption(option);
    });

    // Define the command's action handler
    cmd.action(async opts => {
      // Parse docs from markdown
      const docs = await loadAndParse(opts.input, opts.ignore);

      if (cmdName === 'generate') {
        // Pre-lint step (skip if requested)
        if (!opts.skipLint && !runLint(docs)) {
          console.error('Lint failed; aborting generation.');
          process.exit(1);
        }

        // Generate API docs via configured generators
        const { runGenerators } = createGenerator(docs);
        const { getAllMajors } = createNodeReleases(opts.changelog);
        await runGenerators({
          generators: opts.target,
          input: opts.input,
          output: opts.output && resolve(opts.output),
          version: coerce(opts.version),
          releases: await getAllMajors(),
          gitRef: opts.gitRef,
          threads: parseInt(opts.threads),
        });
      } else {
        // Lint-only mode
        const success = runLint(docs, {
          disableRule: opts.disableRule,
          lintDryRun: opts.lintDryRun,
          reporter: opts.reporter,
        });
        process.exitCode = success ? 0 : 1;
      }
    });
  }
);

// Add list subcommands to inspect available modules
program
  .command('list')
  .addArgument(
    new Argument('<type>', 'Type to list').choices([
      'generators',
      'rules',
      'reporters',
    ])
  )
  .description('List available types')
  .action(type => {
    const list =
      type === 'generators'
        ? Object.entries(publicGenerators).map(
            ([key, generator]) =>
              `${generator.name || key} (v${generator.version}) - ${generator.description}`
          )
        : type === 'rules'
          ? availableRules
          : availableReporters;

    console.log(list.join('\n'));
  });

// Interactive mode: guides the user through building a command
program
  .command('interactive')
  .description('Launch guided CLI wizard')
  .action(async () => {
    intro('Welcome to API Docs Tooling');

    // Build action choices from definitions
    const actionOptions = Object.entries(commandDefinitions).map(
      ([name, def]) => ({
        label: def.description,
        value: name,
      })
    );

    // Prompt user to choose a command
    const action = await select({
      message: 'What would you like to do?',
      options: actionOptions,
    });

    if (isCancel(action)) {
      cancel('Cancelled.');
      process.exit(0);
    }

    const { options } = commandDefinitions[action];
    const answers = {};

    // Iterate through each option's prompt metadata
    for (const [key, { prompt }] of Object.entries(options)) {
      let response;
      switch (prompt.type) {
        case 'text':
          response = await text({
            message: getMessage(prompt),
            initialValue: prompt.initialValue || '',
            validate: prompt.required ? requireValue : undefined,
          });
          if (response) {
            answers[key] = prompt.variadic ? response.split(',') : response;
          }
          break;
        case 'confirm':
          response = await confirm({
            message: getMessage(prompt),
            initialValue: prompt.initialValue,
          });
          answers[key] = response;
          break;
        case 'multiselect':
          response = await multiselect({
            message: getMessage(prompt),
            options: prompt.options,
            required: !!prompt.required,
          });
          answers[key] = response;
          break;
        case 'select':
          response = await select({
            message: getMessage(prompt),
            options: prompt.options,
          });
          answers[key] = response;
          break;
      }

      if (isCancel(response)) {
        cancel('Cancelled.');
        process.exit(0);
      }
    }

    // Build the final CLI command string
    let cmdStr = `npx api-docs-tooling ${action}`;
    for (const [key, { flags }] of Object.entries(options)) {
      const val = answers[key];
      if (val == null || (Array.isArray(val) && val.length === 0)) continue;
      const flag = flags[0].split(/[\s,]+/)[0];
      if (typeof val === 'boolean') {
        if (val) cmdStr += ` ${flag}`;
      } else if (Array.isArray(val)) {
        cmdStr += ` ${flag} ${val.join(',')}`;
      } else {
        cmdStr += ` ${flag} ${val}`;
      }
    }

    // Display and optionally run the constructed command
    console.log(`\nGenerated command:\n${cmdStr}\n`);
    if (await confirm({ message: 'Run now?', initialValue: true })) {
      const args = cmdStr.split(' ').slice(2);
      spawnSync(process.execPath, [process.argv[1], ...args], {
        stdio: 'inherit',
      });
    }

    outro('Done!');
  });

// Help and version commands for user assistance
program
  .command('help [cmd]')
  .description('Show help for a command')
  .action(cmdName => {
    const target = program.commands.find(c => c.name() === cmdName) || program;
    target.help();
  });

// Parse CLI arguments and execute
program.parse(process.argv);
