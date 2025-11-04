<script setup>
import { onMounted } from 'vue';
import { useBookStore } from '../stores/bookStore';

import BookCard from '../components/BookCard.vue';

const bookStore = useBookStore();

onMounted(async () => {
	await bookStore.fetchBooks();
	await bookStore.fetchBookshelves();
});
</script>

<template>
  <div v-if="bookStore.loading" class="h-100">
    LOADING
  </div>
	<div v-else class="books-list flex flex-wrap justify-between gap-8">
		<BookCard
			v-for="book in bookStore.books"
			:key="`${book.book_id} - ${book.title}`"
			:book="book"
		/>
	</div>
</template>

<style scoped></style>
