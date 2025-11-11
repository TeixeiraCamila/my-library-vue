<script setup>
import { Search } from 'lucide-vue-next';
import { ref } from 'vue';
const searchQuery = ref('');

import { useBookStore } from '../stores/bookStore';
const bookStore = useBookStore();

function search() {
	if (!searchQuery.value.trim()) bookStore.fetchBooks();
	bookStore.searchBook(searchQuery.value.trim());
	setTimeout(() => {
		searchQuery.value = '';
	}, 500);
}
</script>

<template>
	<div class="md:flex items-center">
		<div class="relative flex items-center gap-2">
			<input
				type="text"
				v-model="searchQuery"
				placeholder="Search..."
				class="primary-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 w-48 lg:w-64"
				@keyup.enter="search"
			/>

			<button class="btn-secundary" @click="search">
				<Search color="#000" :size="24" />
			</button>
		</div>
	</div>
</template>

<style scoped>
input svg {
	fill: var(--text);
}
input::placeholder {
	color: var(--text);
}
</style>
