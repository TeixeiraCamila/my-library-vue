// composables/useBookCover.js
import { ref } from 'vue';

export function useBookCover() {
	const loading = ref(false);
	const error = ref(null);

	// Busca capa pelo ISBN
	async function fetchCoverByISBN(isbn) {
		if (!isbn) return null;

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
			);
			const data = await response.json();

			if (data.items && data.items.length > 0) {
				const book = data.items[0].volumeInfo;
				return {
					thumbnail: book.imageLinks?.thumbnail || null,
					smallThumbnail: book.imageLinks?.smallThumbnail || null,
					// Versão em alta resolução (remove zoom=1 da URL)
					large:
						book.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=0') || null,
				};
			}
			return null;
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro ao buscar capa:', err);
			return null;
		} finally {
			loading.value = false;
		}
	}

	// Busca capa por título e autor
	async function fetchCoverByTitleAuthor(title, author) {
		if (!title) return null;

		loading.value = true;
		error.value = null;

		try {
			const query = author ? `${title}+inauthor:${author}` : title;
			const response = await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
					query
				)}`
			);
			const data = await response.json();

			if (data.items && data.items.length > 0) {
				const book = data.items[0].volumeInfo;
				return {
					thumbnail: book.imageLinks?.thumbnail || null,
					smallThumbnail: book.imageLinks?.smallThumbnail || null,
					large:
						book.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=0') || null,
				};
			}
			return null;
		} catch (err) {
			error.value = err.message;
			console.error('❌ Erro ao buscar capa:', err);
			return null;
		} finally {
			loading.value = false;
		}
	}

	// Tenta buscar por ISBN primeiro, depois por título/autor
	async function fetchCover(book) {
		if (!book) return null;

		if (book.cover_url) return book.cover_url;

		// Prioriza ISBN-13, depois ISBN-10
		if (book.isbn13) {
			const cover = await fetchCoverByISBN(book.isbn13);
			if (cover) return cover;
		}

		if (book.isbn) {
			const cover = await fetchCoverByISBN(book.isbn);
			if (cover) return cover;
		}

		// Se não encontrou por ISBN, tenta por título/autor
		return await fetchCoverByTitleAuthor(book.title, book.author);
	}

	return {
		loading,
		error,
		fetchCover,
		fetchCoverByISBN,
		fetchCoverByTitleAuthor,
	};
}
