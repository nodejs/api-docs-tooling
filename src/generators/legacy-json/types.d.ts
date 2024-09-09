import { ListItem } from 'mdast';

export interface HierarchizedEntry extends ApiDocMetadataEntry {
  hierarchyChildren: ApiDocMetadataEntry[];
}

export type Section =
  | SignatureSection
  | PropertySection
  | EventSection
  | MiscSection;

export interface Meta {
  changes: ApiDocMetadataChange[];
  added?: string[];
  napiVersion?: string[];
  deprecated?: string[];
  removed?: string[];
}

export interface SectionBase {
  type: string;
  name: string;
  textRaw: string;
  displayName?: string;
  desc: string;
  shortDesc?: string;
  stability?: number;
  stabilityText?: string; // TODO find the type for this
  meta?: Meta;
}

export interface ModuleSection extends SectionBase {
  type: 'module';
  source: string;
  miscs: MiscSection[];
  modules: ModuleSection[];
  // TODO ...
}

export interface SignatureSection extends SectionBase {
  type: 'class' | 'ctor' | 'classMethod' | 'method';
  signatures: MethodSignature[];
}

export interface MethodSignature {
  params: object[]; // TODO
  return?: object; // TODO
}

export interface PropertySection extends SectionBase {
  type: 'property';
  typeof?: string;
  [key: string]: string | undefined;
}

export interface EventSection extends SectionBase {
  type: 'event';
  params: object[]; // TODO
}

export interface MiscSection extends SectionBase {
  type: 'misc';
  [key: string]: string | undefined;
}

export interface List {
  textRaw: string;
  desc?: string;
  name: string;
  type?: string;
  default?: string;
  options?: List;
}
