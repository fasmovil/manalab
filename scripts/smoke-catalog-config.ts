import { resolve } from 'node:path';

export const catalogDirectory = resolve(process.env.MANALAB_CATALOG_DIR ?? '.manalab/smoke-catalog');
