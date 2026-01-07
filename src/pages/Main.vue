<template>
	<section class="container">
		<div class="flex justify-center gap-4 mt-4">
			<button @click="importData" class="outline-none bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700">
				<i class="pi pi-file-import me-1"></i>
				Импортировать данные из Excel
			</button>
			<button @click="clearData" class="outline-none bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700">
				<i class="pi pi-eraser"></i>
				Очистить данные
			</button>
		</div>

		<div class="flex flex-row align-items-center justify-between gap-4 my-4">
			<div v-if="items.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_13rem] text-tertiary text-lg">
					<p class="font-bold">№</p>
					<p class="font-bold">Объекты</p>
				</div>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<div
						v-for="(item, index) in items"
						:key="item.id"
						:class="`grid grid-cols-[3rem_13rem] rounded-md px-2 ${index % 2 === 0 ? 'bg-slate-700' : ''}`">
						<p>{{ item.id }}</p>
						<p>{{ item.name }}</p>
					</div>
				</div>
			</div>

			<div v-if="connections.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_9rem_13rem_5rem_5rem_8rem] text-tertiary text-lg">
					<p class="font-bold">№</p>
					<p class="font-bold">Начало</p>
					<p class="font-bold">Конец</p>
					<p class="font-bold">Начало</p>
					<p class="font-bold">Конец</p>
					<p class="font-bold">Начало-Конец</p>
				</div>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<div
						v-for="(link, index) in connections"
						:key="index"
						:class="`grid grid-cols-[3rem_9rem_13rem_5rem_5rem_8rem] rounded-md px-2 ${index % 2 === 0 ? 'bg-slate-700' : ''}`">
						<p>{{ index + 1 }}</p>
						<p>{{ link.startName }}</p>
						<p>{{ link.endName }}</p>
						<p>{{ link.startId }}</p>
						<p>{{ link.endId }}</p>
						<p>{{ link.startEnd }}</p>
					</div>
				</div>
			</div>

			<div v-if="adjMatrix.length" class="bg-primary text-white rounded-md px-4 py-2 h-max">
				<p class="text-lg font-bold text-tertiary">Упаковка матрицы по 2 схеме Тьюарсона:</p>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<p>
						<strong class="text-secondary text-lg">CIP:</strong>
						{{ CIP.join(', ') }}
					</p>
					<p>
						<strong class="text-secondary text-lg">RI:</strong>
						{{ RI.join(', ') }}
					</p>
					<p>
						<strong class="text-secondary text-lg">VE:</strong>
						{{ VE.join(', ') }}
					</p>
				</div>
			</div>
		</div>
		<div class="mt-8" v-if="adjMatrix.length">
			<button @click="runGraphBenchmarks" class="block mx-auto outline-none bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700">
				<i class="pi pi-play"></i>
				Сравнить BFS/DFS алгоритмы на обычной и упакованной матрице
			</button>

			<div class="flex gap-12 justify-center mb-4">
				<div v-if="bfsBenchmark" class="mt-4">
					<p class="text-lg font-bold text-tertiary">BFS сравнение:</p>
					<p>
						Кол-во посещённых вершин до | после упаковки:
						<span class="font-bold">{{ bfsBenchmark.rawCount }} | {{ bfsBenchmark.packedCount }}</span>
					</p>
					<p class="mt-2">
						<em>Затраченное время:</em>
					</p>
					<p>
						⚙ До упаковки:
						<strong>{{ bfsBenchmark.raw }} ms</strong>
					</p>
					<p>
						📦 После упаковки:
						<strong>{{ bfsBenchmark.packed }} ms</strong>
					</p>
					<p class="mt-2 text-green-600 font-bold">
						Выигрыш: {{ bfsBenchmark.raw - bfsBenchmark.packed }} ms ({{ 100 - (bfsBenchmark.packed / bfsBenchmark.raw) * 100 }}%)
					</p>
				</div>

				<div v-if="dfsBenchmark" class="mt-4">
					<p class="text-lg font-bold text-tertiary">DFS сравнение:</p>
					<p>
						Кол-во посещённых вершин до | после упаковки:
						<span class="font-bold">{{ dfsBenchmark.rawCount }} | {{ dfsBenchmark.packedCount }}</span>
					</p>
					<p class="mt-2">
						<em>Затраченное время:</em>
					</p>
					<p>
						⚙ До упаковки:
						<strong>{{ dfsBenchmark.raw }} ms</strong>
					</p>
					<p>
						📦 После упаковки:
						<strong>{{ dfsBenchmark.packed }} ms</strong>
					</p>
					<p class="mt-2 text-green-600 font-bold">
						Выигрыш: {{ dfsBenchmark.raw - dfsBenchmark.packed }} ms ({{ 100 - (dfsBenchmark.packed / dfsBenchmark.raw) * 100 }}%)
					</p>
				</div>
			</div>
		</div>
		<ScrollTop />
	</section>
</template>

<script setup>
import ScrollTop from 'primevue/scrolltop';
import { ref } from 'vue';

const items = ref([]);
const connections = ref([]);

const adjMatrix = ref([]); // массив массивов: 2D матрица смежности
const matrixHeaders = ref([]); // заголовки (имена)

const CIP = ref([]); // указатель индексов столбцов
const RI = ref([]); // индекс строк
const VE = ref([]); // значения ненулевых элементов

// Сравнение алгоритмов DFS и BFS
const bfsBenchmark = ref(null);
const dfsBenchmark = ref(null);

// Импортировать данные из Excel файла
const importData = async () => {
	const result = await window.tableTournamentContextBridge.importExcel();

	clearData();

	if (result && result.items && result.connections) {
		items.value = result.items;
		connections.value = result.connections;

		// -------------------------------
		// Построение матрицы смежности
		// -------------------------------
		const n = items.value.length;

		// Создаем пустую матрицу n x n (заполненную 0)
		const matrix = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

		// Заголовки по порядку item.id (если они идут от 1 последовательно)
		matrixHeaders.value = items.value.map(item => ({
			id: item.id
		}));

		// Заполняем матрицу
		for (const conn of connections.value) {
			const fromIndex = items.value.findIndex(i => i.id === conn.startId);
			const toIndex = items.value.findIndex(i => i.id === conn.endId);

			if (fromIndex !== -1 && toIndex !== -1) {
				// Двусторонняя связь (ненаправленный граф)
				matrix[fromIndex][toIndex] = 1;
				matrix[toIndex][fromIndex] = 1;
			}
		}

		adjMatrix.value = matrix;

		const packed = packMatrix(matrix);
		CIP.value = packed.CIP;
		RI.value = packed.RI;
		VE.value = packed.VE;
	} else {
		items.value = [];
		connections.value = [];
	}
};

// Чистим данные, которые были импортированы
function clearData() {
	items.value = [];
	connections.value = [];
	adjMatrix.value = [];
	matrixHeaders.value = [];
	CIP.value = [];
	RI.value = [];
	VE.value = [];
	bfsBenchmark.value = null;
	dfsBenchmark.value = null;
}

// Упаковка матрица по 2 схеме Тьюарсона
function packMatrix(matrix) {
	const cip = [0];
	const ri = [];
	const ve = [];

	let count = 0;

	for (let i = 0; i < matrix.length; i++) {
		const row = matrix[i];

		for (let j = 0; j < row.length; j++) {
			if (row[j] !== 0) {
				ri.push(j);
				ve.push(row[j]);
				count++;
			}
		}
		cip.push(count); // здесь count — сколько всего до этой строки включительно
	}

	return { CIP: cip, RI: ri, VE: ve };
}

// BFS algo
function bfsRaw(start = 0) {
	const visited = new Array(adjMatrix.value.length).fill(false);
	const queue = [start];
	let count = 0;

	while (queue.length) {
		const node = queue.shift();
		if (visited[node]) continue;
		visited[node] = true;
		count++;

		for (let i = 0; i < adjMatrix.value.length; i++) {
			if (adjMatrix.value[node][i] === 1 && !visited[i]) {
				queue.push(i);
			}
		}
	}

	return count;
}

function bfsPacked(start = 0) {
	const visited = new Array(CIP.value.length - 1).fill(false);
	const queue = [start];
	let count = 0;

	while (queue.length) {
		const node = queue.shift();
		if (visited[node]) continue;
		visited[node] = true;
		count++;

		const startIdx = CIP.value[node];
		const endIdx = CIP.value[node + 1];

		for (let i = startIdx; i < endIdx; i++) {
			const next = RI.value[i];
			if (!visited[next]) {
				queue.push(next);
			}
		}
	}

	return count;
}

// DFS algo
function dfsRaw(start = 0) {
	const visited = new Array(adjMatrix.value.length).fill(false);
	let count = 0;

	function dfs(node) {
		if (visited[node]) return;
		visited[node] = true;
		count++;

		for (let i = 0; i < adjMatrix.value.length; i++) {
			if (adjMatrix.value[node][i] === 1 && !visited[i]) {
				dfs(i);
			}
		}
	}

	dfs(start);
	return count;
}

function dfsPacked(start = 0) {
	const visited = new Array(CIP.value.length - 1).fill(false);
	let count = 0;

	function dfs(node) {
		if (visited[node]) return;
		visited[node] = true;
		count++;

		const startIdx = CIP.value[node];
		const endIdx = CIP.value[node + 1];

		for (let i = startIdx; i < endIdx; i++) {
			const next = RI.value[i];
			if (!visited[next]) {
				dfs(next);
			}
		}
	}

	dfs(start);
	return count;
}

// Запуск тестов
function runGraphBenchmarks() {
	const startNode = 0;

	// BFS
	let t1 = performance.now();
	const bfsRawCount = bfsRaw(startNode);
	let t2 = performance.now();
	let bfsRawTime = t2 - t1;

	t1 = performance.now();
	const bfsPackedCount = bfsPacked(startNode);
	t2 = performance.now();
	let bfsPackedTime = t2 - t1;

	bfsBenchmark.value = {
		raw: bfsRawTime.toFixed(3),
		packed: bfsPackedTime.toFixed(3),
		rawCount: bfsRawCount,
		packedCount: bfsPackedCount
	};

	// DFS
	t1 = performance.now();
	const dfsRawCount = dfsRaw(startNode);
	t2 = performance.now();
	let dfsRawTime = t2 - t1;

	t1 = performance.now();
	const dfsPackedCount = dfsPacked(startNode);
	t2 = performance.now();
	let dfsPackedTime = t2 - t1;

	dfsBenchmark.value = {
		raw: dfsRawTime.toFixed(3),
		packed: dfsPackedTime.toFixed(3),
		rawCount: dfsRawCount,
		packedCount: dfsPackedCount
	};
}
</script>
