<script setup>
import { defineProps } from 'vue';

const props = defineProps({
	book,
});

function getCover(isbn, isbn13) {
	const isbnToUse = isbn13 && isbn13 !== '' ? isbn13 : isbn;
	console.log('🚀 ~ getCover ~ isbnToUse:', isbnToUse);
}
</script>

<template>
	<div>
		<img
			@canplay="getCover(book.ISBN, book.ISBN13)"
			src="https://placehold.co/80x120"
			:alt="`Capa do livro ${book.ISBN}`"
			class="w-32 h-auto rounded-md shadow-md"
		/>
	</div>
</template>

<style scoped></style>
