import { Parent } from 'unist';

export interface StabilityIndexMetadataEntry {
  index: number;
  description: string;
}

export interface HeadingMetadataEntry {
  type:
    | 'event'
    | 'method'
    | 'property'
    | 'class'
    | 'module'
    | 'classMethod'
    | 'ctor';
  text: string;
  name: string;
  depth: number;
}

export interface ApiDocMetadataChange {
  // The Node.js version or versions where said change was introduced simultaneously
  version: string | string[];
  // The GitHub PR URL of said change
  'pr-url': string;
  // The description of said change
  description: string;
}

export interface ApiDocMetadataUpdate {
  // The type of the API doc Metadata update
  type: 'added' | 'removed' | 'deprecated' | 'introduced_in' | 'napiVersion';
  // The Node.js version or versions where said metadata stability index changed
  version: string[];
}

export interface ApiDocRawMetadataEntry {
  type?: string;
  name?: string;
  source_link?: string;
  updates?: ApiDocMetadataUpdate[];
  changes?: ApiDocMetadataChange[];
  stability_index?: StabilityIndexMetadataEntry;
}

export interface ApiDocMetadataEntry {
  // The name of the API doc file without the file extension (basename)
  api: string;
  // The unique slug of a Heading/Navigation entry which is linkable through an anchor
  slug: string;
  // The GitHub URL to the source of the API entry
  sourceLink: string | undefined;
  // Any updates to the API doc Metadata
  updates: ApiDocMetadataUpdate[];
  // Any changes to the API doc Metadata
  changes: ApiDocMetadataChange[];
  // The parsed Markdown content of a Navigation Entry
  heading: HeadingMetadataEntry;
  // The API doc metadata Entry Stability Index if exists
  stability: StabilityIndexMetadataEntry | undefined;
  // The subtree containing all Nodes of the API doc entry
  content: Parent;
  // String serialization of the AST tree
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
  toJSON: () => string;
}
