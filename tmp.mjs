import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'jsonc-parser';
import { compile } from 'json-schema-to-typescript';

const str = await readFile('src/generators/json/schema.jsonc', 'utf8');

const parsed = await parse(str);

const typescript = await compile(parsed, 'ApiDocSchema');

await writeFile(
  'src/generators/json/parsed-schema.json',
  JSON.stringify(parsed, null, 2)
);

await writeFile('src/generators/json/generated.d.ts', typescript);
