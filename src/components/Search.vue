<script setup>
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
	<div class="hidden md:flex items-center">
		<div class="relative flex items-center gap-2">
			<input
				type="text"
				v-model="searchQuery"
				placeholder="Search..."
				class="primary-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 w-48 lg:w-64"
				@keyup.enter="search"
			/>

			<button class="btn-secundary" @click="search">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 left-3 "
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
					/>
				</svg>
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
