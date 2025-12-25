const fs = require('fs');
const path = require('path');
const electron = require("electron");

class AppIO {
    static async showDirectoryPicker(title) {
        const { canceled, filePaths } = await electron.ipcRenderer.invoke("pm-show-open-dialog", {
            title,
            properties: ["openDirectory", "createDirectory", "promptToCreate"]
        });
        if (canceled) return false;

        // make the folder if it doesnt exist
        const folderPath = filePaths[0];
        if (!folderPath) return false;

        const normalizedPath = path.resolve(folderPath);
        const parsed = path.parse(normalizedPath);
        const isRoot = normalizedPath === parsed.root;
        if (isRoot) return false;

        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
        return folderPath;
    }
    static async showFilePicker(title, extensions) {
        const { canceled, filePaths } = await electron.ipcRenderer.invoke("pm-show-open-dialog", {
            title: title,
            properties: ["openFile"],
            filters: !extensions ? null : [{ name: "Accepted types", extensions: extensions }],
        });
        if (canceled) return false;

        const filePath = filePaths[0];
        return filePath ? filePath : false;
    }
    static locateInExplorer(path) {
        if (fs.existsSync(path)) {
            electron.ipcRenderer.invoke("pm-show-item-in-folder", path);
        }
    }
}

module.exports = AppIO;