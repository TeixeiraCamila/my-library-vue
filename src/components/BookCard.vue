<script setup>
import { defineProps } from 'vue';
import { useDate } from '../composables/useData';

import ActionsButtons from './ActionsButtons.vue';

const props = defineProps({
	book: Object,
});

const { formatDate } = useDate();

function formatarShelf(shelf) {
	const shelves = {
		read: '✅',
		'currently-reading': '📖 ',
		tbr: '📋',
		abandonado: '🗙',
	};
	return shelves[shelf] || shelf;
}
</script>

<template>
	<div
		class="book-card relative flex flex-col justify-between"
		:class="`shelf-${book[['Exclusive Shelf']]}`"
    :id="book.book_id"
	>
		<div
			v-if="book[['Exclusive Shelf']]"
			class="book-shelf-badge absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-xl shadow-md"
		>
			{{ formatarShelf(book['Exclusive Shelf']) }}
		</div>
		<div class="book-content flex flex-col items-center gap-2">
			<img
				src="https://placehold.co/80x120"
				:alt="`Capa do livro ${book.Title}`"
				class="w-28 h-auto rounded-md shadow-md"
			/>
			<div class="book-info">
				<h2 class="text-lg font-semibold text-center">{{ book.Title }}</h2>
				<p class="text-sm text-gray-600 text-center">by {{ book.Author }}</p>
			</div>
			<div class="book-rating flex flex-col items-center gap-2">
				<span v-if="book['My Rating'] && book['My Rating'] !== '0'">
					{{ '⭐'.repeat(Math.round(book['My Rating'])) }}
				</span>
				<span v-if="book['Data de término']">
					📅 {{ formatDate(book['Data de inicio']) }} -
					{{ formatDate(book['Data de término']) }}
				</span>
			</div>
		</div>
		<ActionsButtons  :book="book" />
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

.book-shelf-badge {
	font-size: 18px;
}
.book-info {
	min-height: 77px;
}
</style>
