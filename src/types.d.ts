export interface ApiDocMetadata {
  // The name of the API Doc file without the file extenson (basename)
  name: string;
  // The Node.js release line (major) targeted for this API doc tooling
  // this version includes the `v` prefix (i.e.: v18)
  version: string;
  // The Node.js version targeted for this API doc tooling
  // this version includes the `v` prefix (i.e.: v18.0.0)
  fullVersion: string;
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
  update?: ApiDocMetadataUpdate;
  changes?: ApiDocMetadataChange[];
}

export interface ApiDocMetadataEntry extends ApiDocRawMetadataEntry {
  // The unique key of a given metadata entry
  key: string;
  // The unique slug of a Heading/Navigation Entry which is linkable through an anchor
  slug: string;
  // Human Readable Title (Plain Text) for a Navigation Entry
  title: string;
  // The API YAML Metadata Type for said entry
  type: string;
  // The name of the API Doc fle without the file extension (basename)
  name: string;
  // The parsed Markdown content of a Navigation Entry
  content: string;
}
