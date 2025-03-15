import { equal, notStrictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import astJs from '../../ast-js/index.mjs';
import apiLinks from '../index.mjs';

const FIXTURES_DIRECTORY = join(import.meta.dirname, 'fixtures');
const fixtures = await readdir(FIXTURES_DIRECTORY);

const sourceFiles = fixtures
  .filter(fixture => extname(fixture) === '.js')
  .map(fixture => join(FIXTURES_DIRECTORY, fixture));

describe('api links', () => {
  describe('should work correctly for all fixtures', () => {
    sourceFiles.forEach(sourceFile => {
      it(`${basename(sourceFile)}`, async () => {
        const astJsResult = await astJs.generate(undefined, {
          input: [sourceFile],
        });

        const actualOutput = await apiLinks.generate(astJsResult, {});

        const expectedOutput = JSON.parse(
          await readFile(sourceFile.replace('.js', '.json'), 'utf8')
        );

        for (const [k, v] of Object.entries(expectedOutput)) {
          notStrictEqual(actualOutput[k], undefined, `missing ${k}`);
          ok(
            actualOutput[k].endsWith(`/${v}`),
            `expected ${v}, got ${actualOutput[k]}`
          );

          delete actualOutput[k];
        }

        equal(
          Object.keys(actualOutput).length,
          0,
          'actual output has extra keys'
        );
      });
    });
  });
});
