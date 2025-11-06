<script setup>
import Header from './components/Header.vue';
import Modal from './components/Modal.vue';

import { useAuthStore } from './stores/authStore';
import { useModal } from './composables/useModal';

const authStore = useAuthStore();
const { isOpen } = useModal();
</script>

<template>
	<Header v-if="authStore.isAuthenticated" />

	<RouterView />

	<Modal v-if="isOpen" />
</template>

<style scoped>
header {
	color: black;
	background: linear-gradient(180deg, #fff9ee, #fff3d9);
}
</style>
