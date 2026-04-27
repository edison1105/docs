import './styles/index.css'
import { App } from 'vue'
import { VPTheme } from '@vue/theme'
import {
  preferComposition,
  preferSFC,
  filterHeadersByPreference
} from './components/preferences'
import VueSchoolLink from './components/VueSchoolLink.vue'
import ScrimbaLink from './components/ScrimbaLink.vue'
import Layout from './Layout.vue'
// import TextAd from './components/TextAd.vue'

import 'vitepress/dist/client/theme-default/styles/components/vp-code-group.css'
import 'virtual:group-icons.css'

export default Object.assign({}, VPTheme, {
  Layout,
  enhanceApp({ app }: { app: App }) {
    app.provide('prefer-composition', preferComposition)
    app.provide('prefer-sfc', preferSFC)
    app.provide('filter-headers', filterHeadersByPreference)
    app.component('VueSchoolLink', VueSchoolLink)
    app.component('ScrimbaLink', ScrimbaLink)
    // app.component('TextAd', TextAd)
  }
})
