'use strict';

// The current running version of Node.js (Environment)
export const DOC_NODE_VERSION = process.version;

// This is the Node.js CHANGELOG to be consumed to generate a list of all major Node.js versions
export const DOC_NODE_CHANGELOG_URL =
  'https://raw.githubusercontent.com/nodejs/node/HEAD/CHANGELOG.md';

// The base URL for the Node.js runtime GitHub repository
export const DOC_NODE_REPO_URL = 'https://github.com/nodejs/node';

// This is the Node.js Base URL for viewing a file within GitHub UI
export const DOC_NODE_BLOB_BASE_URL =
  'https://github.com/nodejs/node/blob/HEAD/';

// This is the Node.js API docs base URL for editing a file on GitHub UI
export const DOC_API_BLOB_EDIT_BASE_URL =
  'https://github.com/nodejs/node/edit/main/doc/api/';

// Base URL for a specific Node.js version within the Node.js API docs
export const DOC_API_BASE_URL_VERSION = 'https://nodejs.org/docs/latest-v';

// This is the perma-link within the API docs that reference the Stability Index
export const DOC_API_STABILITY_SECTION_REF_URL =
  'documentation.html#stability-index';

// This is the base URL of the MDN Web documentation
export const DOC_MDN_BASE_URL = 'https://developer.mozilla.org/en-US/docs/Web/';

// This is the base URL for the MDN JavaScript documentation
export const DOC_MDN_BASE_URL_JS = `${DOC_MDN_BASE_URL}JavaScript/`;

// This is the base URL for the MDN JavaScript primitives documentation
export const DOC_MDN_BASE_URL_JS_PRIMITIVES = `${DOC_MDN_BASE_URL_JS}Data_structures`;

// This is the base URL for the MDN JavaScript global objects documentation
export const DOC_MDN_BASE_URL_JS_GLOBALS = `${DOC_MDN_BASE_URL_JS}Reference/Global_Objects/`;

// These are YAML keys from the Markdown YAML metadata that should be
// removed and appended to the `update` key
export const DOC_API_YAML_KEYS_UPDATE = [
  'added',
  'removed',
  'deprecated',
  'introduced_in',
  'napiVersion',
];

// These are string replacements specific to Node.js API docs for anchor IDs
export const DOC_API_SLUGS_REPLACEMENTS = [
  { from: /node.js/i, to: 'nodejs' }, // Replace Node.js
  { from: /&/, to: '-and-' }, // Replace &
  { from: /[/_,:;\\ ]/g, to: '-' }, // Replace /_,:;\. and whitespace
  { from: /--+/g, to: '-' }, // Replace multiple hyphens with single
  { from: /^-/, to: '' }, // Remove any leading hyphen
  { from: /-$/, to: '' }, // Remove any trailing hyphen
];

// These are regular expressions used to determine if a given Markdown heading
// is a specific type of API Doc entry (e.g., Event, Class, Method, etc)
// and to extract the inner content of said Heading to be used as the API doc entry name
export const DOC_API_HEADING_TYPES = [
  {
    type: 'method',
    regex:
      // Group 1: foo[bar]()
      // Group 2: foo.bar()
      // Group 3: foobar()
      /^`?(?:\w*(?:(\[[^\]]+\])|(?:\.(\w+)))|(\w+))\([^)]*\)`?$/i,
  },
  { type: 'event', regex: /^Event: +`?['"]?([^'"]+)['"]?`?$/i },
  {
    type: 'class',
    regex:
      /^Class: +`?([A-Z]\w+(?:\.[A-Z]\w+)*(?: +extends +[A-Z]\w+(?:\.[A-Z]\w+)*)?)`?$/i,
  },
  {
    type: 'ctor',
    regex: /^(?:Constructor: +)?`?new +([A-Z]\w+(?:\.[A-Z]\w+)*)\([^)]*\)`?$/i,
  },
  {
    type: 'classMethod',
    regex:
      /^Static method: +`?[A-Z]\w+(?:\.[A-Z]\w+)*(?:(\[\w+\.\w+\])|\.(\w+))\([^)]*\)`?$/i,
  },
  {
    type: 'property',
    regex:
      /^(?:Class property: +)?`?[A-Z]\w+(?:\.[A-Z]\w+)*(?:(\[\w+\.\w+\])|\.(\w+))`?$/i,
  },
];

// This is a mapping for the `API` updates within the Markdown content and their respective
// content that should be mapping into `changes` property for better mapping on HTML
export const DOC_API_UPDATE_MAPPING = {
  added: 'Added in',
  removed: 'Removed in',
  deprecated: 'Deprecated since',
  introduced_in: 'Introduced in',
  napiVersion: 'N-API Version',
};

// This is a mapping for types within the Markdown content and their respective
// JavaScript primitive types within the MDN JavaScript docs
// @see DOC_MDN_BASE_URL_JS_PRIMITIVES
export const DOC_TYPES_MAPPING_PRIMITIVES = {
  boolean: 'Boolean',
  integer: 'Number', // Not a primitive, used for clarification.
  null: 'Null',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
  undefined: 'Undefined',
};

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#options
// This slug should reference the section where the available
// options are defined.
export const DOC_SLUG_OPTIONS = 'options';

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#environment-variables-1
// This slug should reference the section where the available
// environment variables are defined.
export const DOC_SLUG_ENVIRONMENT = 'environment-variables-1';

// This is a mapping for types within the Markdown content and their respective
// JavaScript globals types within the MDN JavaScript docs
// @see DOC_MDN_BASE_URL_JS_GLOBALS
export const DOC_TYPES_MAPPING_GLOBALS = {
  ...Object.fromEntries(
    [
      'AggregateError',
      'Array',
      'ArrayBuffer',
      'DataView',
      'Date',
      'Error',
      'EvalError',
      'Function',
      'Map',
      'NaN',
      'Object',
      'Promise',
      'Proxy',
      'RangeError',
      'ReferenceError',
      'RegExp',
      'Set',
      'SharedArrayBuffer',
      'SyntaxError',
      'Symbol',
      'TypeError',
      'URIError',
      'WeakMap',
      'WeakSet',

      'TypedArray',
      'Float32Array',
      'Float64Array',
      'Int8Array',
      'Int16Array',
      'Int32Array',
      'Uint8Array',
      'Uint8ClampedArray',
      'Uint16Array',
      'Uint32Array',
    ].map(e => [e, e])
  ),
  bigint: 'BigInt',
  'WebAssembly.Instance': 'WebAssembly/Instance',
};

// This is a mapping for types within the Markdown content and their respective
// Node.js types within the Node.js API docs (refers to a different API doc page)
// Note: These hashes are generated with the GitHub Slugger
export const DOC_TYPES_MAPPING_NODE_MODULES = {
  AbortController: 'globals.html#class-abortcontroller',
  AbortSignal: 'globals.html#class-abortsignal',

  AlgorithmIdentifier: 'webcrypto.html#class-algorithmidentifier',
  AsyncHook: 'async_hooks.html#async_hookscreatehookcallbacks',
  AsyncLocalStorage: 'async_context.html#class-asynclocalstorage',
  AsyncResource: 'async_hooks.html#class-asyncresource',

  AesCbcParams: 'webcrypto.html#class-aescbcparams',
  AesCtrParams: 'webcrypto.html#class-aesctrparams',
  AesGcmParams: 'webcrypto.html#class-aesgcmparams',
  AesKeyGenParams: 'webcrypto.html#class-aeskeygenparams',

  Blob: 'buffer.html#class-blob',
  BroadcastChannel:
    'worker_threads.html#class-broadcastchannel-extends-eventtarget',
  Buffer: 'buffer.html#class-buffer',

  ByteLengthQueuingStrategy: 'webstreams.html#class-bytelengthqueuingstrategy',

  Channel: 'diagnostics_channel.html#class-channel',
  ChildProcess: 'child_process.html#class-childprocess',
  Cipher: 'crypto.html#class-cipher',
  ClientHttp2Session: 'http2.html#class-clienthttp2session',
  ClientHttp2Stream: 'http2.html#class-clienthttp2stream',

  CountQueuingStrategy: 'webstreams.html#class-countqueuingstrategy',

  Crypto: 'webcrypto.html#class-crypto',
  CryptoKey: 'webcrypto.html#class-cryptokey',
  CryptoKeyPair: 'webcrypto.html#class-cryptokeypair',

  CustomEvent: 'events.html#class-customevent',

  Decipher: 'crypto.html#class-decipher',
  DiffieHellman: 'crypto.html#class-diffiehellman',
  DiffieHellmanGroup: 'crypto.html#class-diffiehellmangroup',
  Domain: 'domain.html#class-domain',

  Duplex: 'stream.html#class-streamduplex',

  ECDH: 'crypto.html#class-ecdh',
  EcdhKeyDeriveParams: 'webcrypto.html#class-ecdhkeyderiveparams',
  EcdsaParams: 'webcrypto.html#class-ecdsaparams',
  EcKeyGenParams: 'webcrypto.html#class-eckeygenparams',
  EcKeyImportParams: 'webcrypto.html#class-eckeyimportparams',
  Ed448Params: 'webcrypto.html#class-ed448params',

  Event: 'events.html#class-event',
  EventEmitter: 'events.html#class-eventemitter',
  EventListener: 'events.html#event-listener',
  EventTarget: 'events.html#class-eventtarget',

  File: 'buffer.html#class-file',
  FileHandle: 'fs.html#class-filehandle',

  Handle: 'net.html#serverlistenhandle-backlog-callback',
  Hash: 'crypto.html#class-hash',
  Histogram: 'perf_hooks.html#class-histogram',
  HkdfParams: 'webcrypto.html#class-hkdfparams',
  Hmac: 'crypto.html#class-hmac',
  HmacImportParams: 'webcrypto.html#class-hmacimportparams',
  HmacKeyGenParams: 'webcrypto.html#class-hmackeygenparams',

  Http2SecureServer: 'http2.html#class-http2secureserver',
  Http2Server: 'http2.html#class-http2server',
  Http2Session: 'http2.html#class-http2session',
  Http2Stream: 'http2.html#class-http2stream',

  Immediate: 'timers.html#class-immediate',

  IntervalHistogram:
    'perf_hooks.html#class-intervalhistogram-extends-histogram',

  KeyObject: 'crypto.html#class-keyobject',

  MIMEParams: 'util.html#class-utilmimeparams',
  MessagePort: 'worker_threads.html#class-messageport',

  MockModuleContext: 'test.html#class-mockmodulecontext',

  NodeEventTarget: 'events.html#class-nodeeventtarget',

  Pbkdf2Params: 'webcrypto.html#class-pbkdf2params',
  PerformanceEntry: 'perf_hooks.html#class-performanceentry',
  PerformanceNodeTiming: 'perf_hooks.html#class-performancenodetiming',
  PerformanceObserver: 'perf_hooks.html#class-performanceobserver',
  PerformanceObserverEntryList:
    'perf_hooks.html#class-performanceobserverentrylist',

  Readable: 'stream.html#class-streamreadable',
  ReadableByteStreamController:
    'webstreams.html#class-readablebytestreamcontroller',
  ReadableStream: 'webstreams.html#class-readablestream',
  ReadableStreamBYOBReader: 'webstreams.html#class-readablestreambyobreader',
  ReadableStreamBYOBRequest: 'webstreams.html#class-readablestreambyobrequest',
  ReadableStreamDefaultController:
    'webstreams.html#class-readablestreamdefaultcontroller',
  ReadableStreamDefaultReader:
    'webstreams.html#class-readablestreamdefaultreader',

  RecordableHistogram:
    'perf_hooks.html#class-recordablehistogram-extends-histogram',

  RsaHashedImportParams: 'webcrypto.html#class-rsahashedimportparams',
  RsaHashedKeyGenParams: 'webcrypto.html#class-rsahashedkeygenparams',
  RsaOaepParams: 'webcrypto.html#class-rsaoaepparams',
  RsaPssParams: 'webcrypto.html#class-rsapssparams',

  ServerHttp2Session: 'http2.html#class-serverhttp2session',
  ServerHttp2Stream: 'http2.html#class-serverhttp2stream',

  Sign: 'crypto.html#class-sign',

  StatementSync: 'sqlite.html#class-statementsync',

  Stream: 'stream.html#stream',

  SubtleCrypto: 'webcrypto.html#class-subtlecrypto',

  TestsStream: 'test.html#class-testsstream',

  TextDecoderStream: 'webstreams.html#class-textdecoderstream',
  TextEncoderStream: 'webstreams.html#class-textencoderstream',

  Timeout: 'timers.html#class-timeout',
  Timer: 'timers.html#timers',

  Tracing: 'tracing.html#tracing-object',
  TracingChannel: 'diagnostics_channel.html#class-tracingchannel',

  Transform: 'stream.html#class-streamtransform',
  TransformStream: 'webstreams.html#class-transformstream',
  TransformStreamDefaultController:
    'webstreams.html#class-transformstreamdefaultcontroller',

  URL: 'url.html#the-whatwg-url-api',
  URLSearchParams: 'url.html#class-urlsearchparams',

  Verify: 'crypto.html#class-verify',

  Writable: 'stream.html#class-streamwritable',
  WritableStream: 'webstreams.html#class-writablestream',
  WritableStreamDefaultController:
    'webstreams.html#class-writablestreamdefaultcontroller',
  WritableStreamDefaultWriter:
    'webstreams.html#class-writablestreamdefaultwriter',

  Worker: 'worker_threads.html#class-worker',

  X509Certificate: 'crypto.html#class-x509certificate',

  'brotli options': 'zlib.html#class-brotlioptions',

  'cluster.Worker': 'cluster.html#class-worker',

  'crypto.constants': 'crypto.html#cryptoconstants',

  'dgram.Socket': 'dgram.html#class-dgramsocket',

  'errors.Error': 'errors.html#class-error',

  'fs.Dir': 'fs.html#class-fsdir',
  'fs.Dirent': 'fs.html#class-fsdirent',
  'fs.FSWatcher': 'fs.html#class-fsfswatcher',
  'fs.ReadStream': 'fs.html#class-fsreadstream',
  'fs.StatFs': 'fs.html#class-fsstatfs',
  'fs.Stats': 'fs.html#class-fsstats',
  'fs.StatWatcher': 'fs.html#class-fsstatwatcher',
  'fs.WriteStream': 'fs.html#class-fswritestream',

  'http.Agent': 'http.html#class-httpagent',
  'http.ClientRequest': 'http.html#class-httpclientrequest',
  'http.IncomingMessage': 'http.html#class-httpincomingmessage',
  'http.OutgoingMessage': 'http.html#class-httpoutgoingmessage',
  'http.Server': 'http.html#class-httpserver',
  'http.ServerResponse': 'http.html#class-httpserverresponse',

  'http2.Http2ServerRequest': 'http2.html#class-http2http2serverrequest',
  'http2.Http2ServerResponse': 'http2.html#class-http2http2serverresponse',

  'import.meta': 'esm.html#importmeta',

  'module.SourceMap': 'module.html#class-modulesourcemap',

  'net.BlockList': 'net.html#class-netblocklist',
  'net.Server': 'net.html#class-netserver',
  'net.Socket': 'net.html#class-netsocket',
  'net.SocketAddress': 'net.html#class-netsocketaddress',

  'os.constants.dlopen': 'os.html#dlopen-constants',

  'readline.Interface': 'readline.html#class-readlineinterface',
  'readline.InterfaceConstructor': 'readline.html#class-interfaceconstructor',
  'readlinePromises.Interface': 'readline.html#class-readlinepromisesinterface',

  'repl.REPLServer': 'repl.html#class-replserver',

  require: 'modules.html#requireid',

  'stream.Duplex': 'stream.html#class-streamduplex',
  'stream.Readable': 'stream.html#class-streamreadable',
  'stream.Transform': 'stream.html#class-streamtransform',
  'stream.Writable': 'stream.html#class-streamwritable',

  'tls.SecureContext': 'tls.html#tlscreatesecurecontextoptions',
  'tls.Server': 'tls.html#class-tlsserver',
  'tls.TLSSocket': 'tls.html#class-tlstlssocket',

  'tty.ReadStream': 'tty.html#class-ttyreadstream',
  'tty.WriteStream': 'tty.html#class-ttywritestream',

  'vm.Module': 'vm.html#class-vmmodule',
  'vm.Script': 'vm.html#class-vmscript',
  'vm.SourceTextModule': 'vm.html#class-vmsourcetextmodule',
  'vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER':
    'vm.html#vmconstantsuse_main_context_default_loader',

  'zlib options': 'zlib.html#class-options',
};

// This is a mapping for miscellaneous types within the Markdown content and their respective
// external reference on appropriate 3rd-party vendors/documentation sites.
export const DOC_TYPES_MAPPING_OTHER = {
  any: `${DOC_MDN_BASE_URL_JS_PRIMITIVES}#Data_types`,
  this: `${DOC_MDN_BASE_URL_JS}Reference/Operators/this`,

  ArrayBufferView:
    'https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView',

  AsyncIterator: 'https://tc39.github.io/ecma262/#sec-asynciterator-interface',
  AsyncIterable: 'https://tc39.github.io/ecma262/#sec-asynciterable-interface',
  AsyncFunction: 'https://tc39.es/ecma262/#sec-async-function-constructor',

  'Module Namespace Object':
    'https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects',

  AsyncGeneratorFunction:
    'https://tc39.es/proposal-async-iteration/#sec-asyncgeneratorfunction-constructor',

  Iterable: `${DOC_MDN_BASE_URL_JS}Reference/Iteration_protocols#The_iterable_protocol`,
  Iterator: `${DOC_MDN_BASE_URL_JS}Reference/Iteration_protocols#The_iterator_protocol`,

  FormData: `${DOC_MDN_BASE_URL}API/FormData`,
  Headers: `${DOC_MDN_BASE_URL}/API/Headers`,
  Response: `${DOC_MDN_BASE_URL}/API/Response`,
  Request: `${DOC_MDN_BASE_URL}/API/Request`,
};

export const LINT_MESSAGES = {
  missingIntroducedIn: "Missing 'introduced_in' field in the API doc entry",
  missingChangeVersion: 'Missing version field in the API doc entry',
  invalidChangeVersion: 'Invalid version number: {{version}}',
};
