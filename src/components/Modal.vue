<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';
import { useModal } from '../composables/useModal';
import { useBookStore } from '../stores/bookStore';
import { useBookForm } from '../composables/useBookForm';

const booksStore = useBookStore();
const { close, mode, editingBook } = useModal();

const isSubmitting = ref(false);
const errorMessage = ref('');

const shelves = computed(() => booksStore.bookshelves || []);

// Inicializa o form
const { form, setForm, buildPayload, resetForm } = useBookForm();

const modalRef = ref(null);

const handleBackdropClick = (event) => {
	if (event.target === event.currentTarget) close();
};

// Validação de limites para int2 (smallint: -32,768 a 32,767)
const validateInt2 = (value, fieldName) => {
	const num = parseInt(value);
	if (isNaN(num)) return true; // Permite vazio
	if (num < -32768 || num > 32767) {
		errorMessage.value = `${fieldName} deve estar entre -32,768 e 32,767`;
		return false;
	}
	return true;
};

const handleSubmit = async () => {
	console.log('🚀 [1] Iniciando handleSubmit');
	errorMessage.value = '';

	console.log('🚀 [2] Form atual:', form.value);
	console.log('🚀 [3] Mode:', mode.value);
	console.log('🚀 [4] EditingBook:', editingBook.value);

	// Validação básica
	if (!form.value.title || !form.value.author) {
		console.log('❌ [5] Validação falhou: título ou autor vazios');
		errorMessage.value = 'Título e Autor são obrigatórios!';
		return;
	}

	// Validar apenas read_count (int2), pois number_of_pages e publication_year são int4
	if (
		form.value.read_count &&
		!validateInt2(form.value.read_count, 'Contagem de leituras')
	) {
		console.log('❌ [6] Validação falhou: read_count inválido');
		return;
	}

	console.log('✅ [7] Validações passaram');
	isSubmitting.value = true;
	console.log('🔄 [8] isSubmitting = true');

	try {
		const payload = buildPayload();
		console.log('📦 [9] Payload gerado:', payload);

		if (mode.value === 'edit' && editingBook.value?.book_id) {
			console.log('✏️ [10] Modo EDIÇÃO - chamando updateBook');
			const result = await booksStore.updateBook(editingBook.value.book_id, payload);
			console.log('✅ [11] updateBook retornou:', result);
		} else {
			console.log('➕ [12] Modo ADICIONAR - chamando addBook');
			const result = await booksStore.addBook(payload);
			console.log('✅ [13] addBook retornou:', result);
		}
		
		console.log('🎉 [14] Sucesso! Fechando modal...');
		close();
		console.log('✅ [15] Modal fechado');
	} catch (error) {
		// Log structured error and show a friendly message to the user
		logAndFormat(error, 'Salvar livro');
	} finally {
		console.log('🔄 [19] Finalizando - isSubmitting = false');
		isSubmitting.value = false;
	}
};

onMounted(async () => {
	console.log('🎬 Modal montado');
	// Carrega as estantes se necessário
	if (!booksStore.bookshelves || booksStore.bookshelves.length === 0) {
		console.log('📚 Carregando estantes...');
		await booksStore.fetchBookshelves();
	}
	// Se já tem editingBook, preenche o form
	if (editingBook.value) {
		console.log('🔄 Preenchendo form no onMounted:', editingBook.value);
		setForm(editingBook.value);
	}
});

// Watch para limpar datas vazias
watch(
	() => form.value.start_date,
	(newVal) => {
		if (newVal === '') form.value.start_date = null;
	}
);

watch(
	() => form.value.finish_date,
	(newVal) => {
		if (newVal === '') form.value.finish_date = null;
	}
);
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
								v-model.trim="form.title"
								required
								placeholder="Nome do livro"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Author *</span>
							<input
								type="text"
								v-model.trim="form.author"
								required
								placeholder="Nome do autor"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Additional Authors</span>
							<input
								type="text"
								v-model.trim="form.additional_authors"
								placeholder="Co-autores (separados por vírgula)"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Number Of Pages</span>
							<input
								type="number"
								v-model.number="form.number_of_pages"
								min="1"
								max="99999"
								placeholder="Ex: 256"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Publication Year</span>
							<input
								type="number"
								v-model.number="form.publication_year"
								min="1"
								max="9999"
								placeholder="Ex: 2024"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Publisher</span>
							<input
								type="text"
								v-model.trim="form.publisher"
								placeholder="Nome da editora"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">ISBN-13</span>
							<input
								type="text"
								v-model.trim="form.isbn13"
								placeholder="ISBN-13"
								maxlength="17"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							<span class="font-medium mb-1">Read Count</span>
							<input
								type="number"
								v-model.number="form.read_count"
								min="0"
								max="32767"
								placeholder="Quantas vezes leu"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
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

						<label class="flex flex-col">
							<span class="font-medium mb-1">Reading Status</span>
							<select
								v-model="form.reading_status"
								class="primary-input py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
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
						{{ isSubmitting ? '⏳ Salvando...' : mode === 'add' ? '➕ Adicionar' : '💾 Salvar' }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
span.font-medium {
	text-align: left;
	padding-left: 12px;
}
</style>