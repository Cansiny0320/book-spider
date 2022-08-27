import { defineConfig } from 'tsup'
export default defineConfig(options => {
  return {
    entry: ['src/cli.ts'],
    clean: true,
    target: 'es5',
    format: 'esm',
    platform: 'node',
    minify: !options.watch,
  }
})
