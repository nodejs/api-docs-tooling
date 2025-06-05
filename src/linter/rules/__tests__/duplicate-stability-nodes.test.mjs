import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { LINT_MESSAGES } from '../../constants.mjs';
import { duplicateStabilityNodes } from '../duplicate-stability-nodes.mjs';
import { createContext } from './utils.mjs';

// Mock data structure for creating test entries
const createStabilityNode = (value, line = 1, column = 1) => ({
  type: 'blockquote',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: `Stability: ${value}`,
        },
      ],
    },
  ],
  position: {
    start: { line, column },
    end: { line, column: column + 20 },
  },
});

const createHeadingNode = (depth, line = 1, column = 1) => ({
  type: 'heading',
  depth,
  children: [
    {
      type: 'text',
      value: `Heading ${depth}`,
    },
  ],
  position: {
    start: { line, column },
    end: { line, column: column + 10 },
  },
});

describe('duplicateStabilityNodes', () => {
  it('should not report when there are no stability nodes', () => {
    const context = createContext([
      createHeadingNode(1, 1),
      createHeadingNode(2, 2),
    ]);
    duplicateStabilityNodes(context);
    strictEqual(context.report.mock.callCount(), 0);
  });

  it('should not report when there are no duplicate stability nodes', () => {
    const context = createContext([
      createHeadingNode(1, 1),
      createStabilityNode(0, 2),
      createHeadingNode(2, 3),
      createStabilityNode(1, 4),
      createHeadingNode(3, 5),
      createStabilityNode(2, 6),
    ]);
    duplicateStabilityNodes(context);
    strictEqual(context.report.mock.callCount(), 0);
  });

  it('detects duplicate stability nodes within a chain', () => {
    const duplicateNode = createStabilityNode(0, 4);
    const context = createContext([
      createHeadingNode(1, 1),
      createStabilityNode(0, 2),
      createHeadingNode(2, 3),
      duplicateNode, // Duplicate stability node
    ]);

    duplicateStabilityNodes(context);

    strictEqual(context.report.mock.callCount(), 1);

    const call = context.report.mock.calls[0];

    deepStrictEqual(call.arguments, [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode.position,
      },
    ]);
  });

  it('resets stability tracking when depth decreases', () => {
    const duplicateNode1 = createStabilityNode(0, 4);
    const duplicateNode2 = createStabilityNode(1, 8);
    const context = createContext([
      createHeadingNode(1, 1),
      createStabilityNode(0, 2),
      createHeadingNode(2, 3),
      duplicateNode1, // This should trigger an issue
      createHeadingNode(1, 5),
      createStabilityNode(1, 6),
      createHeadingNode(2, 7),
      duplicateNode2, // This should trigger another issue
    ]);

    duplicateStabilityNodes(context);

    strictEqual(context.report.mock.callCount(), 2);

    const calls = context.report.mock.calls.flatMap(call => call.arguments);

    deepStrictEqual(calls, [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode1.position,
      },
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode2.position,
      },
    ]);
  });

  it('handles missing stability nodes gracefully', () => {
    const duplicateNode = createStabilityNode(0, 6);
    const context = createContext([
      createHeadingNode(1, 1),
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Not a stability node' }],
          },
        ],
        position: { start: { line: 2 }, end: { line: 2 } },
      },
      createHeadingNode(3, 3),
      createStabilityNode(0, 4),
      createHeadingNode(4, 5),
      duplicateNode, // This should trigger an issue
    ]);

    duplicateStabilityNodes(context);

    strictEqual(context.report.mock.callCount(), 1);

    const call = context.report.mock.calls[0];

    deepStrictEqual(call.arguments, [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode.position,
      },
    ]);
  });

  it('handles mixed depths and stability nodes correctly', () => {
    const duplicateNode1 = createStabilityNode(1, 6);
    const duplicateNode2 = createStabilityNode(2, 10);
    const context = createContext([
      createHeadingNode(1, 1),
      createStabilityNode(0, 2),
      createHeadingNode(2, 3),
      createStabilityNode(1, 4),
      createHeadingNode(3, 5),
      duplicateNode1, // This should trigger an issue
      createHeadingNode(2, 7),
      createStabilityNode(2, 8),
      createHeadingNode(3, 9),
      duplicateNode2, // This should trigger another issue
    ]);

    duplicateStabilityNodes(context);

    strictEqual(context.report.mock.callCount(), 2);

    const calls = context.report.mock.calls.flatMap(call => call.arguments);

    deepStrictEqual(calls, [
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode1.position,
      },
      {
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        position: duplicateNode2.position,
      },
    ]);
  });

  it('handles malformed blockquotes gracefully', () => {
    const context = createContext([
      createHeadingNode(1, 1),
      {
        type: 'blockquote',
        children: [], // Empty children array
        position: { start: { line: 2 }, end: { line: 2 } },
      },
      createHeadingNode(2, 3),
      {
        type: 'blockquote',
        children: [{ type: 'thematicBreak' }], // No paragraph
        position: { start: { line: 4 }, end: { line: 4 } },
      },
      createHeadingNode(3, 5),
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [], // No text node
          },
        ],
        position: { start: { line: 6 }, end: { line: 6 } },
      },
    ]);

    duplicateStabilityNodes(context);

    strictEqual(context.report.mock.callCount(), 0);
  });
});
