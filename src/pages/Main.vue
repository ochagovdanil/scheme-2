<template>
	<section class="container">
		<!-- Основные действия (actions) -->
		<div class="flex justify-center gap-4 mt-4">
			<button @click="importData" class="outline-none bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700">
				<i class="pi pi-file-import me-1"></i>
				Импортировать данные из Excel
			</button>
			<button @click="clearData" class="outline-none bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700">
				<i class="pi pi-eraser"></i>
				Очистить данные
			</button>
			<button v-if="adjMatrix.length" @click="runGraphBenchmarks" class="outline-none bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700">
				<i class="pi pi-play"></i>
				Сравнить время выполнения алгоритмов
			</button>
		</div>

		<!-- Результаты benchmark -->
		<div class="flex gap-12 justify-center mb-4">
			<div v-if="bfsBenchmark" class="mt-4">
				<p class="text-lg font-bold text-tertiary">BFS сравнение:</p>
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
			<i
				class="pi pi-times text-red-400 mt-4 cursor-pointer hover:text-red-500 p-2"
				v-if="dfsBenchmark || bfsBenchmark"
				@click="clearBenchmarkData"
				title="Закрыть сравнение"></i>
		</div>

		<Divider />

		<!-- Поиск элемента -->
		<div class="mt-4" v-if="CIP.length">
			<label class="font-bold">Введите i</label>
			<input type="number" :min="1" :max="adjMatrix.length" class="border-2 border-slate-500 rounded-md mx-2 w-20 px-1" v-model="searchI" />
			<label class="font-bold">Введите j</label>
			<input type="number" :min="1" :max="adjMatrix[0].length" class="border-2 border-slate-500 rounded-md mx-2 w-20 px-1" v-model="searchJ" />
			<button class="outline-none mx-4 bg-tertiary py-2 px-4 rounded-md text-white hover:bg-tertiary-dark" @click="findElement">
				<i class="pi pi-search"></i>
				Найти элемент
			</button>
			<p class="text-lg my-4">
				Найденный элемент:
				<span class="font-bold text-green-700">{{ foundElement }}</span>
			</p>
			<label class="font-bold">Установить значение:</label>
			<input type="number" class="border-2 border-slate-500 rounded-md mx-2 w-20 px-1" v-model="ijValue" />
			<button class="outline-none mx-4 bg-blue-400 py-2 px-4 rounded-md text-white hover:bg-blue-500" @click="setElement">
				<i class="pi pi-check"></i>
				Установить
			</button>
		</div>

		<Divider v-if="CIP.length" />

		<!-- Упакованная матрица -->
		<div class="bg-primary text-white rounded-md px-4 py-2 h-max mt-4">
			<div class="flex justify-between align-items-center">
				<p class="text-lg font-bold text-tertiary">Упаковка матрицы по 2 схеме Тьюарсона:</p>
				<button class="outline-none bg-green-600 rounded-md px-4 py-1 mb-2 hover:bg-green-700" @click="exportExcel">
					Экспорт в Excel
					<i class="pi pi-file"></i>
				</button>
			</div>
			<div class="max-h-[38.3rem] overflow-y-auto overflow-x-hidden">
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

		<!-- Журнал логов -->
		<div class="bg-slate-100 border-2 border-slate-200 rounded-md my-4">
			<div class="border-slate-300 border-b-2 flex items-center justify-between px-8">
				<p></p>
				<p class="font-bold">Журнал логов:</p>
				<p class="underline cursor-pointer hover:text-slate-500" @click="exportLogs">
					Экспорт в .txt
					<i class="pi pi-file-export ms-1"></i>
				</p>
			</div>
			<div class="max-h-[30rem] overflow-auto">
				<p :class="`py-2 px-4 text-sm ${index % 2 === 0 ? 'bg-slate-50' : ''}`" v-for="(log, index) in logs">
					<span class="italic">
						{{ log?.date ?? 'N/A' }}
					</span>
					| {{ log?.text ?? 'N/A' }}
				</p>
			</div>
		</div>

		<!-- Таблица исходных объектов -->
		<div class="flex flex-row align-items-center justify-center gap-4 my-4">
			<div v-if="items.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_13rem] items-center text-tertiary text-lg">
					<p class="font-bold">№</p>
					<p class="font-bold">Объекты</p>
				</div>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<div
						v-for="(item, index) in items"
						:key="item.id"
						:class="`grid grid-cols-[3rem_13rem] items-center rounded-md px-2 ${index % 2 === 0 ? 'bg-slate-700' : ''}`">
						<p>{{ item.id }}</p>
						<p>{{ item.name }}</p>
					</div>
				</div>
			</div>

			<!-- Таблица связей -->
			<div v-if="connections.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_9rem_13rem_5rem_5rem_8rem] items-center text-tertiary text-lg">
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
		</div>
		<ScrollTop />
	</section>
</template>

<script setup>
import useToastMessage from '@/shared/model/composables/useToastMessage';
import { Divider } from 'primevue';
import ScrollTop from 'primevue/scrolltop';
import { ref } from 'vue';

const toast = useToastMessage();

const items = ref([]); // Таблица объектов
const connections = ref([]); // Таблица связей объектов

const adjMatrix = ref([]); // Матрица смежности

const CIP = ref([]); // указатель индексов столбцов
const RI = ref([]); // индекс строк
const VE = ref([]); // значения ненулевых элементов

// Сравнение алгоритмов DFS и BFS
const bfsBenchmark = ref(null);
const dfsBenchmark = ref(null);

// Поля для поиска элемента
const searchI = ref(null);
const searchJ = ref(null);

// Поле для установки значения найденному элементу
const ijValue = ref(null);

// Значение элемента, который удалось найти
const foundElement = ref('');

const logs = ref([]); // Журнал логов

// Импортировать данные из Excel файла
const importData = async () => {
	const result = await window.tableTournamentContextBridge.importExcel();

	clearData();
	addLog(`Импорт файла: ${result?.filePath ?? 'N/A'}.`);

	if (result && result.items && result.connections) {
		items.value = result.items;
		connections.value = result.connections;

		packMatrix();
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
	CIP.value = [];
	RI.value = [];
	VE.value = [];
	searchI.value = null;
	searchJ.value = null;
	foundElement.value = '';
	ijValue.value = null;
	bfsBenchmark.value = null;
	dfsBenchmark.value = null;

	addLog('Очистка текущего состояния (данных) приложения.');
}

// Построение матрицы смежности
function buildAdjMatrix() {
	const n = items.value.length;

	// Создаем пустую матрицу n x n (заполненную 0)
	const matrix = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

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

	return matrix;
}

// Упаковка матрица по 2 схеме Тьюарсона
function packMatrix() {
	const matrix = buildAdjMatrix();
	adjMatrix.value = matrix;
	const rows = matrix.length;
	const cols = matrix[0].length;

	const ve = []; // значения
	const ri = []; // индексы строк
	const cip = []; // указатели столбцов в VE

	let count = 1; // индекс начинается с 1

	for (let j = 0; j < cols; j++) {
		cip.push(count); // Указываем начало столбца (позиция в VE, начиная с 1)

		for (let i = 0; i < rows; i++) {
			const value = matrix[i][j];

			if (value !== 0) {
				ve.push(value);
				ri.push(i + 1); // Переход к 1-индексации
				count++;
			}
		}
	}

	CIP.value = cip;
	RI.value = ri;
	VE.value = ve;

	addLog('Упаковка матрицы по 2 схеме Тьюарсона.');
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

	addLog('Запуск BFS алгоритма (не упакованной матрицы).');

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

	addLog('Запуск BFS алгоритма (упакованной матрицы).');

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

	addLog('Запуск DFS алгоритма (не упакованной матрицы).');

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

	addLog('Запуск DFS алгоритма (упакованной матрицы).');

	return count;
}

// Запуск тестов
function runGraphBenchmarks() {
	addLog('Запуск benchmark.');

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

// Закрываем окно с показом разницы во времени для выполнения алгоритмов
function clearBenchmarkData() {
	bfsBenchmark.value = null;
	dfsBenchmark.value = null;

	addLog('Закрытие окна с benchmark данными.');
}

// Добавить запись в журнал логирования
function addLog(text) {
	logs.value.unshift({
		date: new Date().toLocaleString(),
		text
	});
}

// Экспорт журнала логов в .txt файл
async function exportLogs() {
	const result = await window.tableTournamentContextBridge.exportLogs(JSON.parse(JSON.stringify(logs.value)));

	if (result.success) toast('success', 'Успешно', 'Журнал логов выгружен в .txt файл!');
	else toast('error', 'Ошибка', `При экспорте журнала логов возникла ошибка:\n${result.error}`);

	addLog(`Экспорт журнала логов в .txt файл: ${result?.path ?? 'N/A'}.`);
}

// Экспорт упакованной матрицы в Excel
async function exportExcel() {
	const result = await window.tableTournamentContextBridge.exportMatrix(
		JSON.parse(JSON.stringify(VE.value)),
		JSON.parse(JSON.stringify(RI.value)),
		JSON.parse(JSON.stringify(CIP.value))
	);

	if (result.success) toast('success', 'Успешно', 'Упакованная форма матрицы выгружена в .xlsx файл!');
	else toast('error', 'Ошибка', `При экспорте упакованной формы матрицы возникла ошибка:\n${result.error}`);

	addLog(`Экспорт упакованной формы матрицы .xlsx файл: ${result?.path ?? 'N/A'}.`);
}

// Поиск элемента по i и j
function findElement() {
	const i = searchI.value;
	const j = searchJ.value;
	const cip = CIP.value;
	const ri = RI.value;
	const ve = VE.value;

	if (!i || !j) {
		toast('warn', 'Внимание!', 'Необходимо указать координаты i и j.');
		return;
	}

	if (i > adjMatrix.value.length || j > adjMatrix.value[0].length) {
		toast('warn', 'Внимание!', `Вы вышли за рамки допустимого диапазона ${adjMatrix.value.length}x${adjMatrix.value[0].length}.`);
		return;
	}

	const start = cip[j - 1]; // откуда начинается j-й столбец в VE
	const end = cip[j] ?? ve.length + 1; // до какого элемента

	// Перебираем нужный отрезок VE
	for (let k = start - 1; k < end - 1; k++) {
		if (ri[k] === i) {
			// Нашли нужный элемент
			foundElement.value = `a[${i}, ${j}] = ${ve[k]}`;
			addLog(`Поиск элемента a[${i}, ${j}] = ${ve[k]}.`);

			toast('success', 'Успешно!', 'Элемент был найден.');
			return;
		}
	}

	// Если не найден — значит элемент равен нулю
	foundElement.value = '';
	addLog(`Поиск элемента a[${i}, ${j}] не дал результатов.`);
	toast('warn', 'Внимание!', 'Искомый элемент отсутствует в матрице.');
}

// Установка нового значения элементу по i и j
function setElement() {
	const i = searchI.value;
	const j = searchJ.value;
	const newVal = ijValue.value;
	const cip = CIP.value;
	const ri = RI.value;
	const ve = VE.value;

	if (!i || !j) {
		toast('warn', 'Внимание!', 'Необходимо указать координаты i и j.');
		return;
	}

	if (i > adjMatrix.value.length || j > adjMatrix.value[0].length) {
		toast('warn', 'Внимание!', `Вы вышли за рамки допустимого диапазона ${adjMatrix.value.length}x${adjMatrix.value[0].length}.`);
		return;
	}

	const newVE = [];
	const newRI = [];
	const newCIP = [];

	let inserted = false;
	let count = 1; // CIP с 1

	for (let col = 1; col <= cip.length; col++) {
		newCIP.push(count);

		let start = cip[col - 1];
		let end = cip[col] ?? ve.length + 1;

		for (let idx = start; idx < end; idx++) {
			const row = ri[idx - 1];
			const val = ve[idx - 1];

			if (col === j && row === i) {
				if (newVal !== 0) {
					newVE.push(newVal);
					newRI.push(i);
					count++;
				}
				inserted = true;
				continue;
			}

			if (col === j && !inserted && row > i && newVal !== 0) {
				newVE.push(newVal);
				newRI.push(i);
				count++;
				inserted = true;
			}

			newVE.push(val);
			newRI.push(row);
			count++;
		}

		if (col === j && !inserted && newVal !== 0) {
			newVE.push(newVal);
			newRI.push(i);
			count++;
			inserted = true;
		}
	}

	VE.value = newVE;
	RI.value = newRI;
	CIP.value = newCIP;

	if (!newVal) {
		addLog(`Элемент a[${i}, ${j}] был удален.`);
		toast('success', 'Успешно!', 'Значение было удалено.');
	} else {
		addLog(`Элементу a[${i}, ${j}] было установлено значение ${newVal}.`);
		toast('success', 'Успешно!', 'Новое значение было установлено.');
	}
}
</script>
