import * as prompts from '@clack/prompts';

export class Spinner {
  constructor() {
    this.spinner = prompts.spinner();
    this.progress = 0;
    this.total = 0;
  }

  start() {
    this.spinner.start();
  }

  stop(message = 'Done') {
    this.spinner.stop(message);
  }

  /**
   *
   * @param {number} increment
   * @param {string} customMessage
   */
  update(increment = 1, customMessage) {
    this.progress += increment;

    if (customMessage) {
      this.spinner.message(customMessage);
      return;
    }
    this.spinner.message(`Loading... ${this.progress}/${this.total}`);
  }
}
