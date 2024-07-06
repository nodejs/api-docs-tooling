'use strict';

import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { VFile } from 'vfile';

const createLoader = () => {
  /**
   * Loads an API Doc file and transforms it into a VFile
   *
   * @param {string} path The API Doc Path
   */
  const loadFile = async path => {
    if (extname(path) !== '.md') {
      throw new Error('API Doc file must be a Markdown file');
    }

    const apiDocFile = await readFile(path, 'utf-8');

    return new VFile({ path: path, value: apiDocFile });
  };

  return { loadFile };
};

export default createLoader;
