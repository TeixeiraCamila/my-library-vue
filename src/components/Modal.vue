<!-- components/Modal.vue -->
<script setup>
import { ref } from 'vue';
import { useModal } from '../composables/useModal';

const { close, mode, editingBook } = useModal();

const title = ref(editingBook.value ? editingBook.value.Title || '' : '');
const author = ref(editingBook.value ? editingBook.value.Author || '' : '');

const additionalAuthors = ref(
	editingBook.value ? editingBook.value['Additional Authors'] || '' : ''
);
const isbn = ref(editingBook.value ? editingBook.value.ISBN || '' : '');
const isbn13 = ref(editingBook.value ? editingBook.value.ISBN13 || '' : '');
const myRating = ref(
	editingBook.value ? editingBook.value['My Rating'] || '' : ''
);
const publisher = ref(
	editingBook.value ? editingBook.value.Publisher || '' : ''
);
const numberOfPages = ref(
	editingBook.value ? editingBook.value['Number of Pages'] || '' : ''
);
const originalPublicationYear = ref(
	editingBook.value
		? editingBook.value['Original Publication Y'] ||
				editingBook.value['Original Publication Year'] ||
				''
		: ''
);

const bookshelves = ref(
	editingBook.value ? editingBook.value.Bookshelves || '' : ''
);

const exclusiveShelf = ref(
	editingBook.value ? editingBook.value['Exclusive Shelf'] || '' : ''
);
const myReview = ref(
	editingBook.value ? editingBook.value['My Review'] || '' : ''
);

const readCount = ref(
	editingBook.value ? editingBook.value['Read Count'] || 0 : 0
);
const ownedCopies = ref(
	editingBook.value ? editingBook.value['Owned Copies'] || 0 : 0
);
const dataDeInicio = ref(
	editingBook.value ? editingBook.value['Data de inicio'] || '' : ''
);
const dataDeTermino = ref(
	editingBook.value ? editingBook.value['Data de término'] || '' : ''
);

const handleBackdropClick = (event) => {
	// Fecha o modal se clicar fora do conteúdo
	if (event.target === event.currentTarget) {
		close();
	}
};

const handleSubmit = () => {
	// Reunir os dados em um objeto — mapeando para os nomes das colunas originais quando aplicável
	const payload = {
		Title: title.value,
		Author: author.value,
		['Additional Authors']: additionalAuthors.value,
		ISBN: isbn.value,
		ISBN13: isbn13.value,
		['My Rating']: myRating.value,
		Publisher: publisher.value,
		['Number of Pages']: numberOfPages.value,
		['Original Publication Year']: originalPublicationYear.value,
		Bookshelves: bookshelves.value,
		['Exclusive Shelf']: exclusiveShelf.value,
		['My Review']: myReview.value,
		['Read Count']: readCount.value,
		['Owned Copies']: ownedCopies.value,
		['Data de inicio']: dataDeInicio.value,
		['Data de término']: dataDeTermino.value,
	};

	// Do not send book_id when creating a new book so the DB can auto-generate it.
	// If editing an existing book, include its book_id (from editingBook).
	if (editingBook.value && editingBook.value.book_id) {
		payload.book_id = editingBook.value.book_id;
	}

	console.log('Saving book payload:', payload);
	// Aqui você pode chamar a store ou API para salvar/atualizar
	// close();
};
</script>

<template>
	<div
		class="fixed inset-0 bg-black/30 backdrop-invert backdrop-opacity-10 flex items-center justify-center z-50"
		@click="handleBackdropClick"
	>
		<div class="modal bg-white rounded-lg p-6 mx-4">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-bold">
					{{ mode === 'add' ? 'Add Book' : 'Edit Book' }}
				</h2>
				<button @click="close" class="text-gray-500 hover:text-gray-700">
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
				<div class="space-y-4 max-h-[60vh] overflow-auto">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<label class="flex flex-col">
							<span>Título</span>
							<input
								type="text"
								v-model="title"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							<span>Autor</span>
							<input
								type="text"
								v-model="author"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Additional Authors
							<input
								type="text"
								v-model="additionalAuthors"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							ISBN
							<input
								type="text"
								v-model="isbn"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							ISBN13
							<input
								type="text"
								v-model="isbn13"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							My Rating
							<input
								type="number"
								v-model="myRating"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Publisher
							<input
								type="text"
								v-model="publisher"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							Number of Pages
							<input
								type="number"
								v-model="numberOfPages"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Original Publication Year
							<input
								type="text"
								v-model="originalPublicationYear"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>

						<label class="flex flex-col">
							Bookshelves
							<input
								type="text"
								v-model="bookshelves"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Exclusive Shelf
							<select
								v-model="exclusiveShelf"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							>
								<option value="">—</option>
								<option value="tbr">📚 Para Ler</option>
								<option value="currently-reading">📖 Lendo</option>
								<option value="read">✅ Lido</option>
							</select>
						</label>
						<label class="flex flex-col">
							Read Count
							<input
								type="number"
								v-model="readCount"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Owned Copies
							<input
								type="number"
								v-model="ownedCopies"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Data de início
							<input
								type="date"
								v-model="dataDeInicio"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
						<label class="flex flex-col">
							Data de término
							<input
								type="date"
								v-model="dataDeTermino"
								class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</label>
					</div>

					<div class="mt-3 flex flex-col">
						<label class="block mb-1 font-medium">My Review</label>
						<select
							v-model="myReview"
							class="primaty-input py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
						>
							<option value="">—</option>
							<option value="0">0</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</select>
					</div>
				</div>

				<div class="flex gap-2 mt-6">
					<button
						type="button"
						@click="close"
						class="btn-secundary flex-1 px-4 py-2 rounded"
					>
						Cancel
					</button>
					<button type="submit" class="btn-primary flex-1 px-4 py-2 rounded">
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
<style scoped>
.modal {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 #fff3d9;
}
.btn-primary:hover:not(:disabled) {
	transform: translateY(0);
}
label {
	align-items: flex-start;
}
</style>
