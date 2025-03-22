import { describe, it } from 'node:test';
import { deepStrictEqual } from 'assert';
import { duplicateStabilityNodes } from '../../rules/duplicate-stability-nodes.mjs';
import { LINT_MESSAGES } from '../../../constants.mjs';

// Mock data structure for creating test entries
const createEntry = (
  depth,
  stabilityIndex,
  source = 'file.yaml',
  position = { line: 1, column: 1 }
) => ({
  heading: { data: { depth } },
  stability: { children: [{ data: { index: stabilityIndex } }] },
  api_doc_source: source,
  yaml_position: position,
});

describe('duplicateStabilityNodes', () => {
  it('returns empty array when there are no entries', () => {
    deepStrictEqual(duplicateStabilityNodes([]), []);
  });

  it('returns empty array when there are no duplicate stability nodes', () => {
    const entries = [createEntry(1, 0), createEntry(2, 1), createEntry(3, 2)];
    deepStrictEqual(duplicateStabilityNodes(entries), []);
  });

  it('detects duplicate stability nodes within a chain', () => {
    const entries = [
      createEntry(1, 0),
      createEntry(2, 0), // Duplicate stability node
    ];

    deepStrictEqual(duplicateStabilityNodes(entries), [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
    ]);
  });

  it('resets stability tracking when depth decreases', () => {
    const entries = [
      createEntry(1, 0),
      createEntry(2, 0), // This should trigger an issue
      createEntry(1, 1),
      createEntry(2, 1), // This should trigger another issue
    ];

    deepStrictEqual(duplicateStabilityNodes(entries), [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
    ]);
  });

  it('handles missing stability nodes gracefully', () => {
    const entries = [
      createEntry(1, -1),
      createEntry(2, -1),
      createEntry(3, 0),
      createEntry(4, 0), // This should trigger an issue
    ];

    deepStrictEqual(duplicateStabilityNodes(entries), [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
    ]);
  });

  it('handles entries with no stability property gracefully', () => {
    const entries = [
      {
        heading: { data: { depth: 1 } },
        stability: { children: [] },
        api_doc_source: 'file.yaml',
        yaml_position: { line: 2, column: 5 },
      },
      createEntry(2, 0),
    ];
    deepStrictEqual(duplicateStabilityNodes(entries), []);
  });

  it('handles entries with undefined stability index', () => {
    const entries = [
      createEntry(1, undefined),
      createEntry(2, undefined),
      createEntry(3, 1),
      createEntry(4, 1), // This should trigger an issue
    ];
    deepStrictEqual(duplicateStabilityNodes(entries), [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
    ]);
  });

  it('handles mixed depths and stability nodes correctly', () => {
    const entries = [
      createEntry(1, 0),
      createEntry(2, 1),
      createEntry(3, 1), // This should trigger an issue
      createEntry(2, 2),
      createEntry(3, 2), // This should trigger another issue
    ];

    deepStrictEqual(duplicateStabilityNodes(entries), [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: 'file.yaml',
          position: { line: 1, column: 1 },
        },
      },
    ]);
  });
});
