import { VFile } from 'vfile';

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
  // The type of the API Doc Metadata update
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
}

export interface ApiDocNavigationEntry {
  // The name of the API Doc fle without the file extension (basename)
  api: string;
  // The unique slug of a Heading/Navigation Entry which is linkable through an anchor
  slug: string;
  // The GitHub URL to the source of the API Entry
  sourceLink: string | undefined;
  // Any updates to the API Doc Metadata
  updates: ApiDocMetadataUpdate[];
  // Any changes to the API Doc Metadata
  changes: ApiDocMetadataChange[];
  // The parsed Markdown content of a Navigation Entry
  heading: HeadingMetadataEntry;
}

export interface ApiDocMetadataEntry extends VFile {
  data: ApiDocNavigationEntry;
}
