<script setup lang="ts">
import { ConfirmDialog } from 'primevue';
import Toast from 'primevue/toast';
import { defineAsyncComponent } from 'vue';

const Navbar = defineAsyncComponent(() => import('@/widgets/header/ui/Navbar.vue'));
const GlobalContextMenu = defineAsyncComponent(() => import('@/features/common/ui/GlobalContextMenu.vue'));
</script>

<template>
	<div class="flex flex-col h-full">
		<Navbar />
		<div class="bg-accent flex-1">
			<RouterView />
		</div>
	</div>
	<Toast />
	<ConfirmDialog />
	<GlobalContextMenu />
</template>
