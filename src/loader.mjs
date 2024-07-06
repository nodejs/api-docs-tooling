'use strict';

import { glob } from 'glob';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { VFile } from 'vfile';

const createLoader = () => {
  /**
   * Loads API Doc files and transforms it into VFiles
   *
   * @param {string} path A glob/path for API docs to be loaded
   */
  const loadFiles = async path => {
    const resolvedFiles = await glob(path);

    return resolvedFiles.map(filePath => {
      const fileExtension = extname(filePath);

      if (fileExtension === '.md') {
        const fileContent = readFileSync(filePath, 'utf-8');

        return new VFile({ path: filePath, value: fileContent });
      }

      throw new Error(`File ${filePath} is not a Markdown file`);
    });
  };

  return { loadFiles };
};

export default createLoader;
