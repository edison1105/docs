<script setup lang="ts">
import { VPTheme } from '@vue/theme'
import Banner from './components/Banner.vue'
import PreferenceSwitch from './components/PreferenceSwitch.vue'
import SecurityUpdateBtn from './components/SecurityUpdateBtn.vue'
import SponsorsAside from './components/SponsorsAside.vue'
</script>

<template>
  <VPTheme.Layout>
    <template #banner>
      <Banner />
    </template>
    <template #sidebar-top>
      <PreferenceSwitch />
    </template>
    <template #sidebar-bottom>
      <SecurityUpdateBtn />
    </template>
    <template #aside-mid>
      <SponsorsAside />
    </template>
  </VPTheme.Layout>
</template>
