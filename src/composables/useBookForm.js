// composables/useBookForm.js

import { ref } from 'vue';

export function useBookForm(initialData = null) {
	const form = ref({
		title: '',
		author: '',
		additional_authors: '',
		publisher: '',
		isbn: '',
		isbn13: '',
		binding: '',
		number_of_pages: null, // int4
		publication_year: null, // int4
		book_bookshelves: [],
		reading_status: 'tbr',
		my_rating: '',
		my_review: '',
		read_count: null, // int2
		owned_copies: false,
		start_date: null,
		finish_date: null,
	});

	const setForm = (data = {}) => {
		if (!data) return;
		form.value = {
			title: data.title || '',
			author: data.author || '',
			additional_authors: data.additional_authors || '',
			publisher: data.publisher || '',
			isbn: data.isbn || '',
			isbn13: data.isbn13 || '',
			binding: data.binding || '',
			number_of_pages: data.number_of_pages || null,
			publication_year: data.publication_year || null,
			book_bookshelves: data.book_bookshelves || [],
			reading_status: data.reading_status || 'tbr',
			my_rating: data.my_rating || '',
			my_review: data.my_review || '',
			read_count: data.read_count || null,
			owned_copies: data.owned_copies || false,
			start_date: data.start_date || null,
			finish_date: data.finish_date || null,
		};
	};

	const resetForm = () => {
		form.value = {
			title: '',
			author: '',
			additional_authors: '',
			publisher: '',
			isbn: '',
			isbn13: '',
			binding: '',
			number_of_pages: null,
			publication_year: null,
			book_bookshelves: [],
			reading_status: 'tbr',
			my_rating: '',
			my_review: '',
			read_count: null,
			owned_copies: false,
			start_date: null,
			finish_date: null,
		};
	};

	const buildPayload = () => {
		const payload = { ...form.value };

		// Normalizar ISBNs: remover todos os espaços em branco
		if (
			payload.isbn !== undefined &&
			payload.isbn !== null &&
			payload.isbn !== ''
		) {
			const originalIsbn = payload.isbn;
			payload.isbn = String(payload.isbn).replace(/\s+/g, '');
			console.log('🔎 ISBN:', {
				original: originalIsbn,
				cleaned: payload.isbn,
			});
		}

		if (
			payload.isbn13 !== undefined &&
			payload.isbn13 !== null &&
			payload.isbn13 !== ''
		) {
			const originalIsbn13 = payload.isbn13;
			payload.isbn13 = String(payload.isbn13).replace(/\s+/g, '');
			console.log('🔎 ISBN13:', {
				original: originalIsbn13,
				cleaned: payload.isbn13,
			});
		}

		// Converter number_of_pages para int4 (integer: -2,147,483,648 a 2,147,483,647)
		if (payload.number_of_pages !== null && payload.number_of_pages !== '') {
			const originalValue = payload.number_of_pages;
			payload.number_of_pages = parseInt(payload.number_of_pages);
			console.log('📏 Páginas:', {
				original: originalValue,
				converted: payload.number_of_pages,
				type: typeof payload.number_of_pages,
			});

			// Validar se é um número válido
			if (isNaN(payload.number_of_pages)) {
				console.warn('⚠️ number_of_pages não é um número válido');
				payload.number_of_pages = null;
			}
		}

		// Converter publication_year para int4 (integer)
		if (payload.publication_year !== null && payload.publication_year !== '') {
			const originalValue = payload.publication_year;
			payload.publication_year = parseInt(payload.publication_year);
			console.log('📅 Ano:', {
				original: originalValue,
				converted: payload.publication_year,
				type: typeof payload.publication_year,
			});

			// Validar se é um número válido
			if (isNaN(payload.publication_year)) {
				console.warn('⚠️ publication_year não é um número válido');
				payload.publication_year = null;
			}
		}

		// Converter read_count para int2 (smallint: -32,768 a 32,767)
		if (payload.read_count !== null && payload.read_count !== '') {
			const originalValue = payload.read_count;
			payload.read_count = parseInt(payload.read_count);
			console.log('📚 Leituras:', {
				original: originalValue,
				converted: payload.read_count,
				type: typeof payload.read_count,
			});

			// Validar limite int2
			if (payload.read_count < -32768 || payload.read_count > 32767) {
				console.warn(
					'⚠️ read_count ultrapassa o limite de int2 (smallint):',
					payload.read_count
				);
			}

			if (isNaN(payload.read_count)) {
				console.warn('⚠️ read_count não é um número válido');
				payload.read_count = null;
			}
		}

		// Garantir que my_rating seja string (varchar no DB)
		if (payload.my_rating) {
			payload.my_rating = String(payload.my_rating);
			console.log('⭐ Avaliação:', {
				value: payload.my_rating,
				type: typeof payload.my_rating,
			});
		}

		// Garantir que owned_copies seja boolean
		if (typeof payload.owned_copies !== 'boolean') {
			payload.owned_copies = Boolean(payload.owned_copies);
		}

		// Garantir formato de data correto (date no DB)
		if (payload.start_date && typeof payload.start_date === 'string') {
			console.log('📆 Data início:', payload.start_date);
		}

		if (payload.finish_date && typeof payload.finish_date === 'string') {
			console.log('📆 Data fim:', payload.finish_date);
		}

		// Garantir que book_bookshelves seja sempre um array (mesmo que vazio)
		if (!Array.isArray(payload.book_bookshelves)) {
			payload.book_bookshelves = [];
		}

		// Remove campos vazios para não sobrescrever dados
		// IMPORTANTE: NÃO remover book_bookshelves mesmo se vazio
		Object.keys(payload).forEach((key) => {
			// Mantém book_bookshelves mesmo se vazio (array)
			if (key === 'book_bookshelves') return;
			
			// Mantém owned_copies mesmo se false (boolean)
			if (key === 'owned_copies') return;
			
			// Remove outros campos vazios
			if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
				delete payload[key];
			}
		});

		return payload;
	};

	if (initialData) setForm(initialData);

	return { form, setForm, resetForm, buildPayload };
}