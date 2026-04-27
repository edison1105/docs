# VP Theme SPA Benchmark

Tooling: Vite SPA, Playwright Chromium, 1440x900 viewport, service workers blocked, external network requests aborted, 1 warmup run plus 7 measured runs. CPU numbers below are medians unless noted. `Mount` is measured with `performance.mark()` immediately around `app.mount()`.

## Scenarios

| Scenario | Notes |
| --- | --- |
| vp-theme-spa-vdom | Plain SPA, @vue/theme VP layout/components, VDOM compile and `createApp`. |
| vp-theme-spa-vapor | Same fixture, SFC templates forced to Vapor and mounted with `createVaporApp`. |

## Bundle Size

| Scenario | Initial JS graph gzip | Initial JS graph raw | Runtime JS gzip | Runtime JS raw | Total JS gzip | Total JS raw |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| vp-theme-spa-vdom | 47.7 KB | 129.0 KB | 29.5 KB | 74.6 KB | 85.2 KB | 259.6 KB |
| vp-theme-spa-vapor | 51.0 KB | 142.5 KB | 28.8 KB | 76.0 KB | 88.5 KB | 273.1 KB |

## First-Screen CPU

| Scenario | Mount | TaskDuration (CDP main-thread tasks) | ScriptDuration | LayoutDuration | RecalcStyle | FCP | DCL | Load | JS heap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| vp-theme-spa-vdom | 10.3 ms | 56.35 ms | 12.09 ms | 17.17 ms | 2.04 ms | 56 ms | 27.8 ms | 29.6 ms | 2.67 MB |
| vp-theme-spa-vapor | 12.2 ms | 51.94 ms | 13.68 ms | 18.08 ms | 2.03 ms | 64 ms | 32.6 ms | 34.4 ms | 2.86 MB |

## Notes

- This is a pure SPA benchmark. It does not include VitePress SSR hydration, markdown page modules, lean chunks, router prefetch, or docs homepage business components.
- The `vitepress` module is mocked only to provide static `useData`, `useRoute`, `useRouter`, `withBase`, and `onContentUpdated` APIs required by VP theme components.
- The appearance switch is disabled in the local config because the current `VTSwitch` template uses `$slots.default`, which does not run in this forced pure-Vapor SPA fixture.
- Raw JSON: `bench/vp-theme-spa/results.json`.
