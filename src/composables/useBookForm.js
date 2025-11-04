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
		book_bookshelves: [], // array com id das shelves
		reading_status: '',
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
			book_bookshelves: [], // array com id das shelves
			reading_status: '',
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

		// remove campos vazios para não sobrescrever dados
		Object.keys(payload).forEach((key) => {
			if (payload[key] === '' || payload[key] === null) {
				delete payload[key];
			}
		});

		// converter para numéricos
		if (payload.number_of_pages) {
			payload.number_of_pages = parseInt(payload.number_of_pages);
		}
		if (payload.publication_year) {
			payload.publication_year = parseInt(payload.publication_year);
		}

		return payload;
	};

	if (initialData) setForm(initialData);

	return { form, setForm, resetForm, buildPayload };
}
