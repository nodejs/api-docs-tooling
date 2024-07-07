'use strict';

// This is the base-path of API docs within the https://nodejs.org Website
export const DOC_WEB_BASE_PATH = '/docs/';

// This is the base URL of the MDN Web documentation
export const DOC_MDN_BASE_URL = 'https://developer.mozilla.org/en-US/docs/Web/';

// This is the base URL for the MDN JavaScript documentation
export const DOC_MDN_BASE_URL_JS = `${DOC_MDN_BASE_URL}JavaScript/`;

// This is the base URL for the MDN JavaScript Primitives documentation
export const DOC_MDN_BASE_URL_JS_PRIMITIVES = `${DOC_MDN_BASE_URL_JS}Data_structures`;

// This is the base URL for the MDN JavaScript Global Objects documentation
export const DOC_MDN_BASE_URL_JS_GLOBALS = `${DOC_MDN_BASE_URL_JS}Reference/Global_Objects/`;

// These are YAML keys from the Markdown YAML Metadata that should always be Arrays
export const DOC_API_YAML_KEYS_ARRAYS = [
  'added',
  'napiVersion',
  'deprecated',
  'removed',
  'introduced_in',
];

// These are YAML keys from the Markdown YAML Metadata that should be
// removed and appended to the `update` key
export const DOC_API_YAML_KEYS_UPDATE = [
  'added',
  'removed',
  'deprecated',
  'introduced_in',
  'napiVersion',
];

// These are the YAML Types that should be considered as Navigation Entries
export const DOC_API_YAML_KEYS_NAVIGATION = ['class', 'module', 'global'];

// These are string replacements specific to Node.js API Docs for Anchor IDs
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
// and to extract the inner content of said Heading to be used as the API Doc Entry Name
export const DOC_API_HEADING_TYPES = [
  { type: 'method', regex: /^`?([A-Z]\w+(?:\.[A-Z]\w+)*\.\w+)\([^)]*\)`?$/i },
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
    regex: /^Static method: +`?([A-Z]\w+(?:\.[A-Z]\w+)*\.\w+)\([^)]*\)`?$/i,
  },
  {
    type: 'property',
    regex: /^(?:Class property: +)?`?([A-Z]\w+(?:\.[A-Z]\w+)*\.\w+)`?$/i,
  },
];

// This is a mapping for types within the Markdown content and their respective
// JavaScript primitive types within the MDN JavaScript Docs
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
// JavaScript globals types within the MDN JavaScript Docs
// @see DOC_MDN_BASE_URL_JS_GLOBALS
export const DOC_TYPES_MAPPING_GLOBALS = {
  AggregateError: 'AggregateError',
  Array: 'Array',
  ArrayBuffer: 'ArrayBuffer',
  DataView: 'DataView',
  Date: 'Date',
  Error: 'Error',
  EvalError: 'EvalError',
  Function: 'Function',
  Map: 'Map',
  Object: 'Object',
  Promise: 'Promise',
  RangeError: 'RangeError',
  ReferenceError: 'ReferenceError',
  RegExp: 'RegExp',
  Set: 'Set',
  SharedArrayBuffer: 'SharedArrayBuffer',
  SyntaxError: 'SyntaxError',
  TypeError: 'TypeError',
  TypedArray: 'TypedArray',
  URIError: 'URIError',
  Uint8Array: 'Uint8Array',
  bigint: 'BigInt',
  'WebAssembly.Instance': 'WebAssembly/Instance',
};

// This is a mapping for types within the Markdown content and their respective
// Node.js types within the Node.js API Docs (refers to a different API Doc Page)
// @note These hashes are generated with the GitHub Slugger
export const DOC_TYPES_MAPPING_NODE_MODULES = {
  AbortController: 'globals.html#abortcontroller',
  AbortSignal: 'globals.html#abortsignal',

  Blob: 'buffer.html#blob',

  BroadcastChannel: 'worker_threads.html#broadcastchannel-extends-eventtarget',

  AsyncHook: 'async_hooks.html#async_hookscreatehookcallbacks',
  AsyncResource: 'async_hooks.html#asyncresource',

  'brotli options': 'zlib.html#brotlioptions',

  Buffer: 'buffer.html#buffer',

  ChildProcess: 'child_process.html#childprocess',

  'cluster.Worker': 'cluster.html#worker',

  Cipher: 'crypto.html#cipher',
  Decipher: 'crypto.html#decipher',
  DiffieHellman: 'crypto.html#diffiehellman',
  DiffieHellmanGroup: 'crypto.html#diffiehellmangroup',
  ECDH: 'crypto.html#ecdh',
  Hash: 'crypto.html#hash',
  Hmac: 'crypto.html#hmac',
  KeyObject: 'crypto.html#keyobject',
  Sign: 'crypto.html#sign',
  Verify: 'crypto.html#verify',
  'crypto.constants': 'crypto.html#cryptoconstants',

  CryptoKey: 'webcrypto.html#cryptokey',
  CryptoKeyPair: 'webcrypto.html#cryptokeypair',
  Crypto: 'webcrypto.html#crypto',
  SubtleCrypto: 'webcrypto.html#subtlecrypto',
  RsaOaepParams: 'webcrypto.html#rsaoaepparams',
  AlgorithmIdentifier: 'webcrypto.html#algorithmidentifier',
  AesCtrParams: 'webcrypto.html#aesctrparams',
  AesCbcParams: 'webcrypto.html#aescbcparams',
  AesGcmParams: 'webcrypto.html#aesgcmparams',
  EcdhKeyDeriveParams: 'webcrypto.html#ecdhkeyderiveparams',
  HkdfParams: 'webcrypto.html#hkdfparams',
  Pbkdf2Params: 'webcrypto.html#pbkdf2params',
  HmacKeyGenParams: 'webcrypto.html#hmackeygenparams',
  AesKeyGenParams: 'webcrypto.html#aeskeygenparams',
  RsaHashedKeyGenParams: 'webcrypto.html#rsahashedkeygenparams',
  EcKeyGenParams: 'webcrypto.html#eckeygenparams',
  RsaHashedImportParams: 'webcrypto.html#rsahashedimportparams',
  EcKeyImportParams: 'webcrypto.html#eckeyimportparams',
  HmacImportParams: 'webcrypto.html#hmacimportparams',
  EcdsaParams: 'webcrypto.html#ecdsaparams',
  RsaPssParams: 'webcrypto.html#rsapssparams',
  Ed448Params: 'webcrypto.html#ed448params',

  'dgram.Socket': 'dgram.html#dgramsocket',

  Channel: 'diagnostics_channel.html#channel',

  Domain: 'domain.html#domain',

  'errors.Error': 'errors.html#error',

  'import.meta': 'esm.html#importmeta',

  EventEmitter: 'events.html#eventemitter',
  EventTarget: 'events.html#eventtarget',
  Event: 'events.html#event',
  CustomEvent: 'events.html#customevent',
  EventListener: 'events.html#listener',

  FileHandle: 'fs.html#filehandle',
  'fs.Dir': 'fs.html#fsdir',
  'fs.Dirent': 'fs.html#fsdirent',
  'fs.FSWatcher': 'fs.html#fsfswatcher',
  'fs.ReadStream': 'fs.html#fsreadstream',
  'fs.Stats': 'fs.html#fsstats',
  'fs.StatWatcher': 'fs.html#fsstatwatcher',
  'fs.WriteStream': 'fs.html#fswritestream',

  'http.Agent': 'http.html#httpagent',
  'http.ClientRequest': 'http.html#httpclientrequest',
  'http.IncomingMessage': 'http.html#httpincomingmessage',
  'http.OutgoingMessage': 'http.html#httpoutgoingmessage',
  'http.Server': 'http.html#httpserver',
  'http.ServerResponse': 'http.html#httpserverresponse',

  ClientHttp2Session: 'http2.html#clienthttp2session',
  ClientHttp2Stream: 'http2.html#clienthttp2stream',
  'HTTP/2 Headers Object': 'http2.html#headers-object',
  'HTTP/2 Settings Object': 'http2.html#settings-object',
  'http2.Http2ServerRequest': 'http2.html#http2http2serverrequest',
  'http2.Http2ServerResponse': 'http2.html#http2http2serverresponse',
  Http2SecureServer: 'http2.html#http2secureserver',
  Http2Server: 'http2.html#http2server',
  Http2Session: 'http2.html#http2session',
  Http2Stream: 'http2.html#http2stream',
  ServerHttp2Stream: 'http2.html#serverhttp2stream',
  ServerHttp2Session: 'http2.html#serverhttp2session',

  'https.Server': 'https.html#httpsserver',

  module: 'modules.html#the-module-object',

  'module.SourceMap': 'module.html#modulesourcemap',

  require: 'modules.html#requireid',

  Handle: 'net.html#serverlistenhandle-backlog-callback',
  'net.BlockList': 'net.html#netblocklist',
  'net.Server': 'net.html#netserver',
  'net.Socket': 'net.html#netsocket',
  'net.SocketAddress': 'net.html#netsocketaddress',

  NodeEventTarget: 'events.html#nodeeventtarget',

  'os.constants.dlopen': 'os.html#dlopen-constants',

  Histogram: 'perf_hooks.html#histogram',
  IntervalHistogram: 'perf_hooks.html#intervalhistogram-extends-histogram',
  RecordableHistogram: 'perf_hooks.html#recordablehistogram-extends-histogram',
  PerformanceEntry: 'perf_hooks.html#performanceentry',
  PerformanceNodeTiming: 'perf_hooks.html#performancenodetiming',
  PerformanceObserver: 'perf_hooks.html#perf_hooksperformanceobserver',
  PerformanceObserverEntryList: 'perf_hooks.html#performanceobserverentrylist',

  'readline.Interface': 'readline.html#readlineinterface',
  'readline.InterfaceConstructor': 'readline.html#interfaceconstructor',
  'readlinePromises.Interface': 'readline.html#readlinepromisesinterface',

  'repl.REPLServer': 'repl.html#replserver',

  Stream: 'stream.html#stream',
  'stream.Duplex': 'stream.html#streamduplex',
  Duplex: 'stream.html#streamduplex',
  'stream.Readable': 'stream.html#streamreadable',
  Readable: 'stream.html#streamreadable',
  'stream.Transform': 'stream.html#streamtransform',
  Transform: 'stream.html#streamtransform',
  'stream.Writable': 'stream.html#streamwritable',
  Writable: 'stream.html#streamwritable',

  Immediate: 'timers.html#immediate',
  Timeout: 'timers.html#timeout',
  Timer: 'timers.html#timers',

  TapStream: 'test.html#tapstream',

  'tls.SecureContext': 'tls.html#tlscreatesecurecontextoptions',
  'tls.Server': 'tls.html#tlsserver',
  'tls.TLSSocket': 'tls.html#tlstlssocket',

  Tracing: 'tracing.html#tracing-object',

  URL: 'url.html#the-whatwg-url-api',
  URLSearchParams: 'url.html#urlsearchparams',

  'vm.Module': 'vm.html#vmmodule',
  'vm.Script': 'vm.html#vmscript',
  'vm.SourceTextModule': 'vm.html#vmsourcetextmodule',

  MessagePort: 'worker_threads.html#messageport',
  Worker: 'worker_threads.html#worker',

  X509Certificate: 'crypto.html#x509certificate',

  'zlib options': 'zlib.html#options',

  ReadableStream: 'webstreams.html#readablestream',
  ReadableStreamDefaultReader: 'webstreams.html#readablestreamdefaultreader',
  ReadableStreamBYOBReader: 'webstreams.html#readablestreambyobreader',
  ReadableStreamDefaultController:
    'webstreams.html#readablestreamdefaultcontroller',
  ReadableByteStreamController: 'webstreams.html#readablebytestreamcontroller',
  ReadableStreamBYOBRequest: 'webstreams.html#readablestreambyobrequest',
  WritableStream: 'webstreams.html#writablestream',
  WritableStreamDefaultWriter: 'webstreams.html#writablestreamdefaultwriter',
  WritableStreamDefaultController:
    'webstreams.html#writablestreamdefaultcontroller',
  TransformStream: 'webstreams.html#transformstream',
  TransformStreamDefaultController:
    'webstreams.html#transformstreamdefaultcontroller',
  ByteLengthQueuingStrategy: 'webstreams.html#bytelengthqueuingstrategy',
  CountQueuingStrategy: 'webstreams.html#countqueuingstrategy',
  TextEncoderStream: 'webstreams.html#textencoderstream',
  TextDecoderStream: 'webstreams.html#textdecoderstream',
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
