import { deepEqual } from 'node:assert';
import { mock } from 'node:test';

import dedent from 'dedent';

import { invalidChangeVersion } from '../../rules/invalid-change-version.mjs';

const yamlContent = dedent`
<!-- YAML
changes:
  - version: v15.0.0
  - version:
      - v13.9.0
      - v12.16.2
  - version: v9.9.0
-->`;

const context = {
  tree: {
    type: 'root',
    children: [
      {
        type: 'html',
        value: yamlContent,
        position: {
          start: { line: 1, column: 1, offset: 1 },
          end: { line: 1, column: 1, offset: 1 },
        },
      },
    ],
  },
  report: mock.fn(),
  getIssues: mock.fn(),
};

invalidChangeVersion(context);

deepEqual(context.report.mock.callCount(), 0);
