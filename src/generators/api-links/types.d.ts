export interface ProgramExports {
  ctors: Array<string>;
  identifiers: Array<string>;
  indirects: Record<string, string>;
}
