const path = require("path");

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

    static makeButtonForCostume(objectsLibraryPath, filePath, object) {
        const button = document.createElement("button");
        button.classList.add("costume-button");
        const container = document.createElement("div");
        button.appendChild(container);
        const image = document.createElement("img");
        image.src = path.join(objectsLibraryPath, filePath);

        container.appendChild(image);
        container.appendChild(document.createTextNode(object ? object.name : filePath));
        return button;
    }
    static makeButtonForSound(objectsLibraryPath, filePath, object) {
        const button = document.createElement("button");
        button.classList.add("fake-link");
        button.innerHTML = object ? object.name : filePath;
        return button;
    }
    static makeButtonForObject(type, objectsLibraryPath, filePath, object) {
        switch (type) {
            case "backdrops":
            case "costumes":
                return this.makeButtonForCostume(objectsLibraryPath, filePath, object);
            case "sounds":
                return this.makeButtonForSound(objectsLibraryPath, filePath, object);
        }
    }
}

module.exports = AppUI;