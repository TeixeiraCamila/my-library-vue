<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import Search from './Search.vue';
import UserMenu from './UserMenu.vue';
import { useModal } from '../composables/useModal';

const { openForAdd } = useModal();

const mobileMenuOpen = ref(false);
const dropdownOpen = ref(false);

const handleClickOutside = (event) => {
	if (!event.target.closest('.relative')) {
		dropdownOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
	<header>
		<nav
			class="container relative mx-auto px-4 flex items-center gap-6 justify-between"
		>
			<div class="flex items-center justify-between relative">
				<h1 class="py-5 px-2 font-bold whitespace-nowrap">My Library</h1>

				<button
					type="button"
					class="md:hidden"
					@click="mobileMenuOpen = !mobileMenuOpen"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
						/>
					</svg>
				</button>
				<div
					:class="[
						'flex-col md:flex-row items-start md:items-center md:gap-3',
						mobileMenuOpen ? 'flex' : 'hidden md:flex',
					]"
					class="relative"
				>
					<!-- <RouterLink
						class="btn-primary rounded-xl py-2 px-3 w-full md:w-auto whitespace-nowrap"
						to="/"
					>
						Go to Home
					</RouterLink>
          -->

					<Search />

					<button @click="openForAdd" class="btn-primary">Add Book</button>
				</div>
			</div>
			<UserMenu />
		</nav>
	</header>
</template>

<style scoped>
nav {
	background: linear-gradient(180deg, #fff9ee, #fff3d9);
}
nav h1 {
	font-size: 2rem;
	text-shadow: 2px 2px rgba(255, 107, 107, 0.12);
}
</style>
