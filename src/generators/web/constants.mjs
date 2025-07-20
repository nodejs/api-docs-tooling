import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = dirname(fileURLToPath(import.meta.url));

/**
 * Converts a filesystem path to POSIX-style format on non-POSIX platforms.
 *
 * @param {string} path - The original file path.
 * @returns {string} The normalized path using POSIX-style separators if applicable.
 */
export const toPosixPath = path => {
  return process.platform === 'win32' ? path.replaceAll('\\', '/') : path;
};

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
    source: toPosixPath(resolve(ROOT, './ui/components/NavBar')),
  },
  SideBar: {
    name: 'SideBar',
    source: toPosixPath(resolve(ROOT, './ui/components/SideBar')),
  },
  MetaBar: {
    name: 'MetaBar',
    source: toPosixPath(resolve(ROOT, './ui/components/MetaBar')),
  },
  CodeBox: {
    name: 'CodeBox',
    source: toPosixPath(resolve(ROOT, './ui/components/CodeBox')),
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
