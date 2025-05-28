import { Root } from 'mdast';
import { Position } from 'unist';
import reporters from './reporters/index.mjs';
import { VFile } from 'vfile';

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

type LintRule = (context: LintContext) => void;

export type Reporter = (message: LintIssue) => void;

export interface Linter {
  readonly issues: LintIssue[];
  lint: (file: VFile, tree: Root) => void;
  report: (reporterName: keyof typeof reporters) => void;
  hasError: () => boolean;
}

export interface IssueDescriptor {
  level: IssueLevel;
  message: string;
  position?: Position;
}

export interface LintContext {
  readonly tree: Root;
  report(descriptor: IssueDescriptor): void;
  getIssues(): LintIssue[];
}
