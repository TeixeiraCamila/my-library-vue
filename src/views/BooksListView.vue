<script setup>
import { onMounted } from 'vue';
import { useBookStore } from '../stores/bookStore';
import Pagination from '../components/Pagination.vue';
import BookCard from '../components/BookCard.vue';
import { useModal } from '../composables/useModal';
import { useAuthStore } from '../stores/authStore';

const { openForAdd } = useModal();
const authStore = useAuthStore();
const bookStore = useBookStore();

function handleAddBook() {

  // realmente precisa desse if??
	if (!authStore.canCreate) {
		alert('Você não tem permissão para adicionar livros');
		return;
	}
	openForAdd();
}

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
		<div class="py-2">
			<h3>Total de livros encontrados: {{ bookStore.total }}</h3>
		</div>
		<div class="py-2">
			<button
				v-if="authStore.canCreate"
				@click="handleAddBook"
				class="btn-primary"
			>
				➕ Adicionar Livro
			</button>
		</div>
		<div
			v-if="!bookStore.loading"
			class="books-list grid xl:grid-cols-4 gap-6 py-8 px-4"
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
