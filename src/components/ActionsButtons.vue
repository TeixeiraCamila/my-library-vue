<script setup>
import { defineProps } from 'vue';

import { useBookStore } from '../stores/bookStore';
import { useAuthStore } from '../stores/authStore';
import { useModal } from '../composables/useModal';

const { openForEdit } = useModal();
const authStore = useAuthStore();

const props = defineProps({
	book: Object,
});

const bookStore = useBookStore();

// function deletBook(id) {
// 	if (!id) return;
// 	bookStore.deleteBook(id);
// 	setTimeout(() => {
// 		bookStore.fetchBooks();
// 	}, 500);
// }
// function editBook(id) {
// 	console.log(id);
// }

function handleEditBook(book) {
	if (!authStore.canEdit) {
		alert('Você não tem permissão para editar livros');
		return;
	}
	openForEdit(book);
}

function handleDeleteBook(bookId) {
  bookStore.deleteBook(bookId);
	if (confirm('Tem certeza que deseja deletar?')) {
		
	}
}
</script>

<template>
	<div class="book-actions flex items-center gap-2">
		<button
			v-if="authStore.canEdit"
			class="btn-secundary"
			@click="handleEditBook(book)"
		>
			✏️ Editar
		</button>
		<button
			v-if="authStore.canDelete"
			class="btn-secundary"
			@click="handleDeleteBook(book.book_id)"
		>
			🗑️ Deletar
		</button>
	</div>
</template>

<style scoped></style>
