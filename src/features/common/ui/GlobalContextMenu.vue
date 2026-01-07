<template>
	<ContextMenu global :model="contextMenuItems">
		<template #item="{ item, props }">
			<div class="d-flex justify-content-start align-items-center py-1 px-2" v-bind="props.action">
				<i :class="item.icon" style="margin-right: 0.5rem" />
				<p class="me-2">{{ item.label }}</p>
				<p v-if="item.shortcut" class="border-[0.0625rem] border-[#dcdcdc] rounded-md bg-[#f5f5f5] p-[0.2rem] text-sm ms-auto font-bold">
					{{ item.shortcut }}
				</p>
			</div>
		</template>
	</ContextMenu>
</template>

<script setup lang="ts">
import ContextMenu from 'primevue/contextmenu';
import { ref } from 'vue';

const contextMenuItems = ref([
	{
		label: 'Перезагрузить страницу',
		icon: 'pi pi-refresh',
		shortcut: 'F5',
		command: () => window.tableTournamentContextBridge.reloadPage()
	},
	{
		label: 'Открыть консоль разработчика',
		icon: 'pi pi-code',
		shortcut: 'CTRL+SHIFT+I',
		command: () => window.tableTournamentContextBridge.openDevConsole()
	}
]);
</script>
