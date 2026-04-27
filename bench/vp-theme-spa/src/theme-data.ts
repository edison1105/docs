export const page = {
  title: 'Vue Theme SPA Benchmark',
  description: 'Plain SPA fixture for Vue VitePress theme components',
  relativePath: 'guide/introduction.md',
  filePath: 'guide/introduction.md',
  headers: [
    { level: 2, title: 'Approachable', slug: 'section-1' },
    { level: 2, title: 'Performant', slug: 'section-2' },
    { level: 2, title: 'Versatile', slug: 'section-3' },
    { level: 2, title: 'Composition', slug: 'section-4' },
    { level: 2, title: 'Components', slug: 'section-5' },
    { level: 2, title: 'Reactivity', slug: 'section-6' },
    { level: 2, title: 'Tooling', slug: 'section-7' },
    { level: 2, title: 'Scaling', slug: 'section-8' }
  ],
  isNotFound: false
}

export const frontmatter = {
  page: false,
  sidebar: true,
  outline: [2, 3],
  footer: true
}

export const theme = {
  appearance: true,
  editLink: {
    repo: 'vuejs/docs',
    text: 'Edit this page on GitHub'
  },
  nav: [
    { text: 'Guide', link: '/guide/introduction.html', activeMatch: '/guide/' },
    { text: 'API', link: '/api/' },
    {
      text: 'Ecosystem',
      items: [
        { text: 'Partners', link: '/partners/' },
        { text: 'Themes', link: '/ecosystem/themes.html' },
        { text: 'Newsletters', link: '/ecosystem/newsletters.html' }
      ]
    },
    {
      text: 'Resources',
      items: [
        { text: 'Team', link: '/about/team.html' },
        { text: 'Releases', link: '/about/releases.html' },
        { text: 'Community Guide', link: '/about/community-guide.html' }
      ]
    }
  ],
  sidebar: {
    '/guide/': [
      {
        text: 'Essentials',
        items: [
          { text: 'Introduction', link: '/guide/introduction.html' },
          { text: 'Quick Start', link: '/guide/quick-start.html' },
          { text: 'Creating an Application', link: '/guide/essentials/application.html' },
          { text: 'Template Syntax', link: '/guide/essentials/template-syntax.html' },
          { text: 'Reactivity Fundamentals', link: '/guide/essentials/reactivity-fundamentals.html' },
          { text: 'Computed Properties', link: '/guide/essentials/computed.html' },
          { text: 'Class and Style Bindings', link: '/guide/essentials/class-and-style.html' },
          { text: 'Conditional Rendering', link: '/guide/essentials/conditional.html' },
          { text: 'List Rendering', link: '/guide/essentials/list.html' },
          { text: 'Event Handling', link: '/guide/essentials/event-handling.html' },
          { text: 'Form Input Bindings', link: '/guide/essentials/forms.html' },
          { text: 'Lifecycle Hooks', link: '/guide/essentials/lifecycle.html' },
          { text: 'Watchers', link: '/guide/essentials/watchers.html' }
        ]
      },
      {
        text: 'Components In-Depth',
        items: [
          { text: 'Registration', link: '/guide/components/registration.html' },
          { text: 'Props', link: '/guide/components/props.html' },
          { text: 'Events', link: '/guide/components/events.html' },
          { text: 'Component v-model', link: '/guide/components/v-model.html' },
          { text: 'Slots', link: '/guide/components/slots.html' },
          { text: 'Provide / inject', link: '/guide/components/provide-inject.html' },
          { text: 'Async Components', link: '/guide/components/async.html' }
        ]
      }
    ]
  },
  socialLinks: [
    { icon: 'github', link: 'https://github.com/vuejs/core' },
    { icon: 'twitter', link: 'https://twitter.com/vuejs' },
    { icon: 'discord', link: 'https://chat.vuejs.org' }
  ],
  footer: {
    license: {
      text: 'MIT Licensed',
      link: 'https://opensource.org/licenses/MIT'
    },
    copyright: 'Copyright 2014-present Evan You'
  },
  i18n: {
    search: 'Search',
    menu: 'Menu',
    toc: 'On this page',
    returnToTop: 'Return to top',
    appearance: 'Appearance',
    previous: 'Previous',
    next: 'Next',
    pageNotFound: 'Page not found',
    deadLink: 'This link is broken.',
    deadLinkReport: 'Please report this issue.',
    footerLicense: 'Released under the MIT License.',
    ariaAnnouncer: 'Route announces',
    ariaSkipToContent: 'Skip to content'
  }
}
