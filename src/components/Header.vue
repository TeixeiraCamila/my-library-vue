<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import Search from './Search.vue';
import UserMenu from './UserMenu.vue';
import Heading from './ui/Heading.vue';

// mobile menu
const mobileMenuOpen = ref(false);

const handleClickOutside = (event) => {
	if (!event.target.closest('.mobile-menu-container')) {
		mobileMenuOpen.value = false;
	}
};

// sticky on scroll
const isSticky = ref(false);
const headerRef = ref(null);
const headerHeight = ref(0);

const onScroll = () => {
	const y = window.scrollY || window.pageYOffset;
	isSticky.value = y > 10; // becomes sticky after small scroll
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
			'bg-gradient-to-b from-amber-50 to-amber-100',
			'w-full',
			isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : 'shadow-sm',
		]"
	>
		<nav class="container mx-auto px-5 py-4 relative">
			<div class="flex items-center justify-between gap-6">
				<div class="flex items-center gap-4 mobile-menu-container">
					<Heading :level="2" :weight="bold"> My Library </Heading>

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

					<div class="hidden md:flex items-center gap-3">
						<Search />
					</div>

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

				<UserMenu />
			</div>
		</nav>
	</header>
</template>
