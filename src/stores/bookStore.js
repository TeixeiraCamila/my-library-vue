// ../store/bookStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';

export const useBookStore = defineStore('books', () => {
	const authStore = useAuthStore();

	const books = ref([]);
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
			console.error('[bookStore][enrichBooksWithShelves] Erro ao carregar estantes dos livros', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
			return books;
		}
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
			total.value = count || 0;
			currentPage.value = page;
			perPage.value = pageSize;

			console.log('✅ Livros carregados:', books.value);
		} catch (err) {
			error.value = 'Não foi possível carregar os livros. Atualize a página e tente novamente.';
			console.error('[bookStore][fetchBooks] Erro ao carregar livros', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
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
			console.log('✅ Estantes carregadas:', bookshelves.value);
		} catch (err) {
			console.error('[bookStore][fetchBookshelves] Erro ao carregar estantes', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
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
			console.log('✅ Livros encontrados:', books.value);
		} catch (err) {
			error.value = 'Não foi possível buscar livros. Tente novamente.';
			console.error('[bookStore][searchBook] Erro ao buscar livros', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
		} finally {
			loading.value = false;
		}
	}

	// Adicionar livro e vincular shelves
	// Adicionar livro e vincular shelves
	async function addBook(newBook) {
		console.log('🎯 [addBook-1] Iniciando addBook');
		console.log('🎯 [addBook-2] canCreate:', authStore.canCreate);

		if (!authStore.canCreate) {
			console.error('[bookStore][addBook] Sem permissão para criar livro', {
				canCreate: authStore.canCreate,
			});
			throw new Error('Você não tem permissão para adicionar livros');
		}

		console.log('🎯 [addBook-4] Permissão OK');
		loading.value = true;
		error.value = null;

		try {
			console.log('🎯 [addBook-5] Recebendo livro:', newBook);

			// Extrai prateleiras antes de inserir o livro
			const shelves = Array.isArray(newBook.book_bookshelves)
				? newBook.book_bookshelves
				: [];

			console.log('🎯 [addBook-6] Shelves extraídas:', shelves);

			// Remove book_bookshelves do objeto antes de inserir
			const bookToInsert = { ...newBook };
			delete bookToInsert.book_bookshelves;

			console.log(
				'🎯 [addBook-7] Livro a inserir (sem shelves):',
				bookToInsert
			);
			console.log('🎯 [addBook-8] Chamando supabase.insert...');

			// 1️⃣ Insere o livro
			const { data: inserted, error: insertErr } = await supabase
				.from('my-books')
				.insert([bookToInsert])
				.select('book_id')
				.single();

			console.log('🎯 [addBook-9] Resposta do supabase:', {
				inserted,
				insertErr,
			});

			if (insertErr) {
				console.error('[bookStore][addBook] Erro na inserção do livro', {
					message: insertErr?.message || String(insertErr),
					details: insertErr?.details,
					hint: insertErr?.hint,
					code: insertErr?.code,
				});
				throw insertErr;
			}

			console.log('🎯 [addBook-12] Inserção OK');
			const bookId = inserted.book_id;
			console.log('🎯 [addBook-13] Book ID:', bookId);

			// 2️⃣ Relaciona as prateleiras (se houver)
			if (shelves.length > 0) {
				console.log('🎯 [addBook-14] Tem shelves para vincular');
				const shelfLinks = shelves.map((shelfId) => ({
					book_id: bookId,
					shelf_id: shelfId,
				}));

				console.log('🎯 [addBook-15] Links a inserir:', shelfLinks);

				const { error: relErr } = await supabase
					.from('book_shelves')
					.insert(shelfLinks);

				console.log('🎯 [addBook-16] Resposta do vínculo:', relErr);

				if (relErr) {
					console.error('[bookStore][addBook] Erro ao vincular shelves', {
						message: relErr?.message || String(relErr),
						details: relErr?.details,
						hint: relErr?.hint,
						code: relErr?.code,
					});
					throw relErr;
				}
				console.log('🎯 [addBook-18] Shelves vinculadas OK');
			} else {
				console.log('🎯 [addBook-14] Nenhuma shelf para vincular');
			}

			console.log('🎯 [addBook-19] Chamando fetchBooks...');
			await fetchBooks(currentPage.value);
			console.log('🎯 [addBook-20] fetchBooks concluído');

			console.log('🎯 [addBook-21] SUCESSO TOTAL - retornando:', inserted);
			return inserted;
		} catch (err) {
			console.error('[bookStore][addBook] Erro ao adicionar livro', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
			error.value = 'Não foi possível adicionar o livro. Tente novamente.';
			throw err;
		} finally {
			console.log('🎯 [addBook-24] Finally - setando loading = false');
			loading.value = false;
			console.log('🎯 [addBook-25] Finally concluído');
		}
	}

	// Atualizar livro
	async function updateBook(bookId, updates) {
		if (!authStore.canEdit) {
			throw new Error('Você não tem permissão para editar livros');
		}

		loading.value = true;
		error.value = null;

		try {
			console.log('📥 Recebendo atualização:', { bookId, updates });

			// Extrai prateleiras (se vierem)
			const shelves = updates.book_bookshelves
				? Array.isArray(updates.book_bookshelves)
					? updates.book_bookshelves
					: [updates.book_bookshelves]
				: [];

			// Remove book_bookshelves do payload de atualização
			const bookUpdates = { ...updates };
			delete bookUpdates.book_bookshelves;

			console.log('📤 Atualizando livro:', bookUpdates);

			// 1️⃣ Atualiza o livro
			const { data, error: supabaseError } = await supabase
				.from('my-books')
				.update(bookUpdates)
				.eq('book_id', bookId)
				.select()
				.single();

			if (supabaseError) {
				console.error('[bookStore][updateBook] Erro ao atualizar livro', {
					message: supabaseError?.message || String(supabaseError),
					details: supabaseError?.details,
					hint: supabaseError?.hint,
					code: supabaseError?.code,
				});
				throw supabaseError;
			}

			console.log('✅ Livro atualizado:', data);

			// 2️⃣ Atualiza as prateleiras
			console.log('🗑️ Removendo vínculos antigos de estantes');
			await supabase.from('book_shelves').delete().eq('book_id', bookId);

			if (shelves.length > 0) {
				const shelfLinks = shelves.map((shelfId) => ({
					book_id: bookId,
					shelf_id: parseInt(shelfId),
				}));

				console.log('📚 Vinculando novas estantes:', shelfLinks);

				const { error: relErr } = await supabase
					.from('book_shelves')
					.insert(shelfLinks);

				if (relErr) {
					console.error('[bookStore][updateBook] Erro ao vincular estantes', {
						message: relErr?.message || String(relErr),
						details: relErr?.details,
						hint: relErr?.hint,
						code: relErr?.code,
					});
					throw relErr;
				}
			}

			// Atualiza livro no array local
			const index = books.value.findIndex((book) => book.book_id === bookId);
			if (index !== -1) {
				books.value[index] = {
					...data,
					book_bookshelves: shelves,
				};
			}

			console.log('✅ Livro atualizado com sucesso');
			await fetchBooks(currentPage.value);
			return data;
		} catch (err) {
			error.value = 'Não foi possível atualizar o livro. Tente novamente.';
			console.error('[bookStore][updateBook] Erro ao atualizar livro (catch)', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
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
			error.value = 'Não foi possível deletar o livro. Tente novamente.';
			console.error('[bookStore][deleteBook] Erro ao deletar livro', {
				message: err?.message || String(err),
				details: err?.details,
				hint: err?.hint,
				code: err?.code,
				stack: err?.stack,
			});
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
