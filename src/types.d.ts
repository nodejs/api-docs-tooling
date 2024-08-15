import type { Heading, Root } from 'mdast';
import type { SemVer } from 'semver';
import type { Parent, Node, Data } from 'unist';

// String serialization of the AST tree
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
interface WithJSON<T extends Node, J extends any = any> extends T {
  toJSON: () => J;
}

// Unist Node with typed Data, which allows better type inference
interface NodeWithData<T extends Node, J extends Data> extends T {
  data: J;
}

declare global {
  export interface StabilityIndexMetadataEntry {
    index: number;
    description: string;
  }

  export interface StabilityIndexParent extends Parent {
    children: Array<NodeWithData<Root, StabilityIndexMetadataEntry>>;
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
    slug: string;
  }

  export interface HeadingMetadataParent
    extends NodeWithData<Heading, HeadingMetadataEntry> {}

  export interface ApiDocMetadataChange {
    // The Node.js version or versions where said change was introduced simultaneously
    version: Array<string>;
    // The GitHub PR URL of said change
    'pr-url': string | undefined;
    // The description of said change
    description: string;
  }

  export interface ApiDocMetadataUpdate {
    // The type of the API doc Metadata update
    type: 'added' | 'removed' | 'deprecated' | 'introduced_in' | 'napiVersion';
    // The Node.js version or versions where said metadata stability index changed
    version: Array<string>;
  }

  export interface ApiDocRawMetadataEntry {
    type?: string;
    name?: string;
    source_link?: string;
    updates?: Array<ApiDocMetadataUpdate>;
    changes?: Array<ApiDocMetadataChange>;
    tags?: Array<string>;
  }

  export interface ApiDocMetadataEntry {
    // The name of the API doc file without the file extension (basename)
    api: string;
    // The unique slug of a Heading/Navigation entry which is linkable through an anchor
    slug: string;
    // The GitHub URL to the source of the API entry
    sourceLink: string | undefined;
    // Any updates to the API doc Metadata
    updates: Array<ApiDocMetadataUpdate>;
    // Any changes to the API doc Metadata
    changes: Array<ApiDocMetadataChange>;
    // The parsed Markdown content of a Navigation Entry
    heading: WithJSON<HeadingMetadataParent, HeadingMetadataEntry>;
    // The API doc metadata Entry Stability Index if exists
    stability: WithJSON<
      StabilityIndexParent,
      Array<StabilityIndexMetadataEntry>
    >;
    // The subtree containing all Nodes of the API doc entry
    content: Root;
    // Extra YAML section entries that are stringd and serve
    // to provide additional metadata about the API doc entry
    tags: Array<string>;
  }

  export interface ApiDocReleaseEntry {
    version: SemVer;
    isLts: boolean;
  }
}
