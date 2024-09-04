import { ListItem } from 'mdast';

export interface HierarchizedEntry extends ApiDocMetadataEntry {
  hierarchyChildren: Array<ApiDocMetadataEntry>;
}

export interface Meta {
  changes: Array<ApiDocMetadataChange>;
  added?: Array<string>;
  napiVersion?: Array<string>;
  deprecated?: Array<string>;
  removed?: Array<string>;
}

export interface SectionBase {
  type: string;
  name: string;
  textRaw: string;
  displayName?: string;
  desc: string;
  shortDesc?: string;
  stability?: number;
  stabilityText?: string;
  meta?: Meta;
}

export interface ModuleSection extends SectionBase {
  type: 'module';
  source: string;
  miscs?: Array<MiscSection>;
  modules?: Array<ModuleSection>;
  classes?: Array<SignatureSection>;
  methods?: Array<MethodSignature>;
  properties?: Array<PropertySection>;
  globals?: ModuleSection | { type: 'global' };
  signatures?: Array<SignatureSection>;
}

export interface SignatureSection extends SectionBase {
  type: 'class' | 'ctor' | 'classMethod' | 'method';
  signatures: Array<MethodSignature>;
}

export type Section =
  | SignatureSection
  | PropertySection
  | EventSection
  | MiscSection;

export interface Parameter {
  name: string;
  optional?: boolean;
  default?: string;
}

export interface MethodSignature {
  params: Array<Parameter>;
  return?: string;
}

export interface PropertySection extends SectionBase {
  type: 'property';
  [key: string]: string | undefined;
}

export interface EventSection extends SectionBase {
  type: 'event';
  params: Array<ListItem>;
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
