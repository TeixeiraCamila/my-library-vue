<script setup>
import {
	Star,
	SquareCheckBig,
	BookOpen,
	BookCopy,
	X,
	CalendarDays,
} from 'lucide-vue-next';
import { computed } from 'vue';
import { useDate } from '../composables/useData';
import ActionsButtons from './ActionsButtons.vue';
import BookCover from './BookCover.vue';
import Text from './ui/Text.vue';

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

const shelfIcon = computed(() => {
	const shelf = normalizedShelf.value;
	const map = {
		read: SquareCheckBig,
		'currently-reading': BookOpen,
		'to-read': BookCopy,
		abandonado: X,
	};
	return map[shelf] || null;
});

const shelfLabel = computed(() => {
	const shelf = normalizedShelf.value;
	const map = {
		read: 'Read',
		'currently-reading': 'Currently Reading',
		'to-read': 'In my TBR',
		abandonado: 'Abandondao',
	};
	return map[shelf] || 'In my TBR';
});
</script>

<template>
	<div
		class="book-card bg-white p-4 transform transition-transform duration-150 ease-out"
		:class="`shelf-${book.reading_status}`"
		:id="book.book_id"
		role="article"
		tabindex="0"
	>
		<div
			v-if="book.reading_status"
			class="book-shelf-badge group/badge absolute top-2 left-2 from-zinc-200 text-xs px-2 py-1 shadow flex items-center gap-2"
		>
			<span aria-hidden="true" class="inline-flex items-center gap-2">
				<component
					v-if="shelfIcon"
					:is="shelfIcon"
					:size="15"
					color="#6b7280"
					:stroke-width="2.5"
				/>
				<span v-else>{{ shelfEmoji }} </span>
				{{ shelfLabel }}
			</span>
			<span class="sr-only">Prateleira: {{ book.reading_status }}</span>
		</div>

		<div class="flex flex-col flex-grow w-full justify-stretch min-h-full">
			<div class="book-content flex-grow flex flex-col items-center gap-2">
				<BookCover :book="book" :size="medium" />
				<div class="book-info">
					<Text
						id="{{ book.book_id }}-title"
						:as="'h2'"
						:variant="'subheading'"
						:weight="'semibold'"
						:color="`oklch(27.8% 0.033 256.848)`"
						:align="'center'"
					>
						{{ book.title }}
					</Text>
					<Text
						:as="'p'"
						:variant="'caption'"
						:align="'center'"
						:color="'#6a7282'"
					>
						by {{ book.author }}
					</Text>
				</div>
				<div class="book-rating text-base flex flex-col items-center gap-2">
					<span
						v-if="book.my_rating && book.my_rating !== '0'"
						class="flex items-center gap-1"
						:aria-label="`Avaliação: ${book.my_rating}`"
					>
						{{ '⭐'.repeat(Math.round(book.my_rating)) }}
					</span>

					<span
						v-if="book.start_date"
						class="text-sm text-gray-400 flex items-center gap-1"
					>
						<CalendarDays :size="18" color="#6b7280" :stroke-width="2.5" />
						<Text
							:as="'p'"
							:variant="'caption'"
							:align="'center'"
							:color="'#99a1af'"
						>
							{{ formatDate(book.start_date) }} -
							{{ formatDate(book.finish_date) }}
						</Text>
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
	border-radius: var(--border-radius);
}
.shelf-read .book-shelf-badge {
	background-image: linear-gradient(
		to bottom right in oklab,
		oklch(1 0 0) 0%,
		var(--read) 100%
	);
}
.shelf-read {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--read);
}
.shelf-currently-reading .book-shelf-badge {
	background-image: linear-gradient(
		to bottom right in oklab,
		oklch(1 0 0) 0%,
		var(--currently-reading) 100%
	);
}
.shelf-currently-reading {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--currently-reading);
}
.shelf-tbr .book-shelf-badge {
	background-image: linear-gradient(
		to bottom right in oklab,
		oklch(1 0 0) 0%,
		var(--to-be-read) 100%
	);
}
.shelf-tbr {
	box-shadow: 0 0 #000, 0 0 #000, 3px 3px 0 0 var(--to-be-read);
}

.book-shelf-badge {
	font-weight: 600;
	z-index: 10;
	white-space: nowrap;
	border-radius: var(--border-radius);
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
