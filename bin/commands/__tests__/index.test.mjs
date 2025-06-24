import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Option } from 'commander';

import commands from '../index.mjs';

describe('Commands', () => {
  it('should have unique command names', () => {
    const names = new Set();

    commands.forEach(({ name }) => {
      assert.equal(names.has(name), false, `Duplicate command name: "${name}"`);
      names.add(name);
    });
  });

  it('should use correct option names', () => {
    commands.forEach(({ name: cmdName, options }) => {
      Object.entries(options).forEach(([optName, { flags }]) => {
        const expectedName = new Option(flags.at(-1)).attributeName();
        assert.equal(
          optName,
          expectedName,
          `In "${cmdName}" command: option "${flags}" should be named "${expectedName}", not "${optName}"`
        );
      });
    });
  });
});
