const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tableTournamentContextBridge', {
	reloadPage: () => ipcRenderer.send('reload-page'), // Перезагрузить страницу приложения
	openDevConsole: () => ipcRenderer.send('open-dev-console'), // Открыть консоль разработчика
	exitApp: () => ipcRenderer.send('exit-app'), // Закрыть приложение
	importExcel: () => ipcRenderer.invoke('import-excel'), // Импортируем данные из Excel файла
	exportLogs: (logs: any) => ipcRenderer.invoke('export-logs', logs), // Экспорт журнала логов в .txt файл
	exportMatrix: (ve: any, ri: any, cip: any) => ipcRenderer.invoke('export-matrix', ve, ri, cip) // Экспорт упакованной формы матрицы в .xlsx файл
});
