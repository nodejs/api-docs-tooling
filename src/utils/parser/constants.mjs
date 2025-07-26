'use strict';

// These are string replacements specific to Node.js API docs for anchor IDs
export const DOC_API_SLUGS_REPLACEMENTS = [
  { from: /node.js/i, to: 'nodejs' }, // Replace Node.js
  { from: /&/, to: '-and-' }, // Replace &
  { from: /[/_,:;\\ ]/g, to: '-' }, // Replace /_,:;\. and whitespace
  { from: /--+/g, to: '-' }, // Replace multiple hyphens with single
  { from: /^-/, to: '' }, // Remove any leading hyphen
  { from: /-$/, to: '' }, // Remove any trailing hyphen
];

// This is the base URL of the MDN Web documentation
export const DOC_MDN_BASE_URL = 'https://developer.mozilla.org/en-US/docs/Web/';

// This is the base URL of the Man7 documentation
export const DOC_MAN_BASE_URL = 'http://man7.org/linux/man-pages/man';

// This is the base URL for the MDN JavaScript documentation
export const DOC_MDN_BASE_URL_JS = `${DOC_MDN_BASE_URL}JavaScript/`;

// This is the base URL for the MDN JavaScript primitives documentation
export const DOC_MDN_BASE_URL_JS_PRIMITIVES = `${DOC_MDN_BASE_URL_JS}Data_structures`;

// This is the base URL for the MDN JavaScript global objects documentation
export const DOC_MDN_BASE_URL_JS_GLOBALS = `${DOC_MDN_BASE_URL_JS}Reference/Global_Objects/`;

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
      'Float16Array',
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

  Algorithm: 'webcrypto.html#class-algorithm',
  AlgorithmIdentifier: 'webcrypto.html#class-algorithmidentifier',
  AsyncHook: 'async_hooks.html#async_hookscreatehookcallbacks',
  AsyncLocalStorage: 'async_context.html#class-asynclocalstorage',
  AsyncResource: 'async_hooks.html#class-asyncresource',

  AesCbcParams: 'webcrypto.html#class-aescbcparams',
  AesCtrParams: 'webcrypto.html#class-aesctrparams',
  AesGcmParams: 'webcrypto.html#class-aesgcmparams',
  AesKeyAlgorithm: 'webcrypto.html#class-aeskeyalgorithm',
  AesKeyGenParams: 'webcrypto.html#class-aeskeygenparams',
  AesDerivedKeyParams: 'webcrypto.html#class-aesderivedkeyparams',

  Blob: 'buffer.html#class-blob',
  BroadcastChannel:
    'worker_threads.html#class-broadcastchannel-extends-eventtarget',
  Buffer: 'buffer.html#class-buffer',

  ByteLengthQueuingStrategy: 'webstreams.html#class-bytelengthqueuingstrategy',

  Channel: 'diagnostics_channel.html#class-channel',
  ChildProcess: 'child_process.html#class-childprocess',
  Cipher: 'crypto.html#class-cipher',
  Cipheriv: 'crypto.html#class-cipheriv',
  Decipheriv: 'crypto.html#class-decipheriv',
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
  EcKeyAlgorithm: 'webcrypto.html#class-eckeyalgorithm',
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
  HmacKeyAlgorithm: 'webcrypto.html#class-hmackeyalgorithm',
  HmacKeyGenParams: 'webcrypto.html#class-hmackeygenparams',

  Http2SecureServer: 'http2.html#class-http2secureserver',
  Http2Server: 'http2.html#class-http2server',
  Http2Session: 'http2.html#class-http2session',
  Http2Stream: 'http2.html#class-http2stream',

  Immediate: 'timers.html#class-immediate',

  IntervalHistogram:
    'perf_hooks.html#class-intervalhistogram-extends-histogram',

  LockManager: 'worker_threads.html#class-lockmanager',

  KeyAlgorithm: 'webcrypto.html#class-keyalgorithm',
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

  ModuleRequest: 'vm.html#type-modulerequest',

  DatabaseSync: 'sqlite.html#class-databasesync',

  RecordableHistogram:
    'perf_hooks.html#class-recordablehistogram-extends-histogram',

  RsaHashedKeyAlgorithm: 'webcrypto.html#class-rsahashedkeyalgorithm',
  RsaHashedImportParams: 'webcrypto.html#class-rsahashedimportparams',
  RsaHashedKeyGenParams: 'webcrypto.html#class-rsahashedkeygenparams',
  RsaOaepParams: 'webcrypto.html#class-rsaoaepparams',
  RsaPssParams: 'webcrypto.html#class-rsapssparams',

  ServerHttp2Session: 'http2.html#class-serverhttp2session',
  ServerHttp2Stream: 'http2.html#class-serverhttp2stream',

  Sign: 'crypto.html#class-sign',

  Disposable:
    'https://tc39.es/proposal-explicit-resource-management/#sec-disposable-interface',

  Session: 'sqlite.html#class-session',
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

  'import.meta': 'esm.html#importmeta',

  'os.constants.dlopen': 'os.html#dlopen-constants',

  'readlinePromises.Interface': 'readline.html#class-readlinepromisesinterface',

  require: 'modules.html#requireid',
  module: 'modules.html#the-module-object',

  'zlib options': 'zlib.html#class-options',
  'zstd options': 'zlib.html#class-zstdoptions',

  'HTTP/2 Headers Object': 'http2.html#headers-object',
  'HTTP/2 Settings Object': 'http2.html#settings-object',
};

// This is a mapping for miscellaneous types within the Markdown content and their respective
// external reference on appropriate 3rd-party vendors/documentation sites.
export const DOC_TYPES_MAPPING_OTHER = {
  any: `${DOC_MDN_BASE_URL_JS_PRIMITIVES}#Data_types`,
  this: `${DOC_MDN_BASE_URL_JS}Reference/Operators/this`,

  ArrayBufferView: `${DOC_MDN_BASE_URL}/API/ArrayBufferView`,

  AsyncIterator: 'https://tc39.github.io/ecma262/#sec-asynciterator-interface',
  AsyncIterable: 'https://tc39.github.io/ecma262/#sec-asynciterable-interface',
  AsyncFunction: 'https://tc39.es/ecma262/#sec-async-function-constructor',

  'Module Namespace Object':
    'https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects',

  AsyncGeneratorFunction:
    'https://tc39.es/proposal-async-iteration/#sec-asyncgeneratorfunction-constructor',

  Iterable: `${DOC_MDN_BASE_URL_JS}Reference/Iteration_protocols#The_iterable_protocol`,
  Iterator: `${DOC_MDN_BASE_URL_JS}Reference/Iteration_protocols#The_iterator_protocol`,

  CloseEvent: `${DOC_MDN_BASE_URL}/API/CloseEvent`,
  EventSource: `${DOC_MDN_BASE_URL}/API/EventSource`,
  MessageEvent: `${DOC_MDN_BASE_URL}/API/MessageEvent`,

  DOMException: `${DOC_MDN_BASE_URL}/API/DOMException`,
  Storage: `${DOC_MDN_BASE_URL}/API/Storage`,
  WebSocket: `${DOC_MDN_BASE_URL}/API/WebSocket`,

  FormData: `${DOC_MDN_BASE_URL}API/FormData`,
  Headers: `${DOC_MDN_BASE_URL}/API/Headers`,
  Response: `${DOC_MDN_BASE_URL}/API/Response`,
  Request: `${DOC_MDN_BASE_URL}/API/Request`,
};
