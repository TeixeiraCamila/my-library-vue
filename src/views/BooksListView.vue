<script setup>
import { Plus, Library } from 'lucide-vue-next';
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
	<div
		class="container mx-auto flex flex-col items-center justify-center px-4 py-4"
	>
		<div class="flex w-full items-center py-2 justify-between">
			<Text
				class="flex gap-3 items-center"
				:as="'span'"
				:variant="'title'"
				:weight="'semibold'"
				:color="`oklch(27.8% 0.033 256.848)`"
			>
				<Library color="#ff6b6b" :size="18" :stroke-width="2.5" />
				Total de livros encontrados: {{ bookStore.total }}
			</Text>

			<button
				v-if="authStore.canCreate"
				@click="handleAddBook"
				class="btn-primary flex items-center gap-1"
			>
				<Plus color="#ff6b6b" :size="24" />
				Adicionar Livro
			</button>
		</div>
		<div v-if="bookStore.loading" class="py-50">
			<img src="../assets/loader.gif" alt="Loading..." />
		</div>
		<div
			v-if="!bookStore.loading"
			class="books-list grid xl:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-6 py-8"
		>
			<BookCard
				v-for="(book, index) in bookStore.books"
				:key="index"
				:book="book"
			/>
		</div>
	</div>

	<Pagination />
</template>

<style scoped></style>
