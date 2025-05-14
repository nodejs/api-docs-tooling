'use strict';

import { allGenerators } from './generators/index.mjs';
import WorkerPool from './threading/index.mjs';

/**
 * This method creates a system that allows you to register generators
 * and then execute them in a specific order, keeping track of the
 * generation process, and handling errors that may occur from the
 * execution of generating content.
 *
 * When the final generator is reached, the system will return the
 * final generated content.
 *
 * Generators can output content that can be consumed by other generators;
 * Generators can also write to files. These would usually be considered
 * the final generators in the chain.
 *
 * @typedef {{ ast: GeneratorMetadata<ParserOutput, ParserOutput>}} AstGenerator The AST "generator" is a facade for the AST tree and it isn't really a generator
 * @typedef {AvailableGenerators & AstGenerator} AllGenerators A complete set of the available generators, including the AST one
 *
 * @param {ParserOutput} input The API doc AST tree
 */
const createGenerator = input => {
  /**
   * We store all the registered generators to be processed
   * within a Record, so we can access their results at any time whenever needed
   * (we store the Promises of the generator outputs)
   *
   * @type {{ [K in keyof AllGenerators]: ReturnType<AllGenerators[K]['generate']> }}
   */
  const cachedGenerators = { ast: Promise.resolve(input) };

  const threadPool = new WorkerPool();

  /**
   * Runs the Generator engine with the provided top-level input and the given generator options
   *
   * @param {GeneratorOptions} options The options for the generator runtime
   */
  const runGenerators = async ({ generators, threads, ...extra }) => {
    // Note that this method is blocking, and will only execute one generator per-time
    // but it ensures all dependencies are resolved, and that multiple bottom-level generators
    // can reuse the already parsed content from the top-level/dependency generators
    for (const generatorName of generators) {
      const { dependsOn, generate } = allGenerators[generatorName];

      // If the generator dependency has not yet been resolved, we resolve
      // the dependency first before running the current generator
      if (dependsOn && dependsOn in cachedGenerators === false) {
        await runGenerators({
          ...extra,
          threads,
          generators: [dependsOn],
        });
      }

      // Ensures that the dependency output gets resolved before we run the current
      // generator with its dependency output as the input
      const dependencyOutput = await cachedGenerators[dependsOn];

      // Adds the current generator execution Promise to the cache
      cachedGenerators[generatorName] =
        threads < 2
          ? generate(dependencyOutput, extra) // Run in main thread
          : threadPool.run(generatorName, dependencyOutput, threads, extra); // Offload to worker thread
    }

    // Returns the value of the last generator of the current pipeline
    // Note that dependencies will be awaited (as shown on line 48)
    return cachedGenerators[generators[generators.length - 1]];
  };

  return { runGenerators };
};

export default createGenerator;
