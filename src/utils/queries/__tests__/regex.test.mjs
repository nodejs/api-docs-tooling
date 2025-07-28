import * as regexps from '../regex.mjs';
import testRegExp from './testRegExp.mjs';

/**
 * Test case definitions for regular expressions.
 */
const testCases = {
  CLASS_HEADING: [
    {
      input: 'Class: Buffer',
      captures: 'Buffer',
    },
    {
      input: 'Class: EventEmitter extends NodeEventTarget',
      captures: 'EventEmitter extends NodeEventTarget',
    },
    {
      input: 'Class: `Stream`',
      captures: 'Stream',
    },
    {
      input: 'class: Buffer',
      captures: 'Buffer',
    },
    {
      input: 'Class Buffer',
      matches: false,
    },
    {
      input: 'Class: a.b.c.D extends e.f.G',
      captures: 'a.b.c.D extends e.f.G',
    },
    {
      input: 'Class: `ChildProcess extends EventEmitter`',
      captures: 'ChildProcess extends EventEmitter',
    },
    {
      input: 'Class: Socket',
      captures: 'Socket',
    },
  ],

  CLASS_METHOD_HEADING: [
    {
      input: 'Static method: Buffer.isBuffer()',
      matches: true,
    },
    {
      input: 'Static method: `Object[util.inspect.custom]()`',
      matches: true,
    },
    {
      input: 'static method: Buffer.isBuffer()',
      matches: true,
    },
    {
      input: 'Static method Buffer.isBuffer()',
      matches: false,
    },
    {
      input: 'Static method: a.b.c.method()',
      matches: true,
    },
    {
      input: 'Static method: Class.staticMethod(arg1, arg2)',
      matches: true,
    },
    {
      input: 'Static method: Module.method()',
      matches: true,
    },
  ],

  CTOR_HEADING: [
    {
      input: 'new Buffer()',
      captures: 'Buffer',
    },
    {
      input: 'Constructor: new Stream()',
      captures: 'Stream',
    },
    {
      input: 'new namespace.Class()',
      captures: 'namespace.Class',
    },
    {
      input: 'Constructor: Buffer()',
      matches: false,
    },
    {
      input: 'new URL(input[, base])',
      captures: 'URL',
    },
    {
      input: 'Constructor: new `EventEmitter()`',
      captures: 'EventEmitter',
    },
  ],

  PROPERTY_HEADING: [
    {
      input: 'Class.property',
      matches: true,
    },
    {
      input: 'Class property: Buffer.poolSize',
      matches: true,
    },
    {
      input: '`process.env`',
      matches: true,
    },
    {
      input: 'Class property Buffer.poolSize',
      matches: false,
    },
    {
      input: 'fs[Symbol.asyncIterator]',
      matches: true,
    },
    {
      input: 'process.env',
      matches: true,
    },
  ],

  METHOD_HEADING: [
    {
      input: '`readFile()`',
      matches: true,
    },
    {
      input: '`array[Symbol.iterator]()`',
      matches: true,
    },
    {
      input: 'fs.readFile()',
      matches: false,
    },
    {
      input: '`a.b.c.method(x, y, z = {})`',
      matches: true,
    },
    {
      input: '`something()`',
      matches: true,
    },
    {
      input: '`fs.readFile()`',
      matches: true,
    },
    {
      input: '`http.request()`',
      matches: true,
    },
    {
      input: '`array.forEach()`',
      matches: true,
    },
    {
      input: '`emitter.on(eventName, listener)`',
      matches: true,
    },
  ],

  EVENT_HEADING: [
    {
      input: "Event: 'close'",
      captures: 'close',
    },
    {
      input: 'Event: "data"',
      captures: 'data',
    },
    {
      input: 'Event: error',
      captures: 'error',
    },
    {
      input: 'Event "close"',
      matches: false,
    },
    {
      input: "Event: 'connection'",
      captures: 'connection',
    },
  ],

  LINKS_WITH_TYPES: [
    {
      input: 'Returns [`<Buffer>`](/api/buffer) or [`<string>`](/api/string)',
      matches: ['[`<Buffer>`](/api/buffer)', '[`<string>`](/api/string)'],
    },
    {
      input: '[link text](url)',
      matches: false,
    },
  ],

  TYPED_LIST_STARTERS: [
    {
      input: 'Returns: {string}',
      matches: 'Returns: ',
    },
    {
      input: 'Type: {Object}',
      matches: 'Type: ',
    },
    {
      input: 'returns: {string}',
      matches: false,
    },
    {
      input: 'Extends: {EventEmitter}',
      matches: 'Extends: ',
    },
    {
      input: 'Returns:',
      matches: 'Returns:',
    },
  ],

  MARKDOWN_URL: [
    {
      input: 'fs.md',
      captures: ['fs', undefined],
    },
    {
      input: 'buffer.md#buffer_class_buffer',
      captures: ['buffer', '#buffer_class_buffer'],
    },
    {
      input: 'http://example.com/file.md',
      matches: false,
    },
    {
      input: 'stream.md#stream_readable_streams',
      captures: ['stream', '#stream_readable_streams'],
    },
    {
      input: 'errors.md#errors_class_error',
      captures: ['errors', '#errors_class_error'],
    },
  ],

  UNIX_MANUAL_PAGE: [
    {
      input: 'See ls(1) for more information',
      matches: ['ls(1)'],
      captures: ['ls', '1', ''],
    },
    {
      input: 'Check printf(3) and malloc(3c)',
      matches: ['printf(3)', 'malloc(3c)'],
      captures: [
        ['printf', '3', ''],
        ['malloc', '3', 'c'],
      ],
    },
    {
      input: 'function(args)',
      matches: [],
    },
    {
      input: 'socket(7)',
      matches: ['socket(7)'],
      captures: ['socket', '7', ''],
    },
    {
      input: 'signal.h(0p)',
      matches: ['signal.h(0p)'],
      captures: ['signal.h', '0', 'p'],
    },
  ],

  STABILITY_INDEX_PREFIX: [
    {
      input: 'Stability: 0',
      captures: '0',
    },
    {
      input: 'Stability: 3.1',
      captures: '3.1',
    },
    {
      input: 'Stability: 6',
      matches: false,
    },
    {
      input: 'Stability: 2',
      captures: '2',
    },
    {
      input: 'Stability: 5',
      captures: '5',
    },
  ],

  STABILITY_INDEX: [
    {
      input: 'Stability: 0 - Deprecated',
      captures: ['0', 'Deprecated'],
    },
    {
      input: 'Stability: 2-Stable',
      captures: ['2', 'Stable'],
    },
    {
      input: 'Stability: 3',
      captures: ['3', ''],
    },
    {
      input: 'Stability: 1 - Experimental',
      captures: ['1', 'Experimental'],
    },
    {
      input: 'Stability: 3.1 - Legacy',
      captures: ['3.1', 'Legacy'],
    },
  ],

  YAML_INNER_CONTENT: [
    {
      input: '<!-- YAML\ntitle: Example\ndescription: This is an example\n-->',
      captures: [
        '\ntitle: Example\ndescription: This is an example\n',
        undefined,
        undefined,
      ],
    },
    {
      input: '<!-- >',
      matches: false,
    },
    {
      input: '<!-- YAML foo bar -->',
      captures: [' foo bar', undefined, undefined],
    },
    {
      input: '<!-- description -->',
      captures: [undefined, 'description', undefined],
    },
  ],

  EXTRACT_CODE_FILENAME_COMMENT: [
    {
      input: '// example.js\nconsole.log("hello");',
      captures: 'example.js',
    },
    {
      input: '//   lib/module.cc\n#include <iostream>',
      captures: 'lib/module.cc',
    },
    {
      input: '// src/header.h\n#ifndef HEADER_H',
      captures: 'src/header.h',
    },
    {
      input: '// not-a-valid-extension.txt\n',
      matches: false,
    },
    {
      input: 'console.log("no comment");',
      matches: false,
    },
  ],

  NAME_EXPRESSION: [
    {
      input: 'propertyName:',
      captures: 'propertyName',
    },
    {
      input: '"quoted-name":',
      captures: 'quoted-name',
    },
    {
      input: '`backtick-name`',
      captures: 'backtick-name',
    },
    {
      input: "'single-quoted':",
      captures: 'single-quoted',
    },
    {
      input: 'noColon',
      captures: 'noColon',
    },
    {
      input: 'spaced-out :',
      captures: 'spaced-out',
    },
  ],

  TYPE_EXPRESSION: [
    {
      input: '{string}',
      captures: 'string',
    },
    {
      input: '{Buffer|null}',
      captures: 'Buffer|null',
    },
    {
      input: '{Object}',
      captures: 'Object',
    },
    {
      input: '{Function} callback',
      captures: 'Function',
    },
    {
      input: 'no braces here',
      matches: false,
    },
  ],

  DEFAULT_EXPRESSION: [
    {
      input: '**Default:** `true`',
      captures: '`true`',
    },
    {
      input: '**Default:** 0',
      captures: '0',
    },
    {
      input: 'Some text **Default:** false',
      captures: 'false',
    },
    {
      input: '**default:** lowercase',
      captures: 'lowercase',
    },
    {
      input: 'No default here',
      matches: false,
    },
  ],

  PARAM_EXPRESSION: [
    {
      input: '(required)',
      captures: 'required',
    },
    {
      input: '(optional);',
      captures: 'optional',
    },
    {
      input: '(callback)',
      captures: 'callback',
    },
    {
      input: '(arg1, arg2)',
      captures: 'arg1, arg2',
    },
    {
      input: 'no parentheses',
      matches: false,
    },
  ],

  NODE_VERSIONS: [
    {
      input: '* [Node.js 18.0.0]https://example.com Some description\n',
      matches: ['* [Node.js 18.0.0]https://example.com Some description\n'],
      captures: [['18.0.0', 'Some description']],
    },
    {
      input:
        '* [Node.js 16.14.2]link Bug fixes\r\n* [Node.js 14.21.3]link More fixes\n',
      matches: [
        '* [Node.js 16.14.2]link Bug fixes\r\n',
        '* [Node.js 14.21.3]link More fixes\n',
      ],
      captures: [
        ['16.14.2', 'Bug fixes'],
        ['14.21.3', 'More fixes'],
      ],
    },
    {
      input: '- Not a Node.js version\n',
      matches: [],
    },
  ],

  MD_LINKED_LIST_ITEM: [
    {
      input: '* [Buffer](buffer.md)',
      matches: ['* [Buffer](buffer.md)'],
      captures: [['Buffer', 'buffer']],
    },
    {
      input: '* [File System](fs.md) and * [HTTP](http.md)',
      matches: ['* [File System](fs.md)', '* [HTTP](http.md)'],
      captures: [
        ['File System', 'fs'],
        ['HTTP', 'http'],
      ],
    },
    {
      input: '- [Not a match](file.txt)',
      matches: [],
    },
  ],

  INTRODUCED_IN: [
    {
      input: '<!-- introduced_in=v10.0.0 -->',
      matches: '<!-- introduced_in=v10.0.0 -->',
    },
    {
      input: '<!--introduced_in=v16.14.2-->',
      matches: '<!--introduced_in=v16.14.2-->',
    },
    {
      input: '<!-- introduced_in=v18.0.0 some extra text -->',
      matches: '<!-- introduced_in=v18.0.0 some extra text -->',
    },
    {
      input: '<!-- not_introduced_in=v10.0.0 -->',
      matches: false,
    },
  ],

  LLM_DESCRIPTION: [
    {
      input: '<!-- llm_description=This is a description -->',
      matches: '<!-- llm_description=This is a description -->',
    },
    {
      input: '<!--llm_description=No spaces-->',
      matches: '<!--llm_description=No spaces-->',
    },
    {
      input:
        '<!-- llm_description=Multi word description with punctuation! -->',
      matches:
        '<!-- llm_description=Multi word description with punctuation! -->',
    },
    {
      input: '<!-- not_llm_description=something -->',
      matches: false,
    },
  ],
};

for (const [regex, cases] of Object.entries(testCases)) {
  await testRegExp(regexps[regex], cases);
}
