import { build } from 'esbuild'

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  outfile: 'bin/[...app].js',
  format: "esm",
  target: "es2020"
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
