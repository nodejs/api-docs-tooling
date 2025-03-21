import { Position } from 'unist';

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

type LintRule = MultipleEntriesLintRules | SingleEntryLintRule;
type MultipleEntriesLintRules = (input: ApiDocMetadataEntry[]) => LintIssue[];
type SingleEntryLintRule = (input: ApiDocMetadataEntry) => LintIssue[];

export type Reporter = (msg: LintIssue) => void;
