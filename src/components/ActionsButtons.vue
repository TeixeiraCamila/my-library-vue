<script setup>
import { defineProps } from 'vue';

import { useBookStore } from '../stores/bookStore';
import { useModal } from '../composables/useModal';
const { openForEdit } = useModal();

const props = defineProps({
	book: Object,
});

const bookStore = useBookStore();

function deletBook(id) {
  if (!id) return;
	bookStore.deleteBook(id);
  setTimeout(() => {
    bookStore.fetchBooks();
  }, 500);
}
function editBook(id) {
	console.log(id);
}
</script>

<template>
	<div class="book-actions flex items-center gap-2">
		<button class="btn-secundary" @click="openForEdit(book)">
			✏️ Editar
		</button>
		<button class="btn-secundary" @click="deletBook(book.book_id)">
			🗑️ Deletar
		</button>
	</div>
</template>

<style scoped></style>
