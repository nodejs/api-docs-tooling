export type LintLevel = 'info' | 'warn' | 'error';

export interface LintMessageLocation {
  // The absolute path to the file
  path: string;
  line: number;
  column: number;
}

export interface LintMessage {
  level: LintLevel;
  msg: string;
  location?: LintMessageLocation;
}

export type Reporter = (msg: LintMessage) => void;
