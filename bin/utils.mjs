import createMarkdownLoader from '../src/loaders/markdown.mjs';
import createMarkdownParser from '../src/parsers/markdown.mjs';

// Instantiate loader and parser once to reuse
const loader = createMarkdownLoader();
const parser = createMarkdownParser();

/**
 * Load and parse markdown API docs.
 * @param {string[]} input - Glob patterns for input files.
 * @param {string[]} [ignore] - Glob patterns to ignore.
 * @returns {Promise<ApiDocMetadataEntry[]>} - Parsed documentation objects.
 */
export async function loadAndParse(input, ignore) {
  const files = await loader.loadFiles(input, ignore);
  return parser.parseApiDocs(files);
}

/**
 * Represents a command-line option for the linter CLI.
 * @typedef {Object} Option
 * @property {string[]} flags - Command-line flags, e.g., ['-i, --input <patterns...>'].
 * @property {string} desc - Description of the option.
 * @property {Object} [prompt] - Optional prompt configuration.
 * @property {'text'|'confirm'|'select'|'multiselect'} prompt.type - Type of the prompt.
 * @property {string} prompt.message - Message displayed in the prompt.
 * @property {boolean} [prompt.variadic] - Indicates if the prompt accepts multiple values.
 * @property {boolean} [prompt.required] - Whether the prompt is required.
 * @property {boolean} [prompt.initialValue] - Default value for confirm prompts.
 * @property {{label: string, value: string}[]} [prompt.options] - Options for select/multiselect prompts.
 */

/**
 * Represents a command-line subcommand
 * @typedef {Object} Command
 * @property {{ [key: string]: Option }} options
 * @property {string} name
 * @property {string} description
 * @property {Function} action
 */
