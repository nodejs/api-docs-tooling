import { Root } from 'mdast';
import { Position } from 'unist';

export interface Linter {
  lint: (ast: Root) => void;
  report: (reporterName: keyof typeof reporters) => void;
  hasError: () => boolean;
}

export type IssueLevel = 'info' | 'warn' | 'error';

export interface LintIssueLocation {
  path: string; // The absolute path to the file
  position?: Position;
}

export interface LintIssue {
  level: IssueLevel;
  message: string;
  location: LintIssueLocation;
}

type LintRule = (input: Root[]) => LintIssue[];

export type Reporter = (msg: LintIssue) => void;
