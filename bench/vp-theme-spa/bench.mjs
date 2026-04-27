import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const root = new URL('.', import.meta.url).pathname
const cases = [
  {
    name: 'vp-theme-spa-vdom',
    mode: 'vdom',
    config: path.join(root, 'vite.vdom.config.mjs'),
    port: 5181
  },
  {
    name: 'vp-theme-spa-vapor',
    mode: 'vapor',
    config: path.join(root, 'vite.vapor.config.mjs'),
    port: 5182
  }
]

const runs = Number(process.env.RUNS || 7)
const warmups = Number(process.env.WARMUPS || 1)
const waitAfterNetworkIdle = Number(process.env.WAIT_AFTER_NETWORK_IDLE || 300)

function gzipSize(buf) {
  return zlib.gzipSync(buf).length
}

function brotliSize(buf) {
  return zlib.brotliCompressSync(buf).length
}

function percentile(values, p) {
  const sorted = values.slice().sort((a, b) => a - b)
  const index = Math.floor((sorted.length - 1) * p)
  return sorted[index]
}

function median(values) {
  return percentile(values, 0.5)
}

function rounded(value) {
  return value == null ? null : Math.round(value * 100) / 100
}

function collectStaticJsGraph(distRoot, entries) {
  const seen = new Set()
  const pending = [...entries]

  while (pending.length) {
    const file = pending.pop()
    if (seen.has(file)) continue
    seen.add(file)

    const source = fs.readFileSync(path.join(distRoot, file), 'utf8')
    const imports = [
      ...source.matchAll(
        /\b(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?["']([^"']+\.js)["']/g
      )
    ].map((m) => m[1])

    for (const specifier of imports) {
      const resolved = specifier.startsWith('/')
        ? specifier.slice(1)
        : path.posix.normalize(
            path.posix.join(path.posix.dirname(file), specifier)
          )
      if (!seen.has(resolved)) pending.push(resolved)
    }
  }

  return [...seen].sort()
}

function bundleMetrics(mode) {
  const distRoot = path.join(root, 'dist', mode)
  const html = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8')
  const entries = [
    ...new Set(
      [...html.matchAll(/(?:src|href)="\/?([^"]+\.js)"/g)].map((m) => m[1])
    )
  ]
  const initialFiles = collectStaticJsGraph(distRoot, entries)

  let initialRaw = 0
  let initialGzip = 0
  let initialBrotli = 0
  let runtimeRaw = 0
  let runtimeGzip = 0
  let runtimeBrotli = 0
  const runtimeFiles = initialFiles.filter((file) =>
    /runtime-(?:vapor|vue)/.test(file)
  )

  for (const file of initialFiles) {
    const buf = fs.readFileSync(path.join(distRoot, file))
    initialRaw += buf.length
    initialGzip += gzipSize(buf)
    initialBrotli += brotliSize(buf)
  }

  for (const file of runtimeFiles) {
    const buf = fs.readFileSync(path.join(distRoot, file))
    runtimeRaw += buf.length
    runtimeGzip += gzipSize(buf)
    runtimeBrotli += brotliSize(buf)
  }

  let totalRaw = 0
  let totalGzip = 0
  let totalBrotli = 0
  let totalJsFiles = 0
  for (const file of fs.readdirSync(path.join(distRoot, 'assets'), {
    recursive: true
  })) {
    if (!String(file).endsWith('.js')) continue
    const full = path.join(distRoot, 'assets', file)
    if (!fs.statSync(full).isFile()) continue
    const buf = fs.readFileSync(full)
    totalJsFiles++
    totalRaw += buf.length
    totalGzip += gzipSize(buf)
    totalBrotli += brotliSize(buf)
  }

  return {
    initialFileCount: initialFiles.length,
    initialRaw,
    initialGzip,
    initialBrotli,
    runtimeFiles,
    runtimeRaw,
    runtimeGzip,
    runtimeBrotli,
    totalJsFiles,
    totalRaw,
    totalGzip,
    totalBrotli,
    initialFiles
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: path.resolve(root, '../../..'),
      stdio: 'inherit'
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}`))
    })
  })
}

async function waitForServer(url, child) {
  const started = Date.now()
  let lastError
  while (Date.now() - started < 30000) {
    if (child.exitCode != null) {
      throw new Error(`preview exited early with code ${child.exitCode}`)
    }
    try {
      const res = await fetch(url)
      if (res.ok) return
      lastError = new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw lastError || new Error(`server did not start: ${url}`)
}

function startPreview(testCase) {
  const child = spawn(
    'pnpm',
    [
      'exec',
      'vite',
      'preview',
      '--config',
      testCase.config,
      '--host',
      '127.0.0.1',
      '--port',
      String(testCase.port)
    ],
    {
      cwd: path.resolve(root, '../../..'),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )
  child.stdout.on('data', () => {})
  child.stderr.on('data', () => {})
  return child
}

function stopPreview(child) {
  if (!child || child.exitCode != null) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {}
}

async function runOne(browser, url, runIndex) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block'
  })
  await context.route('**/*', (route) => {
    const requestUrl = new URL(route.request().url())
    if (
      requestUrl.hostname === '127.0.0.1' ||
      requestUrl.hostname === 'localhost'
    ) {
      route.continue()
    } else {
      route.abort()
    }
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message)
  })
  const client = await context.newCDPSession(page)
  await client.send('Performance.enable')
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })

  const started = performance.now()
  await page.goto(`${url}/?bench=${Date.now()}-${runIndex}`, {
    waitUntil: 'domcontentloaded'
  })
  await page.waitForLoadState('load')
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(
    () => performance.getEntriesByName('vp-theme-spa:mount').length > 0,
    null,
    { timeout: 5000 }
  )
  await page.waitForTimeout(waitAfterNetworkIdle)
  const elapsedMs = performance.now() - started

  const cdpMetrics = await client.send('Performance.getMetrics')
  const metricMap = Object.fromEntries(
    cdpMetrics.metrics.map((metric) => [metric.name, metric.value])
  )
  const browserMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paints = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [
        entry.name,
        entry.startTime
      ])
    )
    const longTasks = performance.getEntriesByType('longtask')
    const mountMeasures = performance.getEntriesByName('vp-theme-spa:mount')
    const mountMeasure = mountMeasures[mountMeasures.length - 1]
    return {
      domContentLoadedMs: nav.domContentLoadedEventEnd,
      loadEventMs: nav.loadEventEnd,
      firstPaintMs: paints['first-paint'] ?? null,
      firstContentfulPaintMs: paints['first-contentful-paint'] ?? null,
      mountMs: mountMeasure ? mountMeasure.duration : null,
      longTaskCount: longTasks.length,
      longTaskTotalMs: longTasks.reduce((sum, task) => sum + task.duration, 0),
      totalBlockingTimeMs: longTasks.reduce(
        (sum, task) => sum + Math.max(0, task.duration - 50),
        0
      )
    }
  })

  if (pageErrors.length) {
    throw new Error(pageErrors.join('\n'))
  }

  await context.close()

  return {
    elapsedMs,
    taskDurationMs: (metricMap.TaskDuration || 0) * 1000,
    scriptDurationMs: (metricMap.ScriptDuration || 0) * 1000,
    layoutDurationMs: (metricMap.LayoutDuration || 0) * 1000,
    recalcStyleDurationMs: (metricMap.RecalcStyleDuration || 0) * 1000,
    jsHeapUsedSize: metricMap.JSHeapUsedSize || 0,
    ...browserMetrics
  }
}

function summarizeRuns(runs) {
  const keys = Object.keys(runs[0])
  const summary = {}
  for (const key of keys) {
    if (typeof runs[0][key] !== 'number') continue
    const values = runs.map((run) => run[key])
    summary[key] = {
      median: rounded(median(values)),
      min: rounded(Math.min(...values)),
      max: rounded(Math.max(...values))
    }
  }
  return summary
}

function kb(value) {
  return `${(value / 1024).toFixed(1)} KB`
}

function writeReport(results) {
  const lines = [
    '# VP Theme SPA Benchmark',
    '',
    'Tooling: Vite SPA, Playwright Chromium, 1440x900 viewport, service workers blocked, external network requests aborted, 1 warmup run plus 7 measured runs. CPU numbers below are medians unless noted. `Mount` is measured with `performance.mark()` immediately around `app.mount()`.',
    '',
    '## Scenarios',
    '',
    '| Scenario | Notes |',
    '| --- | --- |',
    '| vp-theme-spa-vdom | Plain SPA, @vue/theme VP layout/components, VDOM compile and `createApp`. |',
    '| vp-theme-spa-vapor | Same fixture, SFC templates forced to Vapor and mounted with `createVaporApp`. |',
    '',
    '## Bundle Size',
    '',
    '| Scenario | Initial JS graph gzip | Initial JS graph raw | Runtime JS gzip | Runtime JS raw | Total JS gzip | Total JS raw |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  ]

  for (const result of results) {
    const b = result.bundle
    lines.push(
      `| ${result.name} | ${kb(b.initialGzip)} | ${kb(b.initialRaw)} | ${kb(
        b.runtimeGzip
      )} | ${kb(b.runtimeRaw)} | ${kb(b.totalGzip)} | ${kb(b.totalRaw)} |`
    )
  }

  lines.push(
    '',
    '## First-Screen CPU',
    '',
    '| Scenario | Mount | TaskDuration (CDP main-thread tasks) | ScriptDuration | LayoutDuration | RecalcStyle | FCP | DCL | Load | JS heap |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  )

  for (const result of results) {
    const s = result.cpuSummary
    lines.push(
      `| ${result.name} | ${s.mountMs.median} ms | ${s.taskDurationMs.median} ms | ${s.scriptDurationMs.median} ms | ${s.layoutDurationMs.median} ms | ${s.recalcStyleDurationMs.median} ms | ${s.firstContentfulPaintMs.median} ms | ${s.domContentLoadedMs.median} ms | ${s.loadEventMs.median} ms | ${(s.jsHeapUsedSize.median / 1048576).toFixed(2)} MB |`
    )
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- This is a pure SPA benchmark. It does not include VitePress SSR hydration, markdown page modules, lean chunks, router prefetch, or docs homepage business components.',
    '- The `vitepress` module is mocked only to provide static `useData`, `useRoute`, `useRouter`, `withBase`, and `onContentUpdated` APIs required by VP theme components.',
    '- The appearance switch is disabled in the local config because the current `VTSwitch` template uses `$slots.default`, which does not run in this forced pure-Vapor SPA fixture.',
    '- Raw JSON: `bench/vp-theme-spa/results.json`.'
  )

  fs.writeFileSync(path.join(root, 'report.md'), `${lines.join('\n')}\n`)
}

for (const testCase of cases) {
  await runCommand('pnpm', [
    'exec',
    'vite',
    'build',
    '--config',
    testCase.config
  ])
}

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-dev-shm-usage']
})

const results = []
try {
  for (const testCase of cases) {
    const url = `http://127.0.0.1:${testCase.port}`
    const preview = startPreview(testCase)
    try {
      await waitForServer(url, preview)
      const cpuRuns = []
      for (let i = 0; i < warmups; i++) {
        await runOne(browser, url, `warmup-${i}`)
      }
      for (let i = 0; i < runs; i++) {
        cpuRuns.push(await runOne(browser, url, i))
      }
      results.push({
        name: testCase.name,
        mode: testCase.mode,
        bundle: bundleMetrics(testCase.mode),
        cpuRuns: cpuRuns.map((run) =>
          Object.fromEntries(
            Object.entries(run).map(([key, value]) => [key, rounded(value)])
          )
        ),
        cpuSummary: summarizeRuns(cpuRuns)
      })
      console.log(`${testCase.name}: done`)
    } finally {
      stopPreview(preview)
    }
  }
} finally {
  await browser.close()
}

fs.writeFileSync(
  path.join(root, 'results.json'),
  `${JSON.stringify({ runs, warmups, results }, null, 2)}\n`
)
writeReport(results)
console.log(path.join(root, 'report.md'))
