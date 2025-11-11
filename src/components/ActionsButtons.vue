<script setup>
import { Trash, Pencil } from 'lucide-vue-next';
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

function handleEditBook(book) {
	if (!authStore.canEdit) {
		alert('Você não tem permissão para editar livros');
		return;
	}
	openForEdit(book);
}

async function handleDeleteBook(bookId) {
	if (!authStore.canDelete) {
		alert('Você não tem permissão para deletar livros');
		return;
	}

	try {
		if (confirm(`Tem certeza que deseja deletar este livro?`)) {
			await bookStore.deleteBook(bookId);
		}
	} catch (error) {
		console.error('[ActionsButtons] Erro ao deletar:', error);
		alert('Não foi possível deletar o livro. Tente novamente.');
	}
}
</script>

<template>
	<div class="book-actions flex items-center justify-center gap-10">
		<button
			v-if="authStore.canEdit"
			class="btn-secundary hover:scale-105  flex items-center gap-1"
			@click="handleEditBook(book)"
		>
    <Pencil :size="20" :stroke-width="2.5" />
			Editar
		</button>
		<button
			v-if="authStore.canDelete"
			class="btn-secundary hover:scale-105 flex items-center gap-1"
			@click="handleDeleteBook(book.book_id)"
		>
			<Trash :size="20" :stroke-width="2.5" />
			Deletar
		</button>
	</div>
</template>

<style scoped></style>
