<script setup>
import { onMounted } from 'vue';

import { useBookStore } from '../stores/bookStore';

import BookCard from '../components/BookCard.vue';

const bookStore = useBookStore();
onMounted(() => {
	bookStore.fetchBooks();  
});
</script>

<template>
	<div class="msg">
		<div v-if="bookStore.loading">Carregando livros...</div>
		<div v-if="bookStore.error">
			{{ bookStore.error }}
		</div>
		<div>Total de livros registrados: {{ bookStore.total }}</div>
	</div>

	<div v-if="!bookStore.loading && bookStore.books.length > 0">
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
		>
			<BookCard
				v-for="book in bookStore.books"
				:key="book.book_id"
				:book="book"
			/>
		</div>
	</div>
</template>

<style scoped></style>
