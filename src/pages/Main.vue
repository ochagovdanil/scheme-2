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

			<!-- Упакованная матрица -->
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
</template>

<script setup>
import useConfirmDialog from '@/shared/model/composables/useConfirmDialog';
import useToastMessage from '@/shared/model/composables/useToastMessage';
import { Dialog } from 'primevue';
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

// Данные для формы "Добавить новый объект"
const newObjectName = ref('');

// Данные для формы "Редактировать объект"
const editObjectId = ref(-1);
const editObjectName = ref('');
const editOldObjectName = ref('');

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

// Закрываем окно с показом разницы во времени для выполнения алгоритмов
function clearBenchmarkData() {
	bfsBenchmark.value = null;
	dfsBenchmark.value = null;
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

	isEditObjectDialogVisible.value = false;
	toast('success', 'Успешно', 'Объект изменил название в таблице!');
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
</script>
