import { mock } from 'node:test';

export const createContext = children => ({
  tree: { type: 'root', children },
  report: mock.fn(),
  getIssues: mock.fn(),
});
