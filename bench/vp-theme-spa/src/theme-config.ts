import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import { useData } from 'vitepress'

export const configSymbol: InjectionKey<Ref<Record<string, any>>> =
  Symbol('config')

export function createConfig() {
  const { theme } = useData()
  return computed(() => ({
    ...theme.value,
    appearance: false
  }))
}

export function provideConfig() {
  const config = createConfig()
  provide(configSymbol, config)
}

export function useConfig() {
  return {
    config: inject(configSymbol)!
  }
}

export function withConfigProvider(App: any) {
  return App
}
