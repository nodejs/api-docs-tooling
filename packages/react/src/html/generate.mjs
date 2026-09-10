'use strict';

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import logger from '@doc-kit/core/logger/index.mjs';
import getConfig from '@doc-kit/core/utils/configuration/index.mjs';

import { resolveBundler } from './bundlers/index.mjs';
import { buildAllPage } from './utils/all.mjs';
import { copyStaticAssets } from './utils/copying.mjs';
import createProgramBuilder, { moduleFileName } from './utils/generate.mjs';
import { createVirtualImports } from './utils/processing.mjs';
import { createPageWriter } from './utils/render.mjs';

const htmlLogger = logger.child('html');

/**
 * Main generation function: turns the pages' JSX into the static site.
 *
 * Receives `jsx-ast`'s output as `{ data, headings, readingTime, content }`
 * items, `content` being each page's JSX code. The site is then built in
 * pieces that are each as small as they can be:
 *
 * 1. The component library is bundled once, for the server.
 * 2. The client assets are bundled once; every page loads the same ones.
 * 3. Each page's program is compiled (JSX to a plain module) and written to a
 * temporary directory, one at a time, so no page is held longer than that.
 * 4. The worker pool imports, renders, templates, minifies and writes the
 * pages, one page in memory per worker.
 * 5. `all.html`, when enabled, is a program that imports the module pages'
 * content, so it is written last from what was already compiled.
 *
 * @type {import('./types').Generator['generate']}
 */
export async function generate(input, worker) {
  const config = getConfig('html');

  const template = await readFile(config.templatePath, 'utf-8');

  const pages = [...input];
  const all = config.generateAllPage ? buildAllPage(pages) : undefined;

  // Every page's metadata, in render order — the sidebar, the index and the
  // cross links need the whole set.
  const datas = [...pages, ...(all ? [all] : [])].map(({ data }) => data);

  const bundler = await resolveBundler(config.bundler);
  const { buildLibraryProgram, buildPageProgram, clientProgram } =
    createProgramBuilder();

  // The built library and the compiled page programs live here until every
  // page is written; the directory is removed afterwards
  const outDir = await mkdtemp(join(tmpdir(), 'doc-kit-html-'));

  try {
    const libraryURL = await bundler.buildServer({
      entry: buildLibraryProgram(),
      virtualImports: createVirtualImports(datas, config.virtualImports, true),
      outDir,
      config,
    });

    htmlLogger.debug('Built the component library');

    const assets = await bundler.buildClient({
      entry: clientProgram,
      virtualImports: createVirtualImports(datas, config.virtualImports, false),
      config,
    });

    htmlLogger.debug('Built the client assets', assets);

    const modulesDir = join(outDir, 'pages');
    await mkdir(modulesDir);

    /**
     * Compiles a page's program to disk and describes it for the workers.
     *
     * @param {import('./types').Page} page
     * @returns {Promise<import('./types').PageTask>}
     */
    const compile = async page => {
      const file = join(modulesDir, moduleFileName(page.data.api));

      await writeFile(
        file,
        await bundler.compile(
          buildPageProgram(page, libraryURL),
          `${page.data.api}.jsx`
        )
      );

      const { data, headings, readingTime } = page;

      return {
        moduleURL: pathToFileURL(file).href,
        data,
        headings,
        readingTime,
      };
    };

    const tasks = [];

    for (const page of pages) {
      tasks.push(await compile(page));
    }

    htmlLogger.debug(`Compiled ${tasks.length} page programs`);

    const writePages = createPageWriter(worker);
    const extra = { template, assets };

    await writePages(tasks, extra);

    // The composed page imports the others' compiled programs, so it can only
    // be rendered once those exist — which they now do.
    if (all) {
      await writePages([await compile(all)], extra);
    }
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }

  await copyStaticAssets(config);
}
