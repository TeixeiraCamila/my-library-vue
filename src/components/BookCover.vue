<script setup>
import { onMounted, ref, computed } from 'vue';
import { useBookCover } from '../composables/useBookCover';

const props = defineProps({
	book: {
		type: Object,
		required: true,
	},
	size: {
		type: String,
		default: 'medium',
		validator: (value) => ['small', 'medium', 'large'].includes(value),
	},
});

const { fetchCover, loading } = useBookCover();
const coverUrl = ref(null);
const imageError = ref(false);

// classes dinâmicas do tailwindcss baseadas no tamanho
const sizeClasses = computed(() => {
	const sizes = {
		small: 'w-20 h-28',
		medium: 'w-32 h-44',
		large: 'w-48 h-64',
	};
	return sizes[props.size] || sizes.medium;
});

const loadCover = async () => {
	if (!props.book || coverUrl.value) return;

	// Se já tem cover_url salva no banco AINDA NÂO DESENVOLVIDA
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
		cover_url: props.book.cover_url,
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

const handleImageError = () => {
	imageError.value = true;
};

onMounted(async () => {
	await loadCover();
});
</script>

<template>
	<div class="relative group">
		<div
			v-if="loading"
			:class="[
				sizeClasses,
				'flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md animate-pulse',
			]"
		>
			<svg
				class="w-8 h-8 text-gray-400 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</div>

		<img
			v-else-if="coverUrl && !imageError"
			:src="coverUrl"
			:alt="`Capa de ${book.title}`"
			:class="[
				sizeClasses,
				'object-cover rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105',
			]"
			@error="handleImageError"
		/>

		<div
			v-else
			:class="[
				sizeClasses,
				'flex flex-col items-center justify-center bg-gradient-to-br from-white to-zinc-200 rounded-lg shadow-md border-2 border-zinc-200',
			]"
		>
			<svg
				class="w-12 h-12 text-zinc-400 mb-2"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				/>
			</svg>
			<span class="text-xs text-zinc-600 font-medium text-center px-2">
				Sem capa
			</span>
		</div>
	</div>
</template>
