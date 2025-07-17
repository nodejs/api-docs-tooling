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
    source: new URL('./ui/components/NavBar', import.meta.url).pathname,
  },
  SideBar: {
    name: 'SideBar',
    source: new URL('./ui/components/SideBar', import.meta.url).pathname,
  },
  MetaBar: {
    name: 'MetaBar',
    source: new URL('./ui/components/MetaBar', import.meta.url).pathname,
  },
  CodeBox: {
    name: 'CodeBox',
    source: new URL('./ui/components/CodeBox', import.meta.url).pathname,
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
