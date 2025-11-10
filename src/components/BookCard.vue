<script setup>
import { computed } from 'vue';
import { useDate } from '../composables/useData';
import ActionsButtons from './ActionsButtons.vue';
import BookCover from './BookCover.vue';
const props = defineProps({
	book: Object,
});

const { formatDate } = useDate();

// tbr === to-read
const normalizedShelf = computed(() => {
	const shelf = props.book.reading_status?.toLowerCase();
	if (!shelf) return '';

	if (shelf === 'to-read' || shelf === 'tbr') return 'to-read';

	return shelf;
});

const shelfEmoji = computed(() => {
	const shelf = normalizedShelf.value;

	const emojiMap = {
		read: '✅ Read',
		'currently-reading': '📖 Currently Reading',
		'to-read': '📚 In my TBR',
		abandonado: '❌ Abandonado',
	};

	return emojiMap[shelf] || ' ';
});
</script>

<template>
	<div
		class="book-card bg-white p-4 rounded-lg transform transition-transform duration-150 ease-out"
		:class="`shelf-${book.reading_status}`"
		:id="book.book_id"
		role="article"
		tabindex="0"
	>
		<div
			v-if="book.reading_status"
			class="book-shelf-badge group/badge absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-full shadow ring-1 ring-sky-100 flex items-center gap-2"
		>
			<span aria-hidden="true">{{ shelfEmoji }}</span>
			<span class="sr-only peer">Prateleira: {{ book.reading_status }}</span>
		</div>

		<div class="flex flex-col flex-grow w-full">
			<div class="book-content flex-grow flex flex-col items-center gap-2">
				<BookCover :book="book" :size="medium" />
				<!-- <img
					src="https://placehold.co/160x220"
					:alt="`Capa do livro ${book.title}`"
					class="w-28 h-40 object-cover rounded-md shadow-sm"
				/> -->
				<div class="book-info">
					<h2
						id="{{ book.book_id }}-title"
						class="text-base font-semibold text-center text-gray-800 leading-tight"
					>
						{{ book.title }}
					</h2>
					<p class="text-sm text-gray-500 text-center mt-1">
						by {{ book.author }}
					</p>
				</div>
				<div class="book-rating flex flex-col items-center gap-2">
					<span
						v-if="book.my_rating && book.my_rating !== '0'"
						class="text-sm "
						aria-label="Avaliação: {{ book.my_rating }}"
					>
						{{ '⭐'.repeat(Math.round(book.my_rating)) }}
					</span>

					<span v-if="book.start_date" class="text-xs text-gray-400">
						📅 {{ formatDate(book.start_date) }} -
						{{ formatDate(book.finish_date) }}
					</span>
				</div>
			</div>
			<div class="w-full mt-auto pt-3">
				<ActionsButtons :book="book" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.book-card {
	transition: transform 0.12s ease;
	position: relative;
}

.shelf-read {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--read);
}

.shelf-currently-reading {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--currently-reading);
}

.shelf-tbr {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--to-be-read);
}

.book-shelf-badge {
	font-size: 14px;
	font-weight: 600;
	z-index: 10;
	white-space: nowrap;
}

.book-info {
	min-height: 72px;
	width: 100%;
}

.book-shelves-list summary {
	list-style: none;
}

.book-shelves-list summary::-webkit-details-marker {
	display: none;
}
</style>
