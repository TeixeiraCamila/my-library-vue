<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Search from './Search.vue';
import UserMenu from './UserMenu.vue';



const mobileMenuOpen = ref(false);

const handleClickOutside = (event) => {
	if (!event.target.closest('.mobile-menu-container')) {
		mobileMenuOpen.value = false;
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
	<header class="bg-gradient-to-b from-amber-50 to-amber-100 shadow-sm">
		<nav class="container mx-auto px-5 py-5 relative">
			<div class="flex items-center justify-between gap-6">
				<!-- Logo e Menu Mobile Toggle -->
				<div class="flex items-center gap-4 mobile-menu-container">
					<h1
						class="text-3xl font-bold text-gray-800 whitespace-nowrap"
						style="text-shadow: 2px 2px rgba(255, 107, 107, 0.12)"
					>
						My Library
					</h1>

					<!-- Botão Menu Mobile -->
					<button
						type="button"
						class="md:hidden p-2 hover:bg-amber-200 rounded-lg transition-colors"
						@click="mobileMenuOpen = !mobileMenuOpen"
						aria-label="Toggle menu"
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

					<!-- Menu Desktop -->
					<div class="hidden md:flex items-center gap-3">
						<Search />
						<!-- <button
							v-if="authStore.canCreate"
							@click="handleAddBook"
							class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
						>
							➕ Adicionar Livro
						</button> -->
					</div>

					<!-- Menu Mobile (Dropdown) -->
					<div
						v-if="mobileMenuOpen"
						class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 md:hidden"
						style="box-shadow: 3px 3px 0 0 rgba(255, 107, 107, 0.12)"
					>
						<div class="p-4 flex flex-col gap-3">
							<Search />
							
						</div>
					</div>
				</div>

				<!-- User Menu -->
				<UserMenu />
			</div>
		</nav>
	</header>
</template>
