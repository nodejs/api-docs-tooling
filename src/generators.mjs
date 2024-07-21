'use strict';

import availableGenerators from './generators/index.mjs';

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
 * @param {import('./types.d.ts').ApiDocMetadataEntry[]} input The parsed API doc metadata entries
 */
const createGenerator = input => {
  /**
   * We store all the registered generators to be processed
   * within a Map, so we can access their results at any time whenever needed
   * (we store the Promises of the generator outputs)
   *
   * @type {Map<
   *  import('./generators/types.d.ts').GeneratorMetadata['name'],
   *  ReturnType<import('./generators/types.d.ts').GeneratorMetadata["generate"]>
   * >}
   */
  const cachedGenerators = new Map([['ast', Promise.resolve(input)]]);

  /**
   * Runs the Generator engine with the provided top-level input and the given generator options
   *
   * @param {import('./generators/types.d.ts').GeneratorOptions} options The options for the generator runtime
   */
  const runGenerators = async options => {
    // Note that this method is blocking, and will only execute one generator per-time
    // but it ensures all dependencies are resolved, and that multiple bottom-level generators
    // can reuse the already parsed content from the top-level/dependency generators
    for (const generatorName of options.generators) {
      const { dependsOn, generate } = availableGenerators[generatorName];

      // If the generator dependency has not yet been resolved, we resolve
      // the dependency first before running the current generator
      if (dependsOn && !cachedGenerators.has(dependsOn)) {
        await runGenerators({ ...options, generators: [dependsOn] });
      }

      // Ensures that the dependency output gets resolved before we run the current
      // generator with its dependency output as the input
      const dependencyOutput = await cachedGenerators.get(dependsOn);

      // Adds the current generator Promise to the Cache
      cachedGenerators.set(generatorName, generate(dependencyOutput, options));
    }

    // Returns the value of the last generator of the current pipeline
    // Note that dependencies will be awaited (as shown on line 48)
    return cachedGenerators.get(
      options.generators[options.generators.length - 1]
    );
  };

  return { runGenerators };
};

export default createGenerator;
