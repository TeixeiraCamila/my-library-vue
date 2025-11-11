// ../store/bookStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';

export const useBookStore = defineStore('books', () => {
	const authStore = useAuthStore();

	const books = ref([]);
	const booksOldOrder = ref([]);
	const loading = ref(false);
	const error = ref(null);
	const currentPage = ref(1);
	const perPage = ref(16);
	const total = ref(0);
	const bookshelves = ref([]);

	// Enriquece livros com suas estantes
	async function enrichBooksWithShelves(books) {
		if (!books?.length) return books;

		const bookIds = books.map((book) => book.book_id);

		try {
			const { data: relations, error: relError } = await supabase
				.from('book_shelves')
				.select('book_id, shelf_id')
				.in('book_id', bookIds);

			if (relError) throw relError;

			return books.map((book) => ({
				...book,
				book_bookshelves:
					relations
						?.filter((rel) => rel.book_id === book.book_id)
						?.map((rel) => rel.shelf_id) || [],
			}));
		} catch (err) {
			console.error('[enrichBooksWithShelves] Erro:', err);
			return books;
		}
	}

	function orderBooks(books = []) {
		// Safety: expect a plain array. Return a new array with any
		// "currently-reading" item moved to the front.
		if (!Array.isArray(books) || books.length === 0) return [];

		booksOldOrder.value = [...books];

		const idx = books.findIndex((b) => b && b.reading_status === 'currently-reading');

		if (idx > -1) {
			const [current] = books.splice(idx, 1);
			books.unshift(current);
		}

		return books;
	}

	// Buscar livros
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
				.range(from, to)
				.order('date_added', { ascending: false });

			if (booksError) throw booksError;

			books.value = (await enrichBooksWithShelves(booksData)) || [];
			booksOldOrder.value = (await orderBooks(books.value)) || [];
			total.value = count || 0;
			currentPage.value = page;
			perPage.value = pageSize;

			console.log('✅ Livros carregados:', books.value.length);
		} catch (err) {
			error.value = 'Não foi possível carregar os livros.';
			console.error('[fetchBooks] Erro:', err);
		} finally {
			loading.value = false;
		}
	}

	// Buscar estantes
	async function fetchBookshelves() {
		try {
			const { data, error: supabaseError } = await supabase
				.from('bookshelves')
				.select('id, shelve')
				.order('shelve');

			if (supabaseError) throw supabaseError;
			bookshelves.value = data || [];
			console.log('✅ Estantes carregadas:', bookshelves.value.length);
		} catch (err) {
			console.error('[fetchBookshelves] Erro:', err);
		}
	}

	// Buscar livro
	async function searchBook(search) {
		loading.value = true;
		error.value = null;
		try {
			const { data: booksData, error: supabaseError } = await supabase
				.from('my-books')
				.select('*')
				.or(
					`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%,isbn13.ilike.%${search}%`
				);

			if (supabaseError) throw supabaseError;
			books.value = (await enrichBooksWithShelves(booksData)) || [];
			console.log('✅ Livros encontrados:', books.value.length);
		} catch (err) {
			error.value = 'Não foi possível buscar livros.';
			console.error('[searchBook] Erro:', err);
		} finally {
			loading.value = false;
		}
	}

	// Adicionar livro e vincular shelves
	async function addBook(newBook) {
		console.log('🎯 [addBook] Iniciando');

		if (!authStore.canCreate) {
			throw new Error('Você não tem permissão para adicionar livros');
		}

		loading.value = true;
		error.value = null;

		try {
			// Extrai prateleiras antes de inserir o livro
			const shelves = Array.isArray(newBook.book_bookshelves)
				? newBook.book_bookshelves
				: [];

			// Remove book_bookshelves do objeto antes de inserir
			const bookToInsert = { ...newBook };
			delete bookToInsert.book_bookshelves;

			console.log('📤 [addBook] Inserindo:', bookToInsert);

			// 1️⃣ Insere o livro
			const { data: inserted, error: insertErr } = await supabase
				.from('my-books')
				.insert([bookToInsert])
				.select('book_id')
				.single();

			if (insertErr) {
				console.error('❌ [addBook] Erro ao inserir:', insertErr);
				throw insertErr;
			}

			const bookId = inserted.book_id;
			console.log('✅ [addBook] Livro inserido:', bookId);

			// 2️⃣ Relaciona as prateleiras (se houver)
			if (shelves.length > 0) {
				const shelfLinks = shelves.map((shelfId) => ({
					book_id: bookId,
					shelf_id: shelfId,
				}));

				const { error: relErr } = await supabase
					.from('book_shelves')
					.insert(shelfLinks);

				if (relErr) {
					console.error('❌ [addBook] Erro ao vincular shelves:', relErr);
					throw relErr;
				}
				console.log('✅ [addBook] Shelves vinculadas');
			}

			// 3️⃣ Recarrega os livros
			await fetchBooks(currentPage.value);
			console.log('✅ [addBook] Concluído');

			return inserted;
		} catch (err) {
			error.value = 'Não foi possível adicionar o livro.';
			console.error('[addBook] Erro:', {
				message: err?.message,
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
			});
			throw err;
		} finally {
			loading.value = false;
		}
	}

	// Atualizar livro
	async function updateBook(bookId, updates) {
		console.log('✏️ [updateBook] Iniciando');

		if (!authStore.canEdit) {
			throw new Error('Você não tem permissão para editar livros');
		}

		loading.value = true;
		error.value = null;

		try {
			// Extrai prateleiras (se vierem)
			const shelves = updates.book_bookshelves
				? Array.isArray(updates.book_bookshelves)
					? updates.book_bookshelves
					: [updates.book_bookshelves]
				: [];

			// Remove book_bookshelves do payload de atualização
			const bookUpdates = { ...updates };
			delete bookUpdates.book_bookshelves;

			console.log('📤 [updateBook] Atualizando:', bookUpdates);

			// 1️⃣ Atualiza o livro
			const { data, error: supabaseError } = await supabase
				.from('my-books')
				.update(bookUpdates)
				.eq('book_id', bookId)
				.select()
				.single();

			if (supabaseError) {
				console.error('❌ [updateBook] Erro ao atualizar:', supabaseError);
				throw supabaseError;
			}

			console.log('✅ [updateBook] Livro atualizado');

			// 2️⃣ Atualiza as prateleiras
			// Remove vínculos antigos
			const { error: deleteError } = await supabase
				.from('book_shelves')
				.delete()
				.eq('book_id', bookId);

			if (deleteError) {
				console.error('❌ [updateBook] Erro ao deletar vínculos:', deleteError);
			}

			// Adiciona novos vínculos
			if (shelves.length > 0) {
				const shelfLinks = shelves.map((shelfId) => ({
					book_id: bookId,
					shelf_id: parseInt(shelfId),
				}));

				const { error: relErr } = await supabase
					.from('book_shelves')
					.insert(shelfLinks);

				if (relErr) {
					console.error('❌ [updateBook] Erro ao vincular shelves:', relErr);
					throw relErr;
				}
				console.log('✅ [updateBook] Shelves atualizadas');
			}

			// 3️⃣ Atualiza livro no array local
			const index = books.value.findIndex((book) => book.book_id === bookId);
			if (index !== -1) {
				books.value[index] = {
					...data,
					book_bookshelves: shelves,
				};
			}

			// 4️⃣ Recarrega os livros
			await fetchBooks(currentPage.value);
			console.log('✅ [updateBook] Concluído');

			return data;
		} catch (err) {
			error.value = 'Não foi possível atualizar o livro.';
			console.error('[updateBook] Erro:', {
				message: err?.message,
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
			});
			throw err;
		} finally {
			loading.value = false;
		}
	}

	// Deletar livro
	async function deleteBook(id) {
		if (!authStore.canDelete) {
			throw new Error('Você não tem permissão para deletar livros');
		}

		loading.value = true;
		error.value = null;

		try {
			const { error: supabaseError } = await supabase
				.from('my-books')
				.delete()
				.eq('book_id', id);

			if (supabaseError) throw supabaseError;

			books.value = books.value.filter((book) => book.book_id !== id);
			console.log('✅ Livro deletado:', id);
			await fetchBooks(currentPage.value);
		} catch (err) {
			error.value = 'Não foi possível deletar o livro.';
			console.error('[deleteBook] Erro:', err);
			throw err;
		} finally {
			loading.value = false;
		}
	}

	return {
		books,
		booksOldOrder,
		loading,
		error,
		currentPage,
		perPage,
		total,
		bookshelves,
		pagesCount: computed(() =>
			perPage.value ? Math.ceil(total.value / perPage.value) : 0
		),
		next_page: computed(() =>
			currentPage.value < Math.ceil(total.value / perPage.value)
				? currentPage.value + 1
				: null
		),
		prev_page: computed(() =>
			currentPage.value > 1 ? currentPage.value - 1 : null
		),
		fetchBooks,
		fetchBookshelves,
		searchBook,
		addBook,
		updateBook,
		deleteBook,
	};
});
