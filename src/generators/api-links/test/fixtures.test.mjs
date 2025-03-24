import { describe, it } from 'node:test';
import { readdir } from 'node:fs/promises';
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
      it(`${basename(sourceFile)}`, async t => {
        const astJsResult = await astJs.generate(undefined, {
          input: [sourceFile],
        });

        const actualOutput = await apiLinks.generate(astJsResult, {
          gitRef: {
            protocols: ['https'],
            protocol: 'https',
            port: '',
            resource: 'github.com',
            host: 'github.com',
            user: '',
            password: '',
            pathname: '/nodejs/node/tree/HEAD',
            hash: '',
            search: '',
            href: 'https://github.com/nodejs/node/tree/HEAD',
            query: {},
            parse_failed: false,
            token: '',
            source: 'github.com',
            git_suffix: false,
            name: 'node',
            owner: 'nodejs',
            commit: 'HEAD',
            ref: 'HEAD',
            filepathtype: 'tree',
            filepath: '',
            organization: 'nodejs',
            full_name: 'nodejs/node',
          },
        });

        for (const [k, v] of Object.entries(actualOutput)) {
          actualOutput[k] = v.replace(/.*(?=lib\/)/, '');
        }

        t.assert.snapshot(actualOutput);
      });
    });
  });
});
