import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

function forceVaporTemplates() {
  return {
    name: 'vp-theme-spa-force-vapor-templates',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue') || !code.includes('<template')) {
        return null
      }
      return code.replace(/<template(\s|>)/, '<template vapor$1')
    }
  }
}

function entryPlugin(entry) {
  return {
    name: 'vp-theme-spa-entry',
    resolveId(id) {
      if (id === '/src/main.ts') {
        return path.join(root, 'src', entry)
      }
    }
  }
}

function themeOverrides() {
  const config = path.join(root, 'src/theme-config.ts')

  return {
    name: 'vp-theme-spa-theme-overrides',
    enforce: 'pre',
    resolveId(source, importer) {
      const normalizedSource = source.replace(/\\/g, '/')
      const normalizedImporter = importer && importer.replace(/\\/g, '/')
      if (
        normalizedSource === './composables/config' ||
        normalizedSource === '../composables/config' ||
        normalizedSource.endsWith('/composables/config') ||
        normalizedSource.endsWith('/composables/config.ts') ||
        (normalizedSource === './config' &&
          normalizedImporter &&
          normalizedImporter.includes('@vue/theme') &&
          normalizedImporter.includes('/composables/'))
      ) {
        return config
      }
    }
  }
}

export function createBenchConfig({ mode }) {
  const isVapor = mode === 'vapor'

  return defineConfig({
    root,
    cacheDir: path.join(repoRoot, 'node_modules/.vite/vp-theme-spa', mode),
    plugins: [
      entryPlugin(isVapor ? 'main-vapor.ts' : 'main-vdom.ts'),
      themeOverrides(),
      isVapor && forceVaporTemplates(),
      vue()
    ].filter(Boolean),
    resolve: {
      alias: [
        {
          find: /^vitepress$/,
          replacement: path.join(root, 'src/vitepress-mock.ts')
        },
        {
          find: /^@vue\/theme$/,
          replacement: path.join(root, 'src/vue-theme-entry.ts')
        },
        {
          find: /^vue$/,
          replacement: 'vue/dist/vue.runtime.esm-bundler.js'
        }
      ]
    },
    define: {
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    build: {
      outDir: path.join(root, 'dist', mode),
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        input: path.join(root, 'index.html'),
        output: {
          manualChunks(id) {
            if (id.includes('@vue/runtime-vapor')) {
              return 'runtime-vapor'
            }
            if (
              id.includes('/vue/dist/') ||
              id.includes('@vue/runtime-core') ||
              id.includes('@vue/runtime-dom') ||
              id.includes('@vue/reactivity') ||
              id.includes('@vue/shared')
            ) {
              return 'runtime-vue'
            }
          }
        }
      }
    },
    server: {
      host: '127.0.0.1'
    },
    preview: {
      host: '127.0.0.1'
    }
  })
}
