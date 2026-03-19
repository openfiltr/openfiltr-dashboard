<template>
  <div class="stat-card">
    <p class="stat-card__label">{{ label }}</p>
    <p class="stat-card__value">{{ value }}</p>
    <p v-if="hint" class="stat-card__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hint?: string
  label: string
  value: string
}>()
</script>
