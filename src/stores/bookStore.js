import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export const useBookStore = defineStore('books', () => {
	// State
	const books = ref([]);
	const loading = ref(false);
	const error = ref(null);

	// Pagination state
	const currentPage = ref(1);
	const perPage = ref(16);
	const total = ref(0);

	//Estantes
	const bookshelves = ref([]);

	// Actions
	async function enrichBooksWithShelves(booksData) {
		if (!booksData || booksData.length === 0) return [];

		const bookIds = booksData.map((b) => b.book_id);

		const { data: relations } = await supabase
			.from('book_bookshelves')
			.select('id, book_id, bookshelf_id')
			.in('book_id', bookIds);

		const shelfIds = [...new Set(relations?.map((r) => r.bookshelf_id) || [])];

		const { data: shelves } = await supabase
			.from('bookshelves')
			.select('id, shelve')
			.in('id', shelfIds);

		return booksData.map((book) => {
			const bookRelations =
				relations?.filter((r) => r.book_id === book.book_id) || [];

			const book_bookshelves = bookRelations.map((rel) => ({
				id: rel.id,
				bookshelf_id: rel.bookshelf_id,
				bookshelves: shelves?.find((s) => s.id === rel.bookshelf_id) || null,
			}));

			return { ...book, book_bookshelves };
		});
	}

	async function fetchBookshelves() {
		try {
			const { data, error: supabaseError } = await supabase
				.from('bookshelves')
				.select('id, shelve')
				.order('shelve');

			if (supabaseError) throw supabaseError;
			bookshelves.value = data || [];
			console.log('✅ Estantes carregadas:', bookshelves.value);
		} catch (err) {
			console.error('❌ Erro ao carregar estantes:', err);
		}
	}

	async function fetchBooks(page = 1, pageSize = perPage.value) {
		loading.value = true;
		error.value = null;

		page = Number(page) || 1;
		pageSize = Number(pageSize) || perPage.value;

		try {
			const from = (page - 1) * pageSize;
			const to = page * pageSize - 1;

			const {
				data: booksData,
				error: booksError,
				count,
			} = await supabase
				.from('my-books')
				.select('*', { count: 'exact' })
				.range(from, to);

			if (booksError) throw booksError;

			books.value = booksData;
			total.value = count || 0;
			currentPage.value = page;
			perPage.value = pageSize;

			console.log('✅ Livros carregados:', books.value);
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro:', err);
		} finally {
			loading.value = false;
		}
	}

	async function filterBooks(search, field) {
		loading.value = true;
		error.value = null;
		try {
			const { data: booksData, error: supabaseError } = await supabase
				.from('my-books')
				.select('*')
				.or(`${field}.ilike.%${search}%`);

			if (supabaseError) throw supabaseError;

			books.value = booksData;
			console.log('✅ Livros encontrados:', books.value);
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro:', err);
		} finally {
			loading.value = false;
		}
	}

	async function searchBook(search) {
		loading.value = true;
		error.value = null;
		try {
			const { data: booksData, error: supabaseError } = await supabase
				.from('my-books')
				.select('*')
				.or(
					`Title.ilike.%${search}%,Author.ilike.%${search}%,ISBN.ilike.%${search}%,ISBN13.ilike.%${search}%`
				);

			if (supabaseError) throw supabaseError;

			books.value = booksData;
			console.log('✅ Livros encontrados:', books.value);
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro:', err);
		} finally {
			loading.value = false;
		}
	}

	async function addBook(newBook, selectedBookshelfIds = []) {
		loading.value = true;
		error.value = null;

		try {
			const { data, error: supabaseError } = await supabase
				.from('my-books')
				.insert([newBook])
				.select()
				.single();

			if (supabaseError) throw supabaseError;

			// relacionamentos com estantes
			if (selectedBookshelfIds.length > 0) {
				const relations = selectedBookshelfIds.map((shelfId) => ({
					book_id: data.book_id,
					bookshelf_id: shelfId,
				}));

				const { error: relError } = await supabase
					.from('book_bookshelves')
					.insert(relations);

				if (relError) {
					console.error('❌ Erro ao salvar estantes:', relError);
				}
			}

			books.value.unshift(data[0]);
			console.log('✅ Livro adicionado:', data[0]);

			return data[0];
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro ao adicionar livro:', err);
			throw err;
		} finally {
			loading.value = false;
		}
	}

	async function updateBook(bookId, updates, selectedBookshelfIds = []) {
		loading.value = true;
		error.value = null;

		try {
			const { data, error: supabaseError } = await supabase
				.from('my-books')
				.update(updates)
				.eq('book_id', bookId)
				.select()
				.single();

			if (supabaseError) throw supabaseError;

			//Atualizar estantes
			// Remover estantes antigas
			await supabase.from('book_bookshelves').delete().eq('book_id', bookId);

			// Adicionar novas estantes
			if (selectedBookshelfIds.length > 0) {
				const relations = selectedBookshelfIds.map((shelfId) => ({
					book_id: bookId,
					bookshelf_id: shelfId,
				}));

				await supabase.from('book_bookshelves').insert(relations);
			}

			const index = books.value.findIndex((book) => book.book_id === bookId);
			if (index !== -1) {
				books.value[index] = data;
			}

			console.log('✅ Livro atualizado:', data[0]);
			return data[0];
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro ao atualizar livro:', err);
			throw err;
		} finally {
			loading.value = false;
		}
	}

	async function deleteBook(id) {
		loading.value = true;
		error.value = null;

		try {
			const { error: supabaseError } = await supabase
				.from('my-books')
				.delete()
				.eq('book_id', id);

			if (supabaseError) throw supabaseError;

			books.value = books.value.filter((book) => book.id !== id);
			console.log('✅ Livro deletado:', id);
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro ao deletar livro:', err);
			throw err;
		} finally {
			loading.value = false;
		}
	}

	return {
		books,
		loading,
		error,
		currentPage,
		perPage,
		total,
		// Gatters
		pagesCount: computed(() =>
			perPage.value ? Math.ceil(total.value / perPage.value) : 0
		),
		next_page: computed(() =>
			currentPage.value <
			(perPage.value ? Math.ceil(total.value / perPage.value) : 0)
				? currentPage.value + 1
				: null
		),
		prev_page: computed(() =>
			currentPage.value > 1 ? currentPage.value - 1 : null
		),

		fetchBookshelves,
		fetchBooks,
		filterBooks,
		searchBook,
		addBook,
		updateBook,
		deleteBook,
	};
});
