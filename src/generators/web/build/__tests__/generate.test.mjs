import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as t from '@babel/types';

import createAstBuilder, { createImportDeclaration } from '../generate.mjs';

describe('createImportDeclaration', () => {
  it('should create default import', () => {
    const ast = createImportDeclaration('React', 'react');

    assert.equal(ast.type, 'ImportDeclaration');
    assert.equal(ast.source.value, 'react');
    assert.equal(ast.specifiers.length, 1);
    assert.equal(ast.specifiers[0].type, 'ImportDefaultSpecifier');
  });

  it('should create named import', () => {
    const ast = createImportDeclaration('useState', 'react', false);

    assert.equal(ast.type, 'ImportDeclaration');
    assert.equal(ast.specifiers[0].type, 'ImportSpecifier');
  });

  it('should create side-effect import', () => {
    const ast = createImportDeclaration(null, './styles.css');

    assert.equal(ast.specifiers.length, 0);
    assert.equal(ast.source.value, './styles.css');
  });
});

describe('AST Builder', () => {
  const builder = createAstBuilder();
  const mockComponent = t.identifier('MyComponent');

  it('should build client program with hydrate call', () => {
    const code = builder.buildClientProgram(mockComponent);

    assert.ok(code.includes('hydrate'));
    assert.ok(code.includes('document.getElementById'));
    assert.ok(code.includes('"root"'));
  });

  it('should build server program with renderToStringAsync', () => {
    const code = builder.buildServerProgram(mockComponent);

    assert.ok(code.includes('renderToStringAsync'));
    assert.ok(code.includes('code ='));
  });

  it('should include CSS import in client only', () => {
    const clientCode = builder.buildClientProgram(mockComponent);
    const serverCode = builder.buildServerProgram(mockComponent);

    assert.ok(clientCode.includes('./index.css'));
    assert.ok(!serverCode.includes('./index.css'));
  });

  it('should return object with both build functions', () => {
    assert.equal(typeof builder.buildClientProgram, 'function');
    assert.equal(typeof builder.buildServerProgram, 'function');
  });
});
