<template>
  <div class="page-header">
    <div class="page-header__copy">
      <p v-if="eyebrow" class="muted">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  subtitle?: string
  title: string
}>()
</script>
