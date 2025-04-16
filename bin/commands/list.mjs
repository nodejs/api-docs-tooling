import { publicGenerators } from '../../src/generators/index.mjs';
import reporters from '../../src/linter/reporters/index.mjs';
import rules from '../../src/linter/rules/index.mjs';

const availableRules = Object.keys(rules);
const availableReporters = Object.keys(reporters);

/**
 *
 * @param type
 */
export default function list(type) {
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
}

export const types = ['generators', 'rules', 'reporters'];
