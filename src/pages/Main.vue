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
			<i
				class="pi pi-times text-red-400 mt-4 cursor-pointer hover:text-red-500 p-2"
				v-if="dfsBenchmark || bfsBenchmark"
				@click="clearBenchmarkData"
				title="Закрыть сравнение"></i>
		</div>

		<!-- Таблица исходных объектов -->
		<div class="flex flex-row align-items-center justify-between gap-4 my-4">
			<div v-if="items.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_13rem_2rem_1rem] items-center text-tertiary text-lg">
					<p class="font-bold">№</p>
					<p class="font-bold">Объекты</p>
					<p></p>
					<i
						class="pi pi-plus-circle cursor-pointer text-green-400 hover:text-green-600"
						title="Добавить новый объект"
						@click="isAddNewObjectDialogVisible = true"></i>
				</div>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<div
						v-for="(item, index) in items"
						:key="item.id"
						:class="`grid grid-cols-[3rem_13rem_2rem_1rem] items-center rounded-md px-2 ${index % 2 === 0 ? 'bg-slate-700' : ''}`">
						<p>{{ item.id }}</p>
						<p>{{ item.name }}</p>
						<i
							class="pi pi-pencil cursor-pointer text-yellow-500 hover:text-yellow-600"
							title="Редактировать объект"
							@click="() => openEditObjectDialog(item)"></i>
						<i class="pi pi-trash text-red-400 cursor-pointer hover:text-red-500" title="Удалить объект" @click="askToDeleteObject(item)"></i>
					</div>
				</div>
			</div>

			<!-- Таблица связей -->
			<div v-if="connections.length" class="bg-primary text-white py-2 px-4 rounded-md h-max">
				<div class="grid grid-cols-[3rem_9rem_13rem_5rem_5rem_8rem_2rem_1rem] items-center text-tertiary text-lg">
					<p class="font-bold">№</p>
					<p class="font-bold">Начало</p>
					<p class="font-bold">Конец</p>
					<p class="font-bold">Начало</p>
					<p class="font-bold">Конец</p>
					<p class="font-bold">Начало-Конец</p>
					<p></p>
					<i
						class="pi pi-plus-circle justify-self-end text-green-400 cursor-pointer hover:text-green-600"
						title="Добавить новый отрезок"
						@click="isAddNewConnectionDialogVisible = true"></i>
				</div>
				<div class="max-h-[40rem] overflow-y-auto overflow-x-hidden">
					<div
						v-for="(link, index) in connections"
						:key="index"
						:class="`grid grid-cols-[3rem_9rem_13rem_5rem_5rem_8rem_2rem_1rem] rounded-md px-2 ${index % 2 === 0 ? 'bg-slate-700' : ''}`">
						<p>{{ index + 1 }}</p>
						<p>{{ link.startName }}</p>
						<p>{{ link.endName }}</p>
						<p>{{ link.startId }}</p>
						<p>{{ link.endId }}</p>
						<p>{{ link.startEnd }}</p>
						<i
							class="pi pi-pencil cursor-pointer text-yellow-500 hover:text-yellow-600"
							title="Редактировать отрезок"
							@click="() => openEditConnectionDialog(link)"></i>
						<i class="pi pi-trash text-red-400 cursor-pointer hover:text-red-500" title="Удалить отрезок" @click="askToDeleteConnection(link)"></i>
					</div>
				</div>
			</div>

			<!-- Упакованная матрица -->
			<div v-if="adjMatrix.length" class="bg-primary text-white rounded-md px-4 py-2 h-max">
				<p class="text-lg font-bold text-tertiary">Упаковка матрицы по 2 схеме Тьюарсона:</p>
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
		</div>

		<!-- Журнал логов -->
		<div class="bg-slate-100 border-2 border-slate-200 rounded-md mb-4">
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
		<ScrollTop />
	</section>

	<!--  Диалоговое окно по созданию нового объекта для таблицы №1 -->
	<Dialog v-model:visible="isAddNewObjectDialogVisible" modal header="Добавить новый объект" :style="{ width: 'max-content' }">
		<label>Укажите имя объекта:</label>
		<input type="text" autofocus v-model.trim="newObjectName" class="ms-2 outline-none border-2 border-slate-700 rounded-md px-2" />
		<template #footer>
			<button @click="isAddNewObjectDialogVisible = false" class="outline-none rounded-md cursor-pointer bg-red-400 py-1 px-2 hover:bg-red-500">
				Отмена
			</button>
			<button @click="addNewObject" class="outline-none rounded-md cursor-pointer bg-green-400 py-1 px-2 hover:bg-green-500">
				Сохранить
				<i class="pi pi-save"></i>
			</button>
		</template>
	</Dialog>

	<!--  Диалоговое окно по редактированию объекта для таблицы №1 -->
	<Dialog v-model:visible="isEditObjectDialogVisible" modal header="Редактировать объект" :style="{ width: 'max-content' }">
		<label>Задайте новое название объекту:</label>
		<input type="text" autofocus v-model.trim="editObjectName" class="ms-2 outline-none border-2 border-slate-700 rounded-md px-2" />
		<template #footer>
			<button @click="isEditObjectDialogVisible = false" class="outline-none rounded-md cursor-pointer bg-red-400 py-1 px-2 hover:bg-red-500">
				Отмена
			</button>
			<button @click="editObject" class="outline-none rounded-md cursor-pointer bg-green-400 py-1 px-2 hover:bg-green-500">
				Сохранить
				<i class="pi pi-save"></i>
			</button>
		</template>
	</Dialog>

	<!--  Диалоговое окно по созданию нового отрезка для таблицы №2 -->
	<Dialog v-model:visible="isAddNewConnectionDialogVisible" modal header="Добавить новый отрезок" :style="{ width: 'max-content' }">
		<div>
			<label class="me-2">Укажите начальную точку отрезка:</label>
			<Select v-model="newStartObj" :options="items" optionLabel="name" placeholder="Выбрать точку" checkmark filter showClear class="w-64" />
		</div>
		<div class="mt-4">
			<label class="me-2">Укажите конечную точку отрезка:</label>
			<Select v-model="newEndObj" :options="items" optionLabel="name" placeholder="Выбрать точку" checkmark filter showClear class="w-64" />
		</div>
		<template #footer>
			<button @click="isAddNewConnectionDialogVisible = false" class="outline-none rounded-md cursor-pointer bg-red-400 py-1 px-2 hover:bg-red-500">
				Отмена
			</button>
			<button @click="addNewConnection" class="outline-none rounded-md cursor-pointer bg-green-400 py-1 px-2 hover:bg-green-500">
				Сохранить
				<i class="pi pi-save"></i>
			</button>
		</template>
	</Dialog>

	<!--  Диалоговое окно по редактированию отрезка для таблицы №2 -->
	<Dialog v-model:visible="isEditConnectionDialogVisible" modal header="Редактировать отрезок" :style="{ width: 'max-content' }">
		<div>
			<label class="me-2">Укажите начальную точку отрезка:</label>
			<Select v-model="editStartObj" :options="items" optionLabel="name" placeholder="Выбрать точку" checkmark filter showClear class="w-64" />
		</div>
		<div class="mt-4">
			<label class="me-2">Укажите конечную точку отрезка:</label>
			<Select v-model="editEndObj" :options="items" optionLabel="name" placeholder="Выбрать точку" checkmark filter showClear class="w-64" />
		</div>
		<template #footer>
			<button @click="isEditConnectionDialogVisible = false" class="outline-none rounded-md cursor-pointer bg-red-400 py-1 px-2 hover:bg-red-500">
				Отмена
			</button>
			<button @click="editConnection" class="outline-none rounded-md cursor-pointer bg-green-400 py-1 px-2 hover:bg-green-500">
				Сохранить
				<i class="pi pi-save"></i>
			</button>
		</template>
	</Dialog>
</template>

<script setup>
import useConfirmDialog from '@/shared/model/composables/useConfirmDialog';
import useToastMessage from '@/shared/model/composables/useToastMessage';
import { Dialog, Select } from 'primevue';
import ScrollTop from 'primevue/scrolltop';
import { ref, watch } from 'vue';

const toast = useToastMessage();
const confirm = useConfirmDialog();

const items = ref([]); // Таблица объектов
const connections = ref([]); // Таблица связей объектов

const adjMatrix = ref([]); // массив массивов: 2D матрица смежности
const matrixHeaders = ref([]); // заголовки (имена) для матрицы смежности

const CIP = ref([]); // указатель индексов столбцов
const RI = ref([]); // индекс строк
const VE = ref([]); // значения ненулевых элементов

// Сравнение алгоритмов DFS и BFS
const bfsBenchmark = ref(null);
const dfsBenchmark = ref(null);

// Видимость модальных окон
const isAddNewObjectDialogVisible = ref(false);
const isEditObjectDialogVisible = ref(false);
const isAddNewConnectionDialogVisible = ref(false);
const isEditConnectionDialogVisible = ref(false);

// Данные для формы "Добавить новый объект"
const newObjectName = ref('');

// Данные для формы "Редактировать объект"
const editObjectId = ref(-1);
const editObjectName = ref('');
const editOldObjectName = ref('');

// Данные для формы "Добавить новый отрезок"
const newStartObj = ref(null);
const newEndObj = ref(null);

// Данные для формы "Редактировать отрезок"
const editStartObj = ref(null);
const editEndObj = ref(null);
const editOldStartObj = ref(null);
const editOldEndObj = ref(null);

const logs = ref([]); // Журнал логов

// Импортировать данные из Excel файла
const importData = async () => {
	const result = await window.tableTournamentContextBridge.importExcel();

	clearData();
	addLog(`Импорт файла: ${result?.filePath ?? 'N/A'}`);

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
	matrixHeaders.value = [];
	CIP.value = [];
	RI.value = [];
	VE.value = [];
	bfsBenchmark.value = null;
	dfsBenchmark.value = null;

	addLog('Очистка текущего состояния (данных) приложения');
}

// Построение матрицы смежности
function buildAdjMatrix() {
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
	return matrix;
}

// Упаковка матрица по 2 схеме Тьюарсона
function packMatrix() {
	const matrix = buildAdjMatrix();
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

	CIP.value = cip;
	RI.value = ri;
	VE.value = ve;

	addLog('Упаковка матрицы по 2 схеме Тьюарсона');
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

	addLog('Запуск BFS алгоритма (не упакованной матрицы)');

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

	addLog('Запуск BFS алгоритма (упакованной матрицы)');

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

	addLog('Запуск DFS алгоритма (не упакованной матрицы)');

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

	addLog('Запуск DFS алгоритма (упакованной матрицы)');

	return count;
}

// Запуск тестов
function runGraphBenchmarks() {
	addLog('Запуск benchmark');

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

	addLog('Закрытие окна с benchmark данными');
}

// Добавляем новый объект в исходную таблицу №1
function addNewObject() {
	// Валидация формы
	if (!newObjectName.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить поле!');
		return;
	}

	if (items.value.find(it => it.name === newObjectName.value)) {
		toast('warn', 'Внимание', 'Объект с таким именем уже существует!');
		return;
	}

	// Добавление элемента в массив
	items.value.push({
		id: items.value[items.value.length - 1].id + 1,
		name: newObjectName.value
	});

	addLog(`Добавлен новый объект "${newObjectName.value}" в таблицу`);

	isAddNewObjectDialogVisible.value = false;
	toast('success', 'Успешно', 'Новый объект добавлен в таблицу!');
}

// Спрашиваем пользователя уверен ли он в том, что хочет удалить объект из таблицы №1
function askToDeleteObject(obj) {
	confirm(
		`Вы уверены что хотите удалить объект с названием "${obj.name}"?`,
		'Внимание',
		'pi pi-exclamation-triangle',
		{
			label: 'Нет',
			severity: 'danger',
			outlined: true
		},
		{
			label: 'Да',
			severity: 'success'
		},
		() => {
			deleteObject(obj);
		},
		() => {}
	);
}

// Удаляем объект из таблицы №1
function deleteObject(obj) {
	// Проверка на присутствие данного объекта в таблице связей (№2)
	if (connections.value.find(it => it.startName === obj.name || it.endName === obj.name)) {
		toast('warn', 'Внимание', 'Данный объект удалить нельзя, т.к. он присутствует в таблице связей объектов!');
		return;
	}

	// Удаляем объект
	items.value = items.value.filter(it => it.name !== obj.name);
	toast('success', 'Успешно', 'Объект был удален из таблицы!');

	addLog(`Объект "${obj.name}" удален из таблицы`);
}

// Открываем диалоговое окно по редактированию объекта из таблицы №1 и передаем данные об этом объекте
function openEditObjectDialog(obj) {
	isEditObjectDialogVisible.value = true;

	editObjectId.value = obj.id;
	editObjectName.value = obj.name;
	editOldObjectName.value = obj.name;
}

// Редактируем объект в исходной таблицу №1
function editObject() {
	// Валидация формы
	if (!editObjectName.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить поле!');
		return;
	}

	if (items.value.find(it => it.name === editObjectName.value)) {
		toast('warn', 'Внимание', 'Объект с таким именем уже существует!');
		return;
	}

	// Изменение элемента в таблицах №1 и №2
	items.value = items.value.map(it => (it.name === editOldObjectName.value ? { ...it, name: editObjectName.value } : it));
	connections.value = connections.value.map(it => {
		if (it.startName === editOldObjectName.value) {
			return {
				...it,
				startName: editObjectName.value
			};
		} else if (it.endName === editOldObjectName.value) {
			return {
				...it,
				endName: editObjectName.value
			};
		} else return it;
	});

	addLog(`Объект в таблице "${editOldObjectName.value}" переименован в "${editObjectName.value}"`);

	isEditObjectDialogVisible.value = false;
	toast('success', 'Успешно', 'Объект изменил название в таблице!');
}

// Проверяем существование связи между двумя объектами (точками) в таблице отрезков
function connectionExists(startId, endId) {
	return connections.value.some(conn => (conn.startId === startId && conn.endId === endId) || (conn.startId === endId && conn.endId === startId));
}

// Добавляем новый отрезок в таблицу №2
function addNewConnection() {
	// Валидация формы
	if (!newStartObj.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить начальную точку отрезка!');
		return;
	}

	if (!newEndObj.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить конечную точку отрезка!');
		return;
	}

	if (newStartObj.value.id === newEndObj.value.id) {
		toast('warn', 'Внимание', 'Начальная и конечная точки отрезка не должны совпадать между собой!');
		return;
	}

	if (connectionExists(newStartObj.value.id, newEndObj.value.id)) {
		toast('warn', 'Внимание', 'Такая связь уже существует! Задайте другую.');
		return;
	}

	// Добавление элемента в массив
	connections.value.push({
		startId: newStartObj.value.id,
		endId: newEndObj.value.id,
		startName: newStartObj.value.name,
		endName: newEndObj.value.name,
		startEnd: `${newStartObj.value.id}-${newEndObj.value.id}`
	});

	addLog(`Добавлен новый отрезок "${newStartObj.value.name}-${newEndObj.value.name} || ${newStartObj.value.id}-${newEndObj.value.id}" в таблицу`);

	packMatrix();

	isAddNewConnectionDialogVisible.value = false;
	toast('success', 'Успешно', 'Новый отрезок добавлен в таблицу!');
}

// Спрашиваем пользователя уверен ли он в том, что хочет удалить отрезок из таблицы №2
function askToDeleteConnection(connection) {
	confirm(
		`Вы уверены что хотите удалить отрезок "${connection.startName}-${connection.endName} || ${connection.startEnd}"?`,
		'Внимание',
		'pi pi-exclamation-triangle',
		{
			label: 'Нет',
			severity: 'danger',
			outlined: true
		},
		{
			label: 'Да',
			severity: 'success'
		},
		() => {
			deleteConnection(connection);
		},
		() => {}
	);
}

// Удаляем отрезок из таблицы №2
function deleteConnection(connection) {
	connections.value = connections.value.filter(it => it.startEnd !== connection.startEnd);
	toast('success', 'Успешно', 'Отрезок был удален из таблицы!');

	addLog(`Отрезок "${connection.startName}-${connection.endName} || ${connection.startEnd}" удален из таблицы`);

	packMatrix();
}

// Открываем диалоговое окно по редактированию отрезка из таблицы №2 и передаем данные об этом отрезке
function openEditConnectionDialog(connection) {
	isEditConnectionDialogVisible.value = true;

	editStartObj.value = {
		id: connection.startId,
		name: connection.startName
	};
	editEndObj.value = {
		id: connection.endId,
		name: connection.endName
	};
	editOldStartObj.value = {
		id: connection.startId,
		name: connection.startName
	};
	editOldEndObj.value = {
		id: connection.endId,
		name: connection.endName
	};
}

// Редактируем отрезок в исходной таблице №2
function editConnection() {
	// Валидация формы
	if (!editStartObj.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить начальную точку отрезка!');
		return;
	}

	if (!editEndObj.value) {
		toast('warn', 'Внимание', 'Необходимо заполнить конечную точку отрезка!');
		return;
	}

	if (editStartObj.value.id === editEndObj.value.id) {
		toast('warn', 'Внимание', 'Начальная и конечная точки отрезка не должны совпадать между собой!');
		return;
	}

	if (connectionExists(editStartObj.value.id, editEndObj.value.id)) {
		toast('warn', 'Внимание', 'Такая связь уже существует!');
		return;
	}

	// Изменение отрезка в таблице №2
	connections.value = connections.value.map(it => {
		if (it.startEnd === `${editOldStartObj.value.id}-${editOldEndObj.value.id}`) {
			return {
				startId: editStartObj.value.id,
				endId: editEndObj.value.id,
				startName: editStartObj.value.name,
				endName: editEndObj.value.name,
				startEnd: `${editStartObj.value.id}-${editEndObj.value.id}`
			};
		} else return it;
	});

	addLog(
		`Отрезок в таблице "${editOldStartObj.value.name}-${editOldEndObj.value.name} || ${editOldStartObj.value.id}-${editOldEndObj.value.id}" переименован в "${editStartObj.value.name}-${editEndObj.value.name} || ${editStartObj.value.id}-${editEndObj.value.id}"`
	);

	packMatrix();

	isEditConnectionDialogVisible.value = false;
	toast('success', 'Успешно', 'Отрезок изменил название в таблице!');
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

	addLog(`Экспорт журнала логов в .txt файл: ${result?.path ?? 'N/A'}`);
}

// В зависимости от состояния диалоговых окон изменяем их данные
watch(isAddNewObjectDialogVisible, val => {
	if (!val) {
		// Если закрытие, то чистим данные
		newObjectName.value = '';
	}
});

watch(isEditObjectDialogVisible, val => {
	if (!val) {
		// Если закрытие, то чистим данные
		editObjectId.value = -1;
		editObjectName.value = '';
		editOldObjectName.value = '';
	}
});

watch(isAddNewConnectionDialogVisible, val => {
	if (!val) {
		// Если закрытие, то чистим данные
		newStartObj.value = '';
		newEndObj.value = '';
	}
});

watch(isEditConnectionDialogVisible, val => {
	if (!val) {
		// Если закрытие, то чистим данные
		editStartObj.value = null;
		editEndObj.value = null;
		editOldStartObj.value = null;
		editOldEndObj.value = null;
	}
});
</script>
