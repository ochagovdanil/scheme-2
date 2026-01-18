/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, Menu, session, screen, dialog } from 'electron';
import started from 'electron-squirrel-startup';
import path from 'node:path';
import os from 'node:os';
import * as XLSX from 'xlsx';

const fs = require('fs');

// Все настройки приложения и файлы должны хранится в корне проекта в папке 'user-data
if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
	const exeFolder = path.dirname(app.getPath('exe'));
	const userDataPath = path.join(exeFolder, 'user-data');
	app.setPath('userData', userDataPath);
}

let mainWindow: BrowserWindow | null = null;

Menu.setApplicationMenu(null); // Скрываем верхнее меню, которое идет по дефолту

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false, // Use contextBridge for better security
			contextIsolation: true,
			nativeWindowOpen: true // helps make window.open popups behave like real windows
		}
	});
	mainWindow.setIcon(path.join(__dirname, 'favicon.ico')); // Window title
	mainWindow.maximize();

	connectIpc(); // Подключаем Inter-Process-Communication между Render Process и Main Process

	// Обработчик создания новых окон (аналог вкладок)
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		return handleCreationOfNewWindow(url);
	});

	// Shortcuts для всего окна
	mainWindow.webContents.on('before-input-event', (event, input) => {
		if (input.type === 'keyDown' && input.key === 'F5') {
			event.preventDefault();
			reloadCurrentPage();
		}

		if (
			input.type === 'keyDown'
			&& (input.control || input.meta)
			&& input.shift
			&& (input.key.toUpperCase() === 'I' || input.key.toUpperCase() === 'Ш')
		) {
			event.preventDefault();
			toggleDevConsole();
		}
	});

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
	}
};

const handleCreationOfNewWindow = (url: string) => {
	// Новое окно должно быть меньше текущего размера экрана в 1.2 раза, чтобы пользователь понимал что это аналог новой вкладки
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	const newWindow = new BrowserWindow({
		width: Math.floor(width / 1.2),
		height: Math.floor(height / 1.2),
		center: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false, // Use contextBridge for better security
			contextIsolation: true,
			nativeWindowOpen: true // helps make window.open popups behave like real windows
		}
	});
	newWindow.setIcon(path.join(__dirname, 'favicon.ico')); // Window title

	newWindow.webContents.setWindowOpenHandler(({ url }) => {
		return handleCreationOfNewWindow(url);
	});

	// Shortcuts для всего окна
	newWindow.webContents.on('before-input-event', (event, input) => {
		if (input.type === 'keyDown' && input.key === 'F5') {
			event.preventDefault();
			reloadCurrentPage();
		}

		if (
			input.type === 'keyDown'
			&& (input.control || input.meta)
			&& input.shift
			&& (input.key.toUpperCase() === 'I' || input.key.toUpperCase() === 'Ш')
		) {
			event.preventDefault();
			toggleDevConsole();
		}
	});

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		newWindow.loadURL(url);
	} else {
		// Загружаем исходный код из собранных файлов после компиляции проекта
		// Parse the route from the url
		let route: string = '';

		try {
			const u: URL = new URL(url);
			route = u.hash; // e.g. "#/work/123"
		} catch {
			// fallback if url is not absolute
			route = url;
		}

		const fragment: string = route.substring(1); // e.g., "/work/123"
		newWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
			hash: fragment // This produces file:///.../index.html#/work/123
		});
	}

	return { action: 'deny' }; // Prevent the default behavior
};

app.whenReady().then(async () => {
	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	// В development загрузить VueDevtools расширение
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		const vueDevToolsPath = path.join(
			os.homedir(),
			'/AppData/Local/Google/Chrome/User Data/Profile 6/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/7.7.7_0' // Тут у каждого свой ID расширения (смотрите через браузер где оно установлено)
		);
		await session.defaultSession.loadExtension(vueDevToolsPath);
	}
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// Подключаем Inter-Process-Communication между Render Process и Main Process
const connectIpc = () => {
	// Перезагружаем страницу приложения
	ipcMain.on('reload-page', () => {
		reloadCurrentPage();
	});

	// Открыть консоль разработчика
	ipcMain.on('open-dev-console', () => {
		toggleDevConsole();
	});

	// Закрыть приложение
	ipcMain.on('exit-app', () => {
		exitApp();
	});

	// Импортируем данные из Excel файла
	ipcMain.handle('import-excel', async () => {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			filters: [{ name: 'Excel', extensions: ['xlsx'] }],
			properties: ['openFile']
		});

		if (canceled || filePaths.length === 0) return { items: [], connections: [] };

		const filePath = filePaths[0];
		const buffer = fs.readFileSync(filePath);
		const workbook = XLSX.read(buffer, { type: 'buffer' });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const items: { id: number; name: string }[] = [];
		let i = 1;

		// Считываем данные из столбца F
		while (true) {
			const cell = worksheet[`F${i}`];
			const value = cell ? cell.v : '';

			if (!value) break;

			items.push({ id: i, name: value.toString().trim() });
			i++;
		}

		// Создание хэша по имени для быстрого поиска ID
		const nameToIdMap: Record<string, number> = {};
		for (const item of items) {
			nameToIdMap[item.name] = item.id;
		}

		// Считываем связи из A и B
		const connections: {
			startName: string;
			endName: string;
			startId: number | null;
			endId: number | null;
			startEnd: string;
		}[] = [];

		let row = 1;
		while (true) {
			const cellA = worksheet[`A${row}`];
			const cellB = worksheet[`B${row}`];
			const startName = cellA?.v?.toString().trim() ?? '';
			const endName = cellB?.v?.toString().trim() ?? '';

			// завершение по первой пустой строке хотя бы в одном столбце
			if (!startName || !endName) break;

			const startId = nameToIdMap[startName] ?? null;
			const endId = nameToIdMap[endName] ?? null;

			connections.push({
				startName,
				endName,
				startId,
				endId,
				startEnd: `${startId}-${endId}`
			});

			row++;
		}

		return { items, connections, filePath };
	});

	// Экспортируем журнал логов в .txt файл
	ipcMain.handle('export-logs', async (_event, logs) => {
		// Открываем диалог сохранения
		const { filePath, canceled } = await dialog.showSaveDialog({
			title: 'Сохранить как TXT',
			defaultPath: `Журнал логов.txt`,
			filters: [{ name: 'Text Files', extensions: ['txt'] }]
		});

		if (canceled || !filePath) return { success: false, error: 'Пользователь прервал операцию экспорта' };

		try {
			// Генерируем строку
			const content = logs.map((item: any) => `${item.date} | ${item.text}`).join('\n');
			fs.writeFileSync(filePath, content, 'utf-8');

			return { success: true, path: filePath };
		} catch (e) {
			return { success: false, error: e };
		}
	});
};

// Перезагружаем страницу приложения
function reloadCurrentPage(): void {
	const win = BrowserWindow.getFocusedWindow();

	if (win) win.webContents.reloadIgnoringCache();
}

// Открыть/закрыть консоль разработчика
function toggleDevConsole(): void {
	const win = BrowserWindow.getFocusedWindow();

	if (win) {
		if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
		else win.webContents.openDevTools();
	}
}

// Закрыть приложение
function exitApp(): void {
	app.quit();
}
