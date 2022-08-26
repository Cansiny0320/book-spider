import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/cli'],
  // declaration: true,
  clean: true,
  failOnWarn: false,
  rollup: {
    // emitCJS: true,
    esbuild: {
      // minify: true,
    },
  },
})
