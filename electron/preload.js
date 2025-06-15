const { contextBridge, ipcRenderer } = require('electron');
let shell = null;
try {
  shell = require('electron').shell;
} catch (error) {
  console.error('Erro ao carregar shell:', error);
}

contextBridge.exposeInMainWorld('electronAPI', {
  sendToMain: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receiveFromMain: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  openExternal: (url) => {
    if (shell && typeof shell.openExternal === 'function') {
      shell.openExternal(url).catch((err) => console.error('Erro ao abrir URL:', err));
    } else {
      console.error('shell.openExternal não está disponível');
    }
  }
});

contextBridge.exposeInMainWorld('fileAPI', {
  checkFileExists: (filePath) => {
    return ipcRenderer.invoke('check-file-exists', filePath);
  }
});

console.log('Preload script loaded', { shellAvailable: !!shell });