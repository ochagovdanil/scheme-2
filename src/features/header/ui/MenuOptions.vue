<template>
	<i class="pi pi-bars cursor-pointer hover:bg-slate-600 py-1 px-2 rounded-md transition-all" @click="togglePopover" style="font-size: 1.2rem"></i>

	<Popover ref="op">
		<ul>
			<li class="hover:bg-slate-100 p-2 cursor-pointer transition-all rounded-md" @click="reloadPage">
				<p class="flex justify-between items-center gap-4">
					<span>
						<i class="pi pi-refresh me-1" style="font-size: 0.9rem"></i>
						Перезагрузить страницу
					</span>
					<span class="border-[0.0625rem] border-[#dcdcdc] rounded-md bg-[#f5f5f5] py-[0.1rem] px-[0.2rem] text-sm font-bold">CTRL+R</span>
				</p>
			</li>
			<li class="hover:bg-slate-100 p-2 cursor-pointer transition-all rounded-md" @click="openDevTools">
				<p class="flex justify-between items-center gap-4">
					<span>
						<i class="pi pi-code me-1" style="font-size: 0.9rem"></i>
						Открыть консоль разработчика
					</span>
					<span class="border-[0.0625rem] border-[#dcdcdc] rounded-md bg-[#f5f5f5] py-[0.1rem] px-[0.2rem] text-sm font-bold">CTRL+SHIFT+I</span>
				</p>
			</li>
			<li class="hover:bg-slate-100 p-2 cursor-pointer transition-all rounded-md" @click="exitApp">
				<p>
					<i class="pi pi-sign-out me-1" style="font-size: 0.9rem"></i>
					Выход
				</p>
			</li>
		</ul>
	</Popover>
</template>

<script setup lang="ts">
import { Popover } from 'primevue';
import { useTemplateRef } from 'vue';

const popoverRef = useTemplateRef('op');

function togglePopover(event: any): void {
	popoverRef.value?.toggle(event);
}

function reloadPage(): void {
	window.tableTournamentContextBridge.reloadPage();
}

function openDevTools(): void {
	window.tableTournamentContextBridge.openDevConsole();
}

function exitApp(): void {
	window.tableTournamentContextBridge.exitApp();
}
</script>
