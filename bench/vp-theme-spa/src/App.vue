<script setup lang="ts">
import { VPTheme, VTLink } from '@vue/theme'
</script>

<template>
  <VPTheme.Layout>
    <template #banner>
      <div class="bench-banner">
        <span>Vue theme SPA benchmark</span>
        <VTLink href="/guide/introduction.html">Docs home</VTLink>
      </div>
    </template>

    <template #sidebar-top>
      <div class="bench-sidebar-panel">
        <span>Composition API</span>
        <span>API Reference</span>
      </div>
    </template>

    <template #content-top>
      <div class="bench-content-callout">
        This fixture renders the VitePress theme layout in a plain SPA shell.
      </div>
    </template>

    <template #aside-mid>
      <div class="bench-aside-card">
        <strong>Theme Components</strong>
        <p>Nav, sidebar, outline, content, footer, menu, and links.</p>
      </div>
    </template>
  </VPTheme.Layout>
</template>

<style scoped>
.bench-banner {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  font-size: 14px;
  color: var(--vt-c-text-2);
  background: var(--vt-c-bg-soft);
  border-bottom: 1px solid var(--vt-c-divider-light);
}

.bench-sidebar-panel,
.bench-aside-card,
.bench-content-callout {
  border: 1px solid var(--vt-c-divider-light);
  background: var(--vt-c-bg-soft);
}

.bench-sidebar-panel {
  margin: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  border-radius: 8px;
}

.bench-content-callout {
  margin-bottom: 24px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--vt-c-text-2);
}

.bench-aside-card {
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--vt-c-text-2);
}

.bench-aside-card strong {
  display: block;
  margin-bottom: 6px;
  color: var(--vt-c-text-1);
}

.bench-aside-card p {
  margin: 0;
  line-height: 1.5;
}
</style>
