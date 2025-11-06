<script setup>
import Header from './components/Header.vue';
import Modal from './components/Modal.vue';

import { useAuthStore } from './stores/authStore';
import { useBookStore } from './stores/bookStore';
import { useModal } from './composables/useModal';

const authStore = useAuthStore();
const bookStore = useBookStore()
const { isOpen } = useModal();
</script>

<template>
	<Header v-if="authStore.isAuthenticated || bookStore.loading" />
  <div v-if="bookStore.loading" class="container mx-auto flex items-center">
    <img src="./assets/loader.gif" alt="Loader">
  </div>
	<main v-else class="container mx-auto px-5">
		<RouterView />
	</main>
	<Modal v-if="isOpen" />
</template>

<style scoped>
header {
	color: black;
	background: linear-gradient(180deg, #fff9ee, #fff3d9);
}
</style>
