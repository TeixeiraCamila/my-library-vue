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
		number_of_pages: null,
		publication_year: null,
		book_bookshelves: [], 
		reading_status: 'tbr',
		my_rating: '',
		my_review: '',
		read_count: '',
		owned_copies: false,
		start_date: '',
		finish_date: '',
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
			book_bookshelves: data.book_bookshelves || [], // array com id das shelves
			reading_status: data.reading_status || '',
			my_rating: data.my_rating || '',
			my_review: data.my_review || '',
			read_count: data.read_count || '',
			owned_copies: data.owned_copies || false,
			start_date: data.start_date || '',
			finish_date: data.finish_date || '',
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
			read_count: '',
			owned_copies: false,
			start_date: '',
			finish_date: '',
		};
	};

	const buildPayload = () => {
		const payload = { ...form.value };

		// normalizar ISBNs: remover todos os espaços em branco
		if (payload.isbn !== undefined && payload.isbn !== null) {
			const originalIsbn = payload.isbn;
			payload.isbn = String(payload.isbn).replace(/\s+/g, '');
			console.log('🔎 ISBN:', { original: originalIsbn, cleaned: payload.isbn });
		}
		if (payload.isbn13 !== undefined && payload.isbn13 !== null) {
			const originalIsbn13 = payload.isbn13;
			payload.isbn13 = String(payload.isbn13).replace(/\s+/g, '');
			console.log('🔎 ISBN13:', { original: originalIsbn13, cleaned: payload.isbn13 });
		}

		// remove campos vazios para não sobrescrever dados
		Object.keys(payload).forEach((key) => {
			if (payload[key] === '' || payload[key] === null) {
				delete payload[key];
			}
		});

		// converter para numéricos (int8: -128 a 127, smallint: -32768 a 32767)
		if (payload.number_of_pages) {
			const originalValue = payload.number_of_pages;
			payload.number_of_pages = parseInt(payload.number_of_pages);
			console.log('📏 Páginas:', {
				original: originalValue,
				converted: payload.number_of_pages,
				type: typeof payload.number_of_pages
			});
		}
		
		if (payload.publication_year) {
			const originalValue = payload.publication_year;
			payload.publication_year = parseInt(payload.publication_year);
			console.log('📅 Ano:', {
				original: originalValue,
				converted: payload.publication_year,
				type: typeof payload.publication_year
			});
		}

		if (payload.read_count) {
			const originalValue = payload.read_count;
			payload.read_count = parseInt(payload.read_count);
			console.log('📚 Leituras:', {
				original: originalValue,
				converted: payload.read_count,
				type: typeof payload.read_count
			});
		}

		if (payload.my_rating) {
			console.log('⭐ Avaliação:', {
				value: payload.my_rating,
				type: typeof payload.my_rating
			});
		}

		// Validar limites do int8 (-128 a 127) e smallint (-32768 a 32767)
		const validateInt8 = (value, field) => {
			if (value < -128 || value > 127) {
				console.warn(`⚠️ ${field} ultrapassa o limite de int8:`, value);
			}
		};

		validateInt8(payload.read_count, 'read_count');

		return payload;
	};

	if (initialData) setForm(initialData);

	return { form, setForm, resetForm, buildPayload };
}
