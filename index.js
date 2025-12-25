const fs = require("fs");
const path = require("path");
const electron = require('electron');

const reloadsAlot = process.argv.includes("--pm-reloads-alot");

const createWindow = () => {
    const win = new electron.BrowserWindow({
        title: "PenguinMod Library Concile",
        width: 1200,
        height: 700,
        webPreferences: {
            // NOTE: this isnt really gonna be an app for people to use later anyway
            devTools: true,
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(__dirname, './src/js/preload.js')
        }
    });

    if (reloadsAlot) win.blur();

    win.loadFile(path.join(__dirname, './src/html/index.html'));
};
const createIpcHandlers = () => {
    // NOTE: For an actual example of safe electron, see https://github.com/JeremyGamer13/GarryMPN/tree/main/gui
    // Right now we just make handlers for stuff that we cant access in preload electron regardless of pref
    electron.ipcMain.handle("pm-show-open-dialog", async (_, options) => {
        return await electron.dialog.showOpenDialog(options);
    });
    electron.ipcMain.handle("pm-show-item-in-folder", async (_, path) => {
        electron.shell.showItemInFolder(path);
    });
};
const initialize = () => {
    const cachePath = path.join(__dirname, "./cache/");
    const databasesPath = path.join(__dirname, "./databases/");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
    if (!fs.existsSync(databasesPath)) fs.mkdirSync(databasesPath, { recursive: true });

    createIpcHandlers();
    createWindow();
};

electron.app.whenReady().then(() => {
    initialize();
});