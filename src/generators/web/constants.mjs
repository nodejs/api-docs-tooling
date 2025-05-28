import { fileURLToPath } from 'node:url';

export const RESOLVE_DIR = fileURLToPath(new URL('./ui', import.meta.url));

// Imports are relative to RESOLVE_DIR, and must be complete paths (w/ file extensions)
export const JSX_IMPORTS = {
  NavBar: {
    name: 'NavBar',
    source: './components/NavBar.jsx',
  },
  SideBar: {
    name: 'SideBar',
    source: './components/SideBar.jsx',
  },
  MetaBar: {
    name: 'MetaBar',
    source: './components/MetaBar.jsx',
  },
  CodeBox: {
    name: 'CodeBox',
    source: './components/CodeBox.jsx',
  },
  CodeTabs: {
    name: 'CodeTabs',
    source: '@node-core/ui-components/MDX/CodeTabs.tsx',
  },
  ChangeHistory: {
    name: 'ChangeHistory',
    source: '@node-core/ui-components/Common/ChangeHistory/index.tsx',
  },
  AlertBox: {
    name: 'AlertBox',
    source: '@node-core/ui-components/Common/AlertBox/index.tsx',
  },
  Article: {
    name: 'Article',
    source: '@node-core/ui-components/Containers/Article/index.tsx',
  },
  Blockquote: {
    name: 'Blockquote',
    source: '@node-core/ui-components/Common/Blockquote/index.tsx',
  },
  DataTag: {
    name: 'DataTag',
    source: '@node-core/ui-components/Common/DataTag/index.tsx',
  },
};
