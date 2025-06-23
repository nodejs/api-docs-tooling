import { deepStrictEqual, strictEqual } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { execPath } from 'node:process';
import { describe, it, mock } from 'node:test';
import { fileURLToPath } from 'node:url';

import dedent from 'dedent';

import { invalidChangeVersion } from '../invalid-change-version.mjs';
import { createContext } from './utils.mjs';

describe('invalidChangeVersion', () => {
  it('should not report if all change versions are non-empty', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        - version:
            - v15.7.0
            - v14.18.0
        - version: v6.4.0
        - version: v5.0.0
      -->`;

    const context = createContext([
      {
        type: 'html',
        value: yamlContent,
      },
    ]);

    invalidChangeVersion(context);

    strictEqual(context.report.mock.callCount(), 0);
  });

  it('should report an issue if a change version is missing', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        - version:
        - pr-url: https://github.com/nodejs/node/pull/1
      -->`;

    const context = createContext([
      {
        type: 'html',
        value: yamlContent,
        position: {
          start: { line: 1, column: 1, offset: 1 },
          end: { line: 1, column: 1, offset: 1 },
        },
      },
    ]);

    invalidChangeVersion(context);

    strictEqual(context.report.mock.callCount(), 2);

    const callArguments = context.report.mock.calls.flatMap(
      call => call.arguments
    );

    deepStrictEqual(callArguments, [
      {
        level: 'error',
        message: 'Missing version field in the API doc entry',
        position: {
          start: { line: 3 },
          end: { line: 3 },
        },
      },
      {
        level: 'error',
        message: 'Missing version field in the API doc entry',
        position: {
          start: { line: 4 },
          end: { line: 4 },
        },
      },
    ]);
  });

  it('should work with NODE_RELEASED_VERSIONS', () => {
    const result = spawnSync(
      execPath,
      [
        fileURLToPath(
          new URL(
            './fixtures/invalid-change-version-subprocess.mjs',
            import.meta.url
          )
        ),
      ],
      {
        env: {
          NODE_RELEASED_VERSIONS: [
            '9.9.0',
            '13.9.0',
            '12.16.2',
            '15.0.0',
            'REPLACEME',
            'SOME_OTHER_RELEASED_VERSION',
          ].join(','),
        },
      }
    );

    strictEqual(result.status, 0);
    strictEqual(result.error, undefined);
  });

  it('should not report if all change versions are valid', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        - version:
            - v15.7.0
            - v14.18.0
        - version: v6.4.0
        - version: v5.0.0
      -->`;

    const context = createContext([
      {
        type: 'html',
        value: yamlContent,
      },
    ]);

    invalidChangeVersion(context);

    strictEqual(context.report.mock.callCount(), 0);
  });

  it('should report an issue if a change version is invalid', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        - version:
            - v13.9.0
            - INVALID_VERSION
        - version: v6.4.0
        - version: v5.0.0
      -->`;

    const context = createContext([
      {
        type: 'html',
        value: yamlContent,
        position: {
          start: { column: 1, line: 7, offset: 103 },
          end: { column: 35, line: 7, offset: 137 },
        },
      },
    ]);

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 1);
    const call = context.report.mock.calls[0];
    deepStrictEqual(call.arguments, [
      {
        level: 'error',
        message: 'Invalid version number: INVALID_VERSION',
        position: {
          start: { line: 11 },
          end: { line: 11 },
        },
      },
    ]);
  });

  it('should report an issue if a change version contains a REPLACEME and a version', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        - version:
            - v24.0.0
            - REPLACEME
        - version: v6.4.0
        - version: v5.0.0
      -->`;

    const context = createContext([
      {
        type: 'html',
        value: yamlContent,
        position: {
          start: { column: 1, line: 7, offset: 103 },
          end: { column: 35, line: 7, offset: 137 },
        },
      },
    ]);

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 1);
    const call = context.report.mock.calls[0];
    deepStrictEqual(call.arguments, [
      {
        level: 'error',
        message: 'Invalid version number: REPLACEME',
        position: {
          start: { line: 11 },
          end: { line: 11 },
        },
      },
    ]);
  });

  it('should report an issue if changes is not a sequence', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        abc:
        def:
      -->`;

    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'html',
            value: yamlContent,
            position: {
              start: { column: 1, line: 7, offset: 103 },
              end: { column: 35, line: 7, offset: 137 },
            },
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 1);
    const call = context.report.mock.calls[0];
    deepStrictEqual(call.arguments, [
      {
        level: 'error',
        message: 'Invalid change property type',
        position: {
          start: { line: 8 },
          end: { line: 8 },
        },
      },
    ]);
  });

  it('should report an issue if version is not a mapping', () => {
    const yamlContent = dedent`
      <!-- YAML
      changes:
        version:
          - abc
          - def
      -->`;

    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'html',
            value: yamlContent,
            position: {
              start: { column: 1, line: 7, offset: 103 },
              end: { column: 35, line: 7, offset: 137 },
            },
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 1);
    const call = context.report.mock.calls[0];
    deepStrictEqual(call.arguments, [
      {
        level: 'error',
        message: 'Invalid change property type',
        position: {
          start: { line: 8 },
          end: { line: 8 },
        },
      },
    ]);
  });

  it("should skip validations if yaml root node isn't a mapping", () => {
    const yamlContent = dedent`
      <!-- YAML
      - abc
      - def
      -->`;

    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'html',
            value: yamlContent,
            position: {
              start: { column: 1, line: 7, offset: 103 },
              end: { column: 35, line: 7, offset: 137 },
            },
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 0);
  });

  it('should skip validations if changes node is missing', () => {
    const yamlContent = dedent`
      <!-- YAML
      added: v0.1.91
      -->`;

    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'html',
            value: yamlContent,
            position: {
              start: { column: 1, line: 7, offset: 103 },
              end: { column: 35, line: 7, offset: 137 },
            },
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    invalidChangeVersion(context);
    strictEqual(context.report.mock.callCount(), 0);
  });
});
