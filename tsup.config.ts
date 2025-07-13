import { defineConfig } from 'tsup';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: ['esm'],
});
