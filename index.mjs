import { Spinner } from "./src/utils/spinner.mjs";
import * as prompts from '@clack/prompts';

prompts.intro('spinner start...');

const spinner = new Spinner();
spinner.total = 100;

spinner.start();

new Promise((resolve) => {
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(spinner.total, progress + 1);
    spinner.update(1, `Loading... ${progress}/${spinner.total}`);
    if (progress >= spinner.total) {
      clearInterval(timer);
      resolve(true);
    }
  }, 100);
}).then(() => {
  spinner.stop('Done');
  prompts.outro('spinner stop...');
});
