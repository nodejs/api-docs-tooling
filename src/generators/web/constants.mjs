import { fileURLToPath } from 'node:url';

export const ESBUILD_RESOLVE_DIR = fileURLToPath(
  new URL('./client', import.meta.url)
);

export const TEMPLATE_PLACEHOLDERS = {
  TITLE: '__TITLE__',
  DEHYDRATED: '__DEHYDRATED__',
  JAVASCRIPT: '__JAVASCRIPT__',
};

// Imports are relative to ESBUILD_RESOLVE_DIR
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
  Footer: {
    name: 'Footer',
    source: './components/Footer.jsx',
  },
  ChangeHistory: {
    name: 'ChangeHistory',
    source: './components/ChangeHistory.jsx',
  },
  CircularIcon: {
    name: 'CircularIcon',
    source: './components/CircularIcon.jsx',
  },
  CodeBox: {
    name: 'CodeBox',
    source: './components/CodeBox.jsx',
  },
  CodeTabs: {
    name: 'CodeTabs',
    source: './components/CodeTabs.jsx',
  },
  Article: {
    name: 'Article',
    source: '@node-core/ui-components/Containers/Article/index.tsx',
  },
  Blockquote: {
    name: 'Blockquote',
    source: '@node-core/ui-components/Common/Blockquote/index.tsx',
  },
  AlertBox: {
    name: 'AlertBox',
    source: '@node-core/ui-components/Common/AlertBox/index.tsx',
  },
};
