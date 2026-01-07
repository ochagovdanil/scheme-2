<template>
	<header class="bg-secondary text-white pt-5 pb-3 border-b-4 border-secondary-dark">
		<nav class="container flex gap-4 justify-between items-center">
			<div class="flex gap-2 items-center">
				<img :src="logo" alt="Логотип" title="Настольный Турнир" class="w-8" />
				<p class="font-bold">Схема 2 Тьюарсон</p>
			</div>
			<ul class="flex justify-content-between gap-4">
				<MenuOptions />
			</ul>
		</nav>
	</header>
</template>

<script setup lang="ts">
import logo from '@/app/ui/assets/icon.png';
import { defineAsyncComponent } from 'vue';

const MenuOptions = defineAsyncComponent(() => import('@/features/header/ui/MenuOptions.vue'));
</script>
