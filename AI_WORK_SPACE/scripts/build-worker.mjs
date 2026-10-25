import { build } from 'esbuild'

await build({
  entryPoints: ['server/index.ts'],
  outfile: 'worker.js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  sourcemap: false,
  minify: true,
  // Cloudflare provides these at runtime.
  external: ['node:*'],
  logLevel: 'info',
})
