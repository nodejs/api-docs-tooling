import { parse, relative, sep, dirname } from 'node:path';
import { resolve } from 'node:path/posix';
import { fileURLToPath } from 'node:url';

// Convert the current module's URL to a filesystem path,
// then calculate the relative path from the system root directory
// to this file. This relative path uses platform-specific separators,
// so replace them with forward slashes ("/") for consistency and web compatibility.
// Finally, prepend a leading slash to form an absolute root-relative path string.
//
// This produces a POSIX-style absolute path, even on Windows systems.
const dir = dirname(fileURLToPath(import.meta.url));
export const ROOT = '/' + relative(parse(dir).root, dir).replaceAll(sep, '/');

/**
 * @typedef {Object} JSXImportConfig
 * @property {string} name - The name of the component to be imported.
 * @property {string} source - The path to the component's source file or package.
 * @property {boolean} [isDefaultExport=true] - Indicates if it's a default export (true) or named export (false). Defaults to true if not specified.
 */

/**
 * @type {Record<string, JSXImportConfig>}
 * An object containing mappings for various JSX components to their import paths.
 */
export const JSX_IMPORTS = {
  NavBar: {
    name: 'NavBar',
    source: resolve(ROOT, './ui/components/NavBar'),
  },
  SideBar: {
    name: 'SideBar',
    source: resolve(ROOT, './ui/components/SideBar'),
  },
  MetaBar: {
    name: 'MetaBar',
    source: resolve(ROOT, './ui/components/MetaBar'),
  },
  CodeBox: {
    name: 'CodeBox',
    source: resolve(ROOT, './ui/components/CodeBox'),
  },
  CodeTabs: {
    name: 'CodeTabs',
    source: '@node-core/ui-components/MDX/CodeTabs',
  },
  ChangeHistory: {
    name: 'ChangeHistory',
    source: '@node-core/ui-components/Common/ChangeHistory',
  },
  AlertBox: {
    name: 'AlertBox',
    source: '@node-core/ui-components/Common/AlertBox',
  },
  Article: {
    name: 'Article',
    source: '@node-core/ui-components/Containers/Article',
  },
  Blockquote: {
    name: 'Blockquote',
    source: '@node-core/ui-components/Common/Blockquote',
  },
  DataTag: {
    name: 'DataTag',
    source: '@node-core/ui-components/Common/DataTag',
  },
  ArrowUpRightIcon: {
    name: 'ArrowUpRightIcon',
    source: '@heroicons/react/24/solid/ArrowUpRightIcon',
  },
  NotificationProvider: {
    name: 'NotificationProvider',
    isDefaultExport: false,
    source: '@node-core/ui-components/Providers/NotificationProvider',
  },
};
