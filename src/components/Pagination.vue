<script setup>
import { computed } from 'vue';
import { useBookStore } from '../stores/bookStore';

const bookStore = useBookStore();
function changePage(page, perPage) {
	bookStore.fetchBooks(page, perPage);
}

// Two before, current, two after (window size up to 5).
const visiblePages = computed(() => {
	const total = Number(bookStore.pagesCount) || 0;
	const current = Number(bookStore.currentPage) || 1;
	if (total <= 0) return [];

	const start = Math.max(1, current - 2);
	const end = Math.min(total, current + 2);

	// Ensure we always try to show up to 5 pages when possible by expanding window at edges
	let s = start;
	let e = end;
	const desired = 5;
	const have = e - s + 1;
	if (have < desired) {
		const need = desired - have;
		// try expand left then right
		const addLeft = Math.min(need, Math.max(0, 1 - (s - 1)) + (s - 1));
		s = Math.max(1, s - Math.floor(need / 2));
		e = Math.min(total, e + Math.ceil(need / 2));
	}

	const pages = [];
	for (let i = s; i <= e; i++) pages.push(i);
	return pages;
});
</script>

<template>
	<div
		class="container relative mx-auto px-40 py-20 pagination flex items-center flex-wrap gap-2"
	>
		<button
			@click="changePage(1, bookStore.perPage)"
			class="btn-primary rounded-xl py-2 px-3 w-full md:w-auto whitespace-nowrap"
			v-if="bookStore.currentPage > 1"
		>
			« Primeira
		</button>
		<button
			@click="changePage(bookStore.prev_page, bookStore.perPage)"
			class="btn-primary rounded-xl py-2 px-3 w-full md:w-auto whitespace-nowrap"
			v-if="bookStore.prev_page"
		>
			‹ Anterior
		</button>

		<template v-for="i in visiblePages" :key="i">
			<button
				@click="changePage(i, bookStore.perPage)"
				class="btn-primary rounded-xl py-5 px-3 w-full md:w-auto whitespace-nowrap"
				:class="{ 'btn-secundary': bookStore.currentPage === i }"
			>
				{{ i }}
			</button>
		</template>

		<button
			@click="changePage(bookStore.next_page, bookStore.perPage)"
			class="btn-primary rounded-xl py-2 px-3 w-full md:w-auto whitespace-nowrap"
			v-if="bookStore.next_page"
		>
			Próximo ›
		</button>
		<button
			@click="changePage(bookStore.pagesCount, bookStore.perPage)"
			class="btn-primary rounded-xl py-2 px-3 w-full md:w-auto whitespace-nowrap"
			v-if="bookStore.currentPage !== bookStore.pagesCount"
		>
			Última »
		</button>
	</div>
</template>

<style scoped>
button {
	min-width: 40px;
}
button:hover{
  background-color: var(--accent2);
}
</style>
