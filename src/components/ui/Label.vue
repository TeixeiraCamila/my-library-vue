<!-- /ui/Label.vue -->

<script setup>
import { defineProps } from 'vue';

defineProps({
  forId: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <label 
    :forId="forId"
    :class="[
      'block text-left px-2 text-sm font-medium mb-2 transition-colors ',
      error ? 'text-red-600' : 'text-gray-700',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
  >
    <slot />
    <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
  </label>
</template>