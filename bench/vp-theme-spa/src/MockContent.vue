<template>
  <main>
    <h1 id="vue-theme-spa-benchmark">Vue Theme SPA Benchmark</h1>
    <p>
      This page intentionally renders a dense documentation-like content body
      inside the real Vue VitePress theme layout.
    </p>

    <section v-for="section in sections" :key="section.id">
      <h2 :id="section.id">{{ section.title }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">
        {{ paragraph }}
      </p>
      <ul>
        <li v-for="item in section.items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
const sections = Array.from({ length: 8 }, (_, index) => ({
  id: `section-${index + 1}`,
  title: [
    'Approachable',
    'Performant',
    'Versatile',
    'Composition',
    'Components',
    'Reactivity',
    'Tooling',
    'Scaling'
  ][index],
  paragraphs: [
    'Vue builds on top of standard HTML, CSS and JavaScript with a component model that scales from small widgets to full applications.',
    'The benchmark keeps the content static so the measurement emphasizes mount cost and the theme component tree rather than app-specific state changes.'
  ],
  items: [
    'Navigation state',
    'Sidebar state',
    'Outline rendering',
    'Content wrapper',
    'Footer links'
  ]
}))
</script>
