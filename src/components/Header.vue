<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import Search from './Search.vue';
import UserMenu from './UserMenu.vue';
import Heading from './ui/Heading.vue';

const route = useRoute();

// mobile menu
const mobileMenuOpen = ref(false);

// sticky on scroll
const isSticky = ref(false);
const headerRef = ref(null);
const headerHeight = ref(0);

const toggleMobileMenu = () => {
	mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
	mobileMenuOpen.value = false;
};

const handleClickOutside = (event) => {
	// Verifica se o clique foi fora do menu e do botão
	const menuContainer = document.querySelector('.mobile-menu-dropdown');
	const menuButton = document.querySelector('.mobile-menu-button');

	if (
		mobileMenuOpen.value &&
		menuContainer &&
		!menuContainer.contains(event.target) &&
		menuButton &&
		!menuButton.contains(event.target)
	) {
		closeMobileMenu();
	}
};

const onScroll = () => {
	const y = window.scrollY || window.pageYOffset;
	isSticky.value = y > 10;
};

const updateHeaderHeight = () => {
	if (headerRef.value) headerHeight.value = headerRef.value.offsetHeight;
};

onMounted(async () => {
	document.addEventListener('click', handleClickOutside);
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', updateHeaderHeight);
	await nextTick();
	updateHeaderHeight();
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', updateHeaderHeight);
});
</script>

<template>
	<!-- placeholder to avoid layout jump when header becomes fixed -->
	<div
		v-if="isSticky"
		:style="{ height: headerHeight + 'px' }"
		aria-hidden="true"
	></div>

	<header
		ref="headerRef"
		:class="[
			'bg-gradient-to from-amber-50 to-amber-100',
			'w-full',
			isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : 'shadow-sm',
		]"
	>
		<nav class="container mx-auto px-4 sm:px-6 py-4 relative">
			<div class="flex items-center justify-between gap-4">
				<!-- Logo/Title + Mobile Menu Button -->
				<div class="flex items-center gap-3">
					<router-link to="/books" class="hover:opacity-80 transition-opacity">
						<Heading
							:level="2"
							weight="bold"
							class="text-lg sm:text-xl lg:text-2xl whitespace-nowrap"
						>
							My Library
						</Heading>
					</router-link>

					<!-- Mobile menu button -->
					<button
						type="button"
						class="mobile-menu-button md:hidden p-2 hover:bg-amber-200 rounded-lg transition-colors"
						@click="toggleMobileMenu"
						aria-label="Toggle menu"
						aria-expanded="mobileMenuOpen"
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
								v-if="!mobileMenuOpen"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
							/>
							<path
								v-else
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-4">
					<router-link
						to="/books"
						:class="[
							'px-4 py-2 rounded-lg font-medium transition-all',
							route.path === '/books'
								? 'bg-amber-200 text-gray-900 shadow-[2.8px_2.8px_0_0_#222222]'
								: 'hover:bg-amber-200/50',
						]"
					>
						Books
					</router-link>
					<router-link
						to="/graphics"
						:class="[
							'px-4 py-2 rounded-lg font-medium transition-all',
							route.path === '/graphics'
								? 'bg-amber-200 text-gray-900 shadow-[2.8px_2.8px_0_0_#222222]'
								: 'hover:bg-amber-200/50',
						]"
					>
						Graphics
					</router-link>
				</div>

				<!-- Desktop Search & User Menu -->
				<div class="hidden md:flex items-center gap-4">
					<Search />
					<UserMenu />
				</div>

				<!-- Mobile User Menu -->
				<div class="md:hidden">
					<UserMenu />
				</div>
			</div>

			<!-- Mobile Menu Dropdown -->
			<transition
				enter-active-class="transition ease-out duration-200"
				enter-from-class="opacity-0 -translate-y-2"
				enter-to-class="opacity-100 translate-y-0"
				leave-active-class="transition ease-in duration-150"
				leave-from-class="opacity-100 translate-y-0"
				leave-to-class="opacity-0 -translate-y-2"
			>
				<div
					v-if="mobileMenuOpen"
					class="mobile-menu-dropdown md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-lg z-50 border-2 border-amber-200 overflow-hidden"
					style="box-shadow: 4px 4px 0 0 rgba(251, 191, 36, 0.4)"
				>
					<div class="p-4 flex flex-col gap-3">
						<!-- Navigation Links -->
						<router-link
							to="/books"
							@click="closeMobileMenu"
							:class="[
								'px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center gap-2',
								route.path === '/books'
									? 'bg-amber-200 text-gray-900 shadow-[2.8px_2.8px_0_0_#222222]'
									: 'hover:bg-amber-100',
							]"
						>
							<span class="text-xl">📚</span>
							<span>Books</span>
						</router-link>

						<router-link
							to="/graphics"
							@click="closeMobileMenu"
							:class="[
								'px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center gap-2',
								route.path === '/graphics'
									? 'bg-amber-200 text-gray-900 shadow-[2.8px_2.8px_0_0_#222222]'
									: 'hover:bg-amber-100',
							]"
						>
							<span class="text-xl">📊</span>
							<span>Graphics</span>
						</router-link>

						<!-- Search (mobile only) -->
						<div class="pt-3 border-t-2 border-amber-200">
							<Search />
						</div>
					</div>
				</div>
			</transition>
		</nav>
	</header>
</template>
