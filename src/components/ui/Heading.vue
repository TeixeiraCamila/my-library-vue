<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: [Number, String],
    default: 2,
    validator: (value) => [1, 2, 3, 4, 5, 6].includes(Number(value))
  },
  weight: {
    type: String,
    default: 'bold',
    validator: (value) => ['medium', 'semibold', 'bold', 'extrabold'].includes(value)
  },
  color: {
    type: String,
    default: 'default'
  },
  align: {
    type: String,
    default: null
  }
});

const tag = computed(() => `h${props.level}`);

const sizeClasses = {
  1: 'text-4xl md:text-5xl',
  2: 'text-3xl md:text-4xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
  5: 'text-lg md:text-xl',
  6: 'text-base md:text-lg'
};

const weightClasses = {
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
};

const colorClasses = {
  default: 'text-gray-800',
  muted: 'text-gray-600',
  primary: 'text-sky-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600'
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

const classes = computed(() => {
  const classList = [
    sizeClasses[props.level],
    weightClasses[props.weight],
    colorClasses[props.color] || props.color,
    'leading-tight'
  ];

  if (props.align) {
    classList.push(alignClasses[props.align]);
  }

  return classList.join(' ');
});
</script>

<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>
