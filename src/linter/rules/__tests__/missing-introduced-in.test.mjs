import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it, mock } from 'node:test';

import { missingIntroducedIn } from '../../rules/missing-introduced-in.mjs';

describe('missingIntroducedIn', () => {
  it('should not report if the introduced_in field is not missing', () => {
    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'html',
            value: '<!--introduced_in=12.0.0-->',
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    missingIntroducedIn(context);

    strictEqual(context.report.mock.callCount(), 0);
  });

  it('should report an issue if the introduced_in field is missing in the first entry', () => {
    const context = {
      tree: {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 2,
          },
          {
            type: 'html',
            value: '<!--introduced_in=12.0.0-->',
          },
        ],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    missingIntroducedIn(context);

    strictEqual(context.report.mock.callCount(), 1);

    const call = context.report.mock.calls[0];

    deepStrictEqual(call.arguments, [
      {
        level: 'info',
        message: "Missing 'introduced_in' field in the API doc entry",
      },
    ]);
  });

  it('should report an issue if the introduced_in property is missing', () => {
    const context = {
      tree: {
        type: 'root',
        children: [],
      },
      report: mock.fn(),
      getIssues: mock.fn(),
    };

    missingIntroducedIn(context);

    strictEqual(context.report.mock.callCount(), 1);

    const call = context.report.mock.calls[0];

    deepStrictEqual(call.arguments, [
      {
        level: 'info',
        message: "Missing 'introduced_in' field in the API doc entry",
      },
    ]);
  });
});
