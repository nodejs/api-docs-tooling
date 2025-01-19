/**
 * Updates JavaScript files with correct require paths for the build tree
 * and generates a `binding.gyp` file to compile C++ code.
 *
 * @param {{name: string, content: string}[]} files  An array of file objects
 * @returns {{name: string, content: string}[]}
 */
export const updateFilesForBuild = files => {
  const updatedFiles = files.map(({ name, content }) => {
    if (name === 'test.js') {
      content = `'use strict';
const common = require('../../common');
${content.replace(
  "'./build/Release/addon'",

  '`./build/${common.buildType}/addon`'
)}
   `;
    }

    return {
      name: name,
      content: content,
    };
  });

  updatedFiles.push({
    name: 'binding.gyp',
    content: JSON.stringify({
      targets: [
        {
          target_name: 'addon',
          sources: files.map(({ name }) => name),
          includes: ['../common.gypi'],
        },
      ],
    }),
  });

  return updatedFiles;
};
