import type availableGenerators from './index.mjs';

// All available generators as an inferable type, to allow Generator interfaces
// to be type complete and runtime friendly within `runGenerators`
export type AvailableGenerators = typeof availableGenerators;

// This is the runtime config passed to the API doc genberators
export interface GeneratorOptions {
  // The path used to output generated files, this is to be considered
  // the base path that any generator will use for generating files
  // This parameter accepts globs but when passed to generators will contain
  // the already resolved absolute path to the output folder
  output: string;
  // A list of generators to be used in the API doc generation process;
  // This is considered a "sorted" list of generators, in the sense that
  // if the last entry of this list contains a generated value, we will return
  // the value of the last generator in the list, if any.
  generators: (keyof AvailableGenerators)[];
}

export interface GeneratorMetadata<I extends any, O extends any> {
  // The name of the Generator. Must match the Key in the AvailableGenerators
  name: keyof AvailableGenerators;

  version: string;

  description: string;

  /**
   * The immediate generator that this generator depends on.
   * For example, the `html` generator depends on the `react` generator.
   *
   * If a given generator has no "before" generator, it will be considered a top-level
   * generator, and run in parallel.
   *
   * Assume you pass to the `createGenerator`: ['json', 'html'] as the generators,
   * this means both the 'json' and the 'html' generators will be executed and generate their
   * own outputs in parallel. If the 'html' generator depends on the 'react' generator, then
   * the 'react' generator will be executed first, then the 'html' generator.
   *
   * But both 'json' and 'htnl' generators will be executed in parallel.
   *
   * If you pass `createGenerator` with ['react', 'html'], the 'react' generator will be executed first,
   * as it is a top level generator and then the 'html' generator would be executed after the 'react' generator.
   *
   * The 'ast' generator is the top-level parser, and if 'ast' is passed to `dependsOn`, then the generator
   * will be marked as a top-level generator.
   */
  dependsOn: keyof AvailableGenerators | 'ast';

  /**
   * Generators are abstract and the different generators have different sort of inputs and outputs.
   * For example, a MDX generator would take the raw AST and output MDX with React Components;
   * Whereas a JSON generator would take the raw AST and output JSON;
   * Then a React generator could receive either the raw AST or the MDX output and output React Components.
   * (depending if they support such I/O)
   *
   * Hence you can combine different generators to achieve different outputs.
   */
  generate: (input: I, options: Partial<GeneratorOptions>) => Promise<O>;
}
