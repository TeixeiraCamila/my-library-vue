<script setup>
import { computed } from 'vue';

const props = defineProps({
  as: {
    type: String,
    default: 'p',
    validator: (value) => ['p', 'span', 'div', 'label'].includes(value)
  },
  variant: {
    type: String,
    default: 'body',
    validator: (value) => ['body', 'body-sm', 'caption', 'overline'].includes(value)
  },
  weight: {
    type: String,
    default: null,
    validator: (value) => !value || ['light', 'normal', 'medium', 'semibold', 'bold'].includes(value)
  },
  align: {
    type: String,
    default: null,
    validator: (value) => !value || ['left', 'center', 'right', 'justify'].includes(value)
  },
  color: {
    type: String,
    default: 'default'
  },
  truncate: {
    type: Boolean,
    default: false
  },
  lines: {
    type: Number,
    default: null
  }
});

const variantClasses = {
  'body': 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  'caption': 'text-xs leading-relaxed',
  'overline': 'text-xs uppercase tracking-wider'
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
};

const colorClasses = {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  subtle: 'text-gray-500',
  primary: 'text-sky-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  white: 'text-white'
};

const classes = computed(() => {
  const classList = [variantClasses[props.variant]];

  if (props.weight) {
    classList.push(weightClasses[props.weight]);
  }

  if (props.align) {
    classList.push(alignClasses[props.align]);
  }

  classList.push(colorClasses[props.color] || props.color);

  if (props.truncate) {
    classList.push('truncate');
  }

  if (props.lines) {
    classList.push(`line-clamp-${props.lines}`);
  }

  return classList.filter(Boolean).join(' ');
});
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>