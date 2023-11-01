import { build } from 'esbuild'

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  // minify: true,
  outfile: 'dist/index.js',
  format: "esm",
  target: "es2020",
  treeShaking: false
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
