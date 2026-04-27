import { createVaporApp } from 'vue'
import App from './App.vue'
import MockContent from './MockContent.vue'
import './style.css'
import { configSymbol, createConfig } from './theme-config'

performance.mark('vp-theme-spa:mount:start')
createVaporApp(App)
  .component('Content', MockContent)
  .provide(configSymbol, createConfig())
  .mount('#app')
performance.mark('vp-theme-spa:mount:end')
performance.measure(
  'vp-theme-spa:mount',
  'vp-theme-spa:mount:start',
  'vp-theme-spa:mount:end'
)
