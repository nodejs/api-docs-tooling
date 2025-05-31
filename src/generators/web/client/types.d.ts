import { createStaticData } from '../utils/staticData.mjs';

declare global {
  const __STATIC_DATA__: ReturnType<typeof createStaticData>;
}
