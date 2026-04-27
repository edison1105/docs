<script setup>
import { ref } from 'vue'

const activeComponent = ref('A')
</script>

<template>
  <div class="demo">
    <label>
      <input type="radio" v-model="activeComponent" value="A" /> A
    </label>
    <label>
      <input type="radio" v-model="activeComponent" value="B" /> B
    </label>
    <Transition name="fade" mode="out-in">
      <div v-if="activeComponent === 'A'">Component A</div>
      <div v-else>Component B</div>
    </Transition>
  </div>
</template>
