<script setup>
import { onMounted, ref } from 'vue';
import { useBookCover } from '../composables/useBookCover';
const props = defineProps({
	book: {
		type: Object,
		required: true,
	},
	size: {
		type: String,
		default: 'medium', // 'small', 'medium', 'large'
		validator: (value) => ['small', 'medium', 'large'].includes(value),
	},
});
const { fetchCover, loading } = useBookCover();

const coverUrl = ref(null);
const imageError = ref(false);
const loadCover = async () => {
	if (!props.book || coverUrl.value) return;

	// Se já tem cover_url salva no banco
	if (props.book.cover_url) {
		coverUrl.value = props.book.cover_url;
		return;
	}

	// Busca pela API
	const cover = await fetchCover({
		isbn13: props.book.isbn13,
		isbn: props.book.isbn,
		title: props.book.title,
		author: props.book.author,
	});

	if (cover) {
		// Escolhe a melhor qualidade baseada no tamanho
		if (props.size === 'large') {
			coverUrl.value = cover.large || cover.thumbnail;
		} else if (props.size === 'small') {
			coverUrl.value = cover.smallThumbnail || cover.thumbnail;
		} else {
			coverUrl.value = cover.thumbnail;
		}
	}
};

onMounted(async () => {
	loadCover();
});
</script>

<template>
	<div class="book-card">
		<img
			v-if="coverUrl && !imageError"
			:src="coverUrl"
			:alt="`Capa de ${book.title}`"
			class="w-28 h-auto rounded-md shadow-md"
			@error="handleImageError"
		/>
		<img
			v-else
			src="https://placehold.co/80x120"
			:alt="`Capa do livro ${book.title}`"
			class="w-28 h-auto rounded-md shadow-md"
		/>
	</div>
</template>
