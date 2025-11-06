<script setup>
import { onMounted } from 'vue';
import { useBookStore } from '../stores/bookStore';
import Pagination from '../components/Pagination.vue';
import BookCard from '../components/BookCard.vue';

const bookStore = useBookStore();

onMounted(async () => {
	await bookStore.fetchBooks();
	await bookStore.fetchBookshelves();
});
</script>

<template>
	<div class="books-list flex flex-wrap justify-between gap-2 py-10">
		<BookCard
			v-for="book in bookStore.books"
			:key="`${book.book_id} - ${book.title}`"
			:book="book"
		/>
	</div>
	<Pagination />
</template>

<style scoped></style>
