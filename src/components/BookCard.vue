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
		read: '✅',
		'currently-reading': '📖',
		'to-read': '📚',
		abandonado: '❌',
	};

	return emojiMap[shelf] || ' ';
});

</script>

<template>
	<div
		class="book-card w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 bg-white p-4 shadow-lg rounded-lg flex flex-col"
		:class="`shelf-${book.reading_status}`"
		:id="book.book_id"
	>
		<div
			v-if="book.reading_status"
			class="book-shelf-badge absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-xl shadow-md"
			:title="`Prateleira: ${book.reading_status}`"
		>
			{{ shelfEmoji }}
		</div>

		<div class="book-content flex flex-col items-center gap-2">
      <BookCover :book="book" :size="medium"/>
			
			<div class="book-info">
				<h2 class="text-lg font-semibold text-center">{{ book.title }}</h2>
				<p class="text-sm text-gray-600 text-center">by {{ book.author }}</p>
			</div>
			<div class="book-rating flex flex-col items-center gap-2">
				<span v-if="book.my_rating && book.my_rating !== '0'">
					{{ '⭐'.repeat(Math.round(book.my_rating)) }}
				</span>

				<span v-if="book.finish_date" class="text-xs text-gray-500">
					📅 {{ formatDate(book.start_date) }} -
					{{ formatDate(book.finish_date) }}
				</span>
			</div>
		</div>
		<ActionsButtons :book="book" />
	</div>
</template>

<style scoped>
.book-card {
	background: var(--panel);
	border-radius: 18px;
	padding: 16px;
	box-shadow: var(--shadow);
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: center;
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

.book-shelf-badge,
.book-additional-shelves {
	font-size: 11px;
	font-weight: 600;
	z-index: 10;
	white-space: nowrap;
}

.book-shelf-badge {
	background: white;
}

.book-additional-shelves {
	background: #eff6ff;
	color: #1e40af;
}

.book-info {
	min-height: 77px;
	width: 100%;
}

.book-shelves-list summary {
	list-style: none;
}

.book-shelves-list summary::-webkit-details-marker {
	display: none;
}
</style>
