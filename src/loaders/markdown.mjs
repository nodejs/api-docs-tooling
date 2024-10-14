'use strict';

import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { globSync } from 'glob';
import { VFile } from 'vfile';

import { createProgressBar } from './utils/progressBar.mjs';

/**
 * This method creates a simple abstract "Loader", which technically
 * could be used for different things, but here we want to use it to load
 * Markdown files and transform them into VFiles
 */
const createLoader = () => {
  /**
   * Loads API Doc files and transforms it into VFiles
   *
   * @param {string} searchPath A glob/path for API docs to be loaded
   * The input string can be a simple path (relative or absolute)
   * The input string can also be any allowed glob string
   *
   * @see https://code.visualstudio.com/docs/editor/glob-patterns
   */
  const loadFiles = searchPath => {
    const resolvedFiles = globSync(searchPath).filter(
      filePath => extname(filePath) === '.md'
    );

    const progressBar = createProgressBar('Loading files');
    progressBar.start(resolvedFiles.length, 0);

    return resolvedFiles.map(async filePath => {
      const fileContents = await readFile(filePath, 'utf-8');
      progressBar.increment();
      // normally we stop the progress bar when the loop is done
      // but here we return the loop so we need to stop it when the last file is loaded
      if (progressBar.value === progressBar.total) {
        progressBar.stop();
      }

      return new VFile({ path: filePath, value: fileContents });
    });
  };

  return { loadFiles };
};

export default createLoader;
