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
	<div class="container mx-auto flex flex-col items-center justify-center">
		<div v-if="bookStore.loading" class="py-50">
			<img src="../assets/loader.gif" alt="Loading..." />
		</div>
		<div>
			<h3>Total de livros encontrados: {{ bookStore.total }}</h3>
		</div>
		<div
			v-if="!bookStore.loading"
			class="books-list flex flex-wrap justify-between gap-2 py-10 px-5"
		>
			<BookCard
				v-for="book in bookStore.books"
				:key="`${book.book_id} - ${book.title}`"
				:book="book"
			/>
		</div>
	</div>

	<Pagination />
</template>

<style scoped></style>
