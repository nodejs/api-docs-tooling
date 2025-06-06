import { fileURLToPath } from 'node:url';

export const RESOLVE_DIR = fileURLToPath(new URL('./client', import.meta.url));

// Imports are relative to RESOLVE_DIR
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
  ChangeHistory: {
    name: 'ChangeHistory',
    source: './components/ChangeHistory.jsx',
  },
  CodeBox: {
    name: 'CodeBox',
    source: './components/CodeBox.jsx',
  },
  CodeTabs: {
    name: 'CodeTabs',
    source: '@node-core/ui-components/MDX/CodeTabs.tsx',
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
