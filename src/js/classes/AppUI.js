const AppIO = require("./AppIO");

class AppUI {
    static makeBrowseFileAction(extensions, title, callback) {
        return (async () => {
            const filePath = await AppIO.showFilePicker(title, extensions);
            callback(filePath);
        });
    }
    static makeBrowseFolderAction(title, callback) {
        return (async () => {
            const folderPath = await AppIO.showDirectoryPicker(title);
            callback(folderPath);
        });
    }
}

module.exports = AppUI;