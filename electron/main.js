const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webSecurity: false, // Para desenvolvimento, remova em produção
      nativeWindowOpen: true // Permite pop-ups
    }
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'), {
    hash: '/dml/login'
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
  });
  win.webContents.on('did-finish-load', () => {
    console.log('Página carregada com sucesso');
  });

  win.webContents.on('did-finish-load', () => {
  win.webContents.executeJavaScript('window.location.href').then((url) => {
    console.log('URL carregada:', url);
  });
});

  console.log('Janela criada, preload:', path.join(__dirname, 'preload.js'));
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('check-file-exists', (event, filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error('Erro ao verificar arquivo:', error);
      return false;
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});