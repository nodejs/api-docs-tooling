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

export interface LintDeclarations {
  skipDeprecation: Array<number>;
}

type LintRule = (
  input: Array<ApiDocMetadataEntry>,
  declarations: LintDeclarations
) => LintIssue[];

export type Reporter = (msg: LintIssue) => void;
