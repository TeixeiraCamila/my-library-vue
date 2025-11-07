<script setup>
import {
	ref,
	watch,
	onMounted,
	onBeforeUnmount,
	nextTick,
	computed,
} from 'vue';
import { useModal } from '../composables/useModal';
import { useBookStore } from '../stores/bookStore';
import { useBookForm } from '../composables/useBookForm';

const booksStore = useBookStore();

const { close, mode, editingBook } = useModal();

const isSubmitting = ref(false);
const errorMessage = ref('');

const shelves = computed(() => booksStore.bookshelves || []);

// Inicializa o form DEPOIS de ter o editingBook
const { form, setForm, buildPayload, resetForm } = useBookForm();

// Accessibility: focus management for modal
const modalRef = ref(null);

function handleKeydown(e) {
	if (e.key === 'Escape') {
		close();
	}
}

// // 🔥 IMPORTANTE: Atualiza o form quando o editingBook muda
// watch(
// 	() => editingBook.value,
// 	(book) => {
// 		console.log('📝 editingBook mudou:', book);
// 		if (book) {
// 			setForm(book);
// 		} else {
// 			resetForm();
// 		}
// 	},
// 	{ immediate: true, deep: true } // immediate garante que executa na montagem também
// );

onMounted(async () => {
	// Carrega as estantes se necessário
	if (!booksStore.bookshelves || booksStore.bookshelves.length === 0) {
		await booksStore.fetchBookshelves();
	}

	// Se já tem editingBook, preenche o form
	if (editingBook.value) {
		console.log('🔄 Preenchendo form no onMounted:', editingBook.value);
		setForm(editingBook.value);
	}

	nextTick(() => {
		modalRef.value?.focus();
		const first = modalRef.value?.querySelector(
			'input, select, textarea, button'
		);
		first?.focus();
	});

	window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
	window.removeEventListener('keydown', handleKeydown);
});

const handleBackdropClick = (event) => {
	if (event.target === event.currentTarget) close();
};

const handleSubmit = async () => {
	errorMessage.value = '';

	console.log('🚀 Form atual:', form.value);
	console.log('🚀 Mode:', mode.value);
	console.log('🚀 EditingBook:', editingBook.value);

	if (!form.value.title || !form.value.author) {
		errorMessage.value = 'Título e Autor são obrigatórios!';
		return;
	}

	isSubmitting.value = true;

	try {
		const payload = buildPayload();
		console.log('📦 Payload final:', payload);

		if (mode.value === 'edit' && editingBook.value?.book_id) {
			await booksStore.updateBook(editingBook.value.book_id, payload);
			console.log('✅ Livro atualizado');
		} else {
			await booksStore.addBook(payload);
			console.log('✅ Livro criado');
		}

		close();
	} catch (error) {
		console.error('❌ Erro ao salvar livro:', error);
		errorMessage.value = 'Erro ao salvar livro: ' + error.message;
	} finally {
		isSubmitting.value = false;
	}
};
</script>
<template>
	<div
		class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
		@click="handleBackdropClick"
	>
		<div
			ref="modalRef"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			class="modal bg-white rounded-lg p-6 mx-4 max-w-4xl w-full"
		>
			<div class="flex justify-between items-center mb-4">
				<h2 id="modal-title" class="text-2xl font-bold">
					{{ mode === 'add' ? '📚 Adicionar Livro' : '✏️ Editar Livro' }}
				</h2>
				<button
					@click="close"
					class="text-gray-500 hover:text-gray-700"
					aria-label="Fechar modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form @submit.prevent="handleSubmit">
				<div
					v-if="errorMessage"
					class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm"
				>
					⚠️ {{ errorMessage }}
				</div>

				<div class="space-y-4 max-h-[60vh] overflow-auto pr-2">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label class="flex flex-col">
							<span class="font-medium mb-1">Title *</span>
							<input
								type="text"
								v-model="form.title"
								required
								placeholder="Nome do livro"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Author *</span>
							<input
								type="text"
								v-model="form.author"
								required
								placeholder="Nome do autor"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Additional Authors</span>
							<input
								type="text"
								v-model="form.additional_authors"
								placeholder="Co-autores (separados por vírgula)"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Publisher</span>
							<input
								type="text"
								v-model="form.publisher"
								placeholder="Nome da editora"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">ISBN</span>
							<input
								type="text"
								v-model="form.isbn"
								placeholder="ISBN-10"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">ISBN-13</span>
							<input
								type="text"
								v-model="form.isbn13"
								placeholder="ISBN-13"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Binding</span>
							<select
								v-model="form.binding"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
								<option value="">Selecione</option>
								<option value="Paperback">Brochura</option>
								<option value="Hardcover">Capa Dura</option>
								<option value="Kindle Edition">Kindle</option>
								<option value="ebook">E-book</option>
								<option value="Audiobook">Audiobook</option>
							</select>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Number Of Pages</span>
							<input
								type="number"
								v-model="form.number_of_pages"
								min="0"
								placeholder="Ex: 256"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Publication Year</span>
							<input
								type="number"
								v-model="form.publication_year"
								min="1000"
								max="2100"
								placeholder="Ex: 2023"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Shelf</span>
							<select
								multiple
								v-model="form.book_bookshelves"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
								<option value="">Nenhuma</option>
								<option
									v-for="shelf in shelves"
									:key="shelf.id"
									:value="shelf.id"
								>
									{{ shelf.emoji }} {{ shelf.shelve }}
								</option>
							</select>
							<span class="text-xs text-gray-500 mt-1">
								Segure Ctrl/Cmd para selecionar múltiplas
							</span>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Reading Status</span>
							<select
								v-model="form.reading_status"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
								<option value="">Nenhuma</option>
								<option value="tbr">📚 Quero Ler</option>
								<option value="currently-reading">📖 Lendo</option>
								<option value="read">✅ Lido</option>
								<option value="abandonado">❌ Abandonado</option>
							</select>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">My Rating</span>
							<select
								v-model="form.my_rating"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
								<option value="">Não avaliado</option>
								<option value="1">⭐ 1 estrela</option>
								<option value="2">⭐⭐ 2 estrelas</option>
								<option value="3">⭐⭐⭐ 3 estrelas</option>
								<option value="4">⭐⭐⭐⭐ 4 estrelas</option>
								<option value="5">⭐⭐⭐⭐⭐ 5 estrelas</option>
							</select>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Vezes Lido</span>
							<input
								type="text"
								v-model="form.read_count"
								placeholder="Ex: 1, 2, 3..."
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex items-center gap-2 pt-7">
							<input
								type="checkbox"
								v-model="form.owned_copies"
								class="w-5 h-5 rounded focus:ring-2 focus:ring-sky-400"
							/>
							<span class="font-medium">Possuo cópia física</span>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Data de Início da Leitura</span>
							<input
								type="date"
								v-model="form.start_date"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Data de Término da Leitura</span>
							<input
								type="date"
								v-model="form.finish_date"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
					</div>

					<div class="flex flex-col">
						<label class="font-medium mb-1">Minha Resenha</label>
						<textarea
							v-model="form.my_review"
							rows="4"
							placeholder="Escreva sua opinião sobre o livro..."
							class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
						></textarea>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button
						type="button"
						@click="close"
						class="btn-secundary flex-1 px-4 py-2 rounded-xl"
						:disabled="isSubmitting"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="btn-primary flex-1 px-4 py-2 rounded-xl"
						:disabled="isSubmitting"
					>
						{{
							isSubmitting
								? '⏳ Salvando...'
								: mode === 'add'
								? '➕ Adicionar'
								: '💾 Salvar'
						}}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
.modal {
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-primary:hover:not(:disabled),
.btn-secundary:hover:not(:disabled) {
	transform: translateY(-1px);
	transition: transform 0.2s;
}

.btn-primary:disabled,
.btn-secundary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

label {
	align-items: flex-start;
}

/* Scrollbar customizada */
.overflow-auto::-webkit-scrollbar {
	width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
	background: #888;
	border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
	background: #555;
}
</style>
