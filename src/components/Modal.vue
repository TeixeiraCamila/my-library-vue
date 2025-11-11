<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useModal } from '../composables/useModal';
import { useBookStore } from '../stores/bookStore';
import { useBookForm } from '../composables/useBookForm';
import { Heading, Label, ErrorText } from './ui';

const booksStore = useBookStore();
const { close, mode, editingBook } = useModal();

const isSubmitting = ref(false);
const errorMessage = ref('');
const fieldErrors = ref({
	title: '',
	author: '',
	number_of_pages: '',
	publication_year: '',
	read_count: '',
});

const shelves = computed(() => booksStore.bookshelves || []);

// Inicializa o form
const { form, setForm, buildPayload, resetForm } = useBookForm();

const modalRef = ref(null);

const handleBackdropClick = (event) => {
	if (event.target === event.currentTarget) close();
};

// Limpar erros de campo específico
const clearFieldError = (field) => {
	fieldErrors.value[field] = '';
	if (errorMessage.value) errorMessage.value = '';
};

// Validação de limites para int2 (smallint: -32,768 a 32,767)
const validateInt2 = (value, fieldName, fieldKey) => {
	const num = parseInt(value);
	if (isNaN(num)) return true; // Permite vazio
	if (num < -32768 || num > 32767) {
		fieldErrors.value[
			fieldKey
		] = `${fieldName} deve estar entre -32,768 e 32,767`;
		return false;
	}
	return true;
};

const handleSubmit = async () => {
	console.log('🚀 [1] Iniciando handleSubmit');
	errorMessage.value = '';
	fieldErrors.value = {
		title: '',
		author: '',
		number_of_pages: '',
		publication_year: '',
		read_count: '',
	};

	console.log('🚀 [2] Form atual:', form.value);
	console.log('🚀 [3] Mode:', mode.value);
	console.log('🚀 [4] EditingBook:', editingBook.value);

	// Validação básica
	let hasError = false;

	if (!form.value.title) {
		fieldErrors.value.title = 'Título é obrigatório';
		hasError = true;
	}

	if (!form.value.author) {
		fieldErrors.value.author = 'Autor é obrigatório';
		hasError = true;
	}

	// Validar apenas read_count (int2), pois number_of_pages e publication_year são int4
	if (form.value.read_count) {
		if (
			!validateInt2(form.value.read_count, 'Contagem de leituras', 'read_count')
		) {
			hasError = true;
		}
	}

	if (hasError) {
		console.log('❌ [5] Validação falhou');
		errorMessage.value = 'Por favor, corrija os erros antes de continuar';
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
			const result = await booksStore.updateBook(
				editingBook.value.book_id,
				payload
			);
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
		console.error('❌ [16] ERRO CAPTURADO:', error);
		console.error('❌ [17] Tipo do erro:', typeof error);
		console.error('❌ [18] Stack:', error.stack);
		errorMessage.value =
			'Erro ao salvar livro: ' + (error.message || 'Erro desconhecido');
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
		class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		@click="handleBackdropClick"
	>
		<div
			ref="modalRef"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			class="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl"
		>
			<!-- Header -->
			<div class="flex justify-between items-center mb-6">
				<Heading level="2" id="modal-title">
					{{ mode === 'add' ? '📚 Adicionar Livro' : '✏️ Editar Livro' }}
				</Heading>
				<button
					@click="close"
					class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

			<!-- Form -->
			<form @submit.prevent="handleSubmit">
				<!-- Error Message Geral -->
				<div
					v-if="errorMessage"
					class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2"
				>
					<svg
						class="w-5 h-5 mt-0.5 flex-shrink-0"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{{ errorMessage }}</span>
				</div>

				<!-- Fields -->
				<div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Title -->
						<div class="flex flex-col justify-start">
							<Label for="title" required :error="!!fieldErrors.title">
								Título
							</Label>
							<input
								class="primary-input"
								id="title"
								type="text"
								v-model.trim="form.title"
								@input="clearFieldError('title')"
								placeholder="Nome do livro"
								:class="[
									fieldErrors.title
										? 'border-2 border-red-500 focus:ring-red-400'
										: 'border border-gray-300 focus:ring-sky-400',
								]"
							/>
							<ErrorText :show="!!fieldErrors.title">
								{{ fieldErrors.title }}
							</ErrorText>
						</div>

						<!-- Author -->
						<div class="flex flex-col justify-start">
							<Label for="author" required :error="!!fieldErrors.author">
								Autor
							</Label>
							<input
								class="primary-input"
								id="author"
								type="text"
								v-model.trim="form.author"
								@input="clearFieldError('author')"
								placeholder="Nome do autor"
								:class="[
									fieldErrors.author
										? 'border-2 border-red-500 focus:ring-red-400'
										: 'border border-gray-300 focus:ring-sky-400',
								]"
							/>
							<ErrorText :show="!!fieldErrors.author">
								{{ fieldErrors.author }}
							</ErrorText>
						</div>

						<!-- Additional Authors -->
						<div class="flex flex-col justify-start">
							<Label for="additional_authors"> Autores Adicionais </Label>
							<input
								class="primary-input"
								id="additional_authors"
								type="text"
								v-model.trim="form.additional_authors"
								placeholder="Co-autores (separados por vírgula)"
							/>
						</div>

						<!-- Number of Pages -->
						<div class="flex flex-col justify-start">
							<Label for="number_of_pages"> Número de Páginas </Label>
							<input
								class="primary-input"
								id="number_of_pages"
								type="number"
								v-model.number="form.number_of_pages"
								min="1"
								max="99999"
								placeholder="Ex: 256"
							/>
						</div>

						<!-- Publication Year -->
						<div class="flex flex-col justify-start">
							<Label for="publication_year"> Ano de Publicação </Label>
							<input
								class="primary-input"
								id="publication_year"
								type="number"
								v-model.number="form.publication_year"
								min="1"
								max="9999"
								placeholder="Ex: 2024"
							/>
						</div>

						<!-- Publisher -->
						<div class="flex flex-col justify-start">
							<Label for="publisher"> Editora </Label>
							<input
								class="primary-input"
								id="publisher"
								type="text"
								v-model.trim="form.publisher"
								placeholder="Nome da editora"
							/>
						</div>

						<!-- ISBN-13 -->
						<div class="flex flex-col justify-start">
							<Label for="isbn13"> ISBN-13 </Label>
							<input
								class="primary-input"
								id="isbn13"
								type="text"
								v-model.trim="form.isbn13"
								placeholder="ISBN-13"
								maxlength="17"
							/>
						</div>

						<!-- Read Count -->
						<div class="flex flex-col justify-start">
							<Label for="read_count" :error="!!fieldErrors.read_count">
								Quantas vezes leu
							</Label>
							<input
								class="primary-input"
								id="read_count"
								type="number"
								v-model.number="form.read_count"
								@input="clearFieldError('read_count')"
								min="0"
								max="32767"
								placeholder="Ex: 1"
								:class="[
									fieldErrors.read_count
										? 'border-2 border-red-500 focus:ring-red-400'
										: 'border border-gray-300 focus:ring-sky-400',
								]"
							/>
							<ErrorText :show="!!fieldErrors.read_count">
								{{ fieldErrors.read_count }}
							</ErrorText>
						</div>

						<!-- Start Date -->
						<div class="flex flex-col justify-start">
							<Label for="start_date"> Data de Início da Leitura </Label>
							<input
								class="primary-input"
								id="start_date"
								type="date"
								v-model="form.start_date"
							/>
						</div>

						<!-- Finish Date -->
						<div class="flex flex-col justify-start">
							<Label for="finish_date"> Data de Término da Leitura </Label>
							<input
								class="primary-input"
								id="finish_date"
								type="date"
								v-model="form.finish_date"
							/>
						</div>

						<!-- Reading Status -->
						<div class="flex flex-col justify-start">
							<Label for="reading_status"> Status de Leitura </Label>
							<select
								id="reading_status"
								v-model="form.reading_status"
								class="primary-input"
							>
								<option value="tbr">📚 Quero Ler</option>
								<option value="currently-reading">📖 Lendo</option>
								<option value="read">✅ Lido</option>
								<option value="abandonado">❌ Abandonado</option>
							</select>
						</div>

						<!-- My Rating -->
						<div class="flex flex-col justify-start">
							<Label for="my_rating"> Minha Avaliação </Label>
							<select
								id="my_rating"
								v-model="form.my_rating"
								class="primary-input"
							>
								<option value="">Não avaliado</option>
								<option value="1">⭐ 1 estrela</option>
								<option value="2">⭐⭐ 2 estrelas</option>
								<option value="3">⭐⭐⭐ 3 estrelas</option>
								<option value="4">⭐⭐⭐⭐ 4 estrelas</option>
								<option value="5">⭐⭐⭐⭐⭐ 5 estrelas</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-center gap-3 mt-6 pt-4">
					<button
						type="button"
						@click="close"
						class="btn-secundary flex-2 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						:disabled="isSubmitting"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="btn-primary flex-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
