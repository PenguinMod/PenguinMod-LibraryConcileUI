const AppIO = require("./AppIO");

class AppUI {
    static makeBrowseFileAction(extensions, title, callback) {
        return (async () => {
            const filePath = await AppIO.showFilePicker(title, extensions);
            if (!filePath) return;
            callback(filePath);
        });
    }
    static makeBrowseFolderAction(title, callback) {
        return (async () => {
            const folderPath = await AppIO.showDirectoryPicker(title);
            if (!folderPath) return;
            callback(folderPath);
        });
    }
}

module.exports = AppUI;