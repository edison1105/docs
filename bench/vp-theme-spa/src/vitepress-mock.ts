import { nextTick, ref } from 'vue'
import { frontmatter as frontmatterData, page as pageData, theme as themeData } from './theme-data'

const route = {
  path: '/guide/introduction.html',
  data: pageData
}

const data = {
  site: ref({
    base: '/',
    lang: 'en-US',
    title: 'Vue.js',
    description: 'The Progressive JavaScript Framework'
  }),
  theme: ref(themeData),
  page: ref(pageData),
  frontmatter: ref(frontmatterData),
  lang: ref('en-US'),
  localeIndex: ref('root'),
  title: ref('Vue Theme SPA Benchmark'),
  description: ref('Plain SPA fixture for Vue VitePress theme components'),
  hash: ref('')
}

export function useData() {
  return data
}

export function useRoute() {
  return route
}

export function useRouter() {
  return {
    route,
    go(path: string) {
      route.path = path
    }
  }
}

export function withBase(path: string) {
  return path
}

export function onContentUpdated(callback: () => void) {
  nextTick(callback)
}

export type Theme = {
  Layout?: unknown
}

export type Header = {
  level: number
  title: string
  slug: string
}
