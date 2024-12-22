import { describe, it } from "node:test";
import { Spinner } from "../spinner.mjs";

describe("spinner", () => {
  it("should instantiate a new Spinner", () => {
    const spinner = new Spinner();
    spinner.start();
    spinner.stop();
  });

});
