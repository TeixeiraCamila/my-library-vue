<script setup>
import Header from './components/Header.vue';
import Pagination from './components/Pagination.vue';
import Modal from './components/Modal.vue';

import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useModal } from './composables/useModal';

const authStore = useAuthStore();
const { isOpen } = useModal();

onMounted(async () => {
	await authStore.checkSession();
});
</script>

<template>
	<Header v-if="authStore.isAuthenticated" />
	<main class="container relative mx-auto px-4">
		<RouterView />
	</main>
	<Pagination v-if="authStore.isAuthenticated" />
	<Modal v-if="isOpen"/>
</template>

<style scoped>
header {
	color: black;
	background: linear-gradient(180deg, #fff9ee, #fff3d9);
}
</style>
