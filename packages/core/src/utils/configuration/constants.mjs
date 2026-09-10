'use strict';

/**
 * The default `threads` ceiling. Each worker that highlights code holds Shiki's
 * grammars and regex engine (~300MB) on top of the pages it is building, so
 * past a few threads memory, not CPU, is what runs out. `--threads` raises it.
 */
export const DEFAULT_MAX_THREADS = 4;

/**
 * The default number of items each worker task processes.
 */
export const DEFAULT_CHUNK_SIZE = 10;
