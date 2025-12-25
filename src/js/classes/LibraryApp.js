const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

const AppDatabase = require("./AppDatabase");
const AppUI = require("./AppUI");
const Utils = require("./Utils");
class LibraryApp {
    static costumesLibraryPath = "";
    static soundsLibraryPath = "";
    static objectsLibraryPath = "";

    /** @type {[import('../types').Costume]} */
    static costumesLibrary = [];
    /** @type {[import('../types').Sound]} */
    static soundsLibrary = [];

    static costumesInFolder = [];
    static soundsInFolder = [];

    static initialize() {
        // load paths
        this.costumesLibraryPath = AppDatabase.Settings.get("costumesLibraryPath") || "";
        this.soundsLibraryPath = AppDatabase.Settings.get("soundsLibraryPath") || "";
        this.objectsLibraryPath = AppDatabase.Settings.get("objectsLibraryPath") || "";
    }
    static saveConfiguration() {
        AppDatabase.Settings.set("costumesLibraryPath", this.costumesLibraryPath);
        AppDatabase.Settings.set("soundsLibraryPath", this.soundsLibraryPath);
        AppDatabase.Settings.set("objectsLibraryPath", this.objectsLibraryPath);
        console.log('saveConfiguration');
    }

    static loadCostumesLibrary() {
        this.costumesLibrary = [];
        const libraryText = fs.readFileSync(this.costumesLibraryPath, "utf8");
        const libraryJSON = Utils.tryJSONParse(libraryText, []);
        this.costumesLibrary = Array.isArray(libraryJSON) ? libraryJSON : [];
    }
    static loadSoundsLibrary() {
        this.soundsLibrary = [];
        const libraryText = fs.readFileSync(this.soundsLibraryPath, "utf8");
        const libraryJSON = Utils.tryJSONParse(libraryText, []);
        this.soundsLibrary = Array.isArray(libraryJSON) ? libraryJSON : [];
    }
    static loadLibraries() {
        this.loadCostumesLibrary();
        this.loadSoundsLibrary();
    }

    static async loadObjectsLibraryFolder() {
        // we only care about images folder and sounds folder, as well as only svg, png, and mp3
        const filePaths = (await glob(`${this.objectsLibraryPath}/**/*`))
            .map(filePath => filePath.replace(/\\/g, "/"))
            .map(filePath => filePath.slice(filePath.indexOf("/files/") + 7))
            .filter(filePath => filePath.startsWith("images/") || filePath.startsWith("sounds/"))
            .filter(filePath => filePath.endsWith(".svg") || filePath.endsWith(".png") || filePath.endsWith(".mp3"))
            .toSorted((a, b) => path.basename(a).localeCompare(path.basename(b)));
        // we should have stuff like images/user/segment/0.svg which is what the editor expects
        this.costumesInFolder = filePaths.filter(filePath => filePath.endsWith(".svg") || filePath.endsWith(".png"));
        this.soundsInFolder = filePaths.filter(filePath => filePath.endsWith(".mp3"));
    }
    static getUnlistedCostumes() {
        return this.costumesInFolder.filter(filePath => !(this.costumesLibrary.find(costume => costume.libraryFilePage === filePath)));
    }
    static getUnlistedSounds() {
        return this.soundsInFolder.filter(filePath => !(this.soundsLibrary.find(sound => sound.libraryFilePage === filePath)));
    }

    static clearScreen() {
        // incase we need to change this later its a func
        document.body.innerHTML = "";
        console.log("clearScreen");
    }
    static showLoading(text) {
        this.clearScreen();
        document.body.innerHTML = text;
        console.log(text);
    }
    static showPathSelector() {
        this.clearScreen();

        // labels
        const labelPathCostumes = document.createElement("p");
        labelPathCostumes.innerHTML = "Costume Library JSON path";
        const labelPathSounds = document.createElement("p");
        labelPathSounds.innerHTML = "Sounds Library JSON path";
        const labelPathObjects = document.createElement("p");
        labelPathObjects.innerHTML = "PenguinMod-ObjectLibraries/files Folder Path";
        // inputs
        const inputPathCostumes = document.createElement("input");
        inputPathCostumes.placeholder = "costumes.json";
        inputPathCostumes.value = this.costumesLibraryPath;
        const inputPathSounds = document.createElement("input");
        inputPathSounds.placeholder = "sounds.json";
        inputPathSounds.value = this.soundsLibraryPath;
        const inputPathObjects = document.createElement("input");
        inputPathObjects.placeholder = "PenguinMod-ObjectLibraries/files";
        inputPathObjects.value = this.objectsLibraryPath;
        // browse button
        const browsePathCostumes = document.createElement("button");
        browsePathCostumes.innerHTML = "Browse";
        browsePathCostumes.onclick = AppUI.makeBrowseFileAction(["json"], "Costume Library JSON", (path) => {
            this.costumesLibraryPath = path;
            inputPathCostumes.value = path;
            this.saveConfiguration();
        });
        const browsePathSounds = document.createElement("button");
        browsePathSounds.innerHTML = "Browse";
        browsePathSounds.onclick = AppUI.makeBrowseFileAction(["json"], "Sounds Library JSON", (path) => {
            this.soundsLibraryPath = path;
            inputPathSounds.value = path;
            this.saveConfiguration();
        });
        const browsePathObjects = document.createElement("button");
        browsePathObjects.innerHTML = "Browse";
        browsePathObjects.onclick = AppUI.makeBrowseFolderAction("Find PenguinMod-ObjectLibraries/files", (path) => {
            this.objectsLibraryPath = path;
            inputPathObjects.value = path;
            this.saveConfiguration();
        });

        // add those in order
        // costume path
        document.body.appendChild(labelPathCostumes);
        document.body.appendChild(inputPathCostumes);
        document.body.appendChild(browsePathCostumes);
        // sound path
        document.body.appendChild(labelPathSounds);
        document.body.appendChild(inputPathSounds);
        document.body.appendChild(browsePathSounds);
        // new costume path
        document.body.appendChild(labelPathObjects);
        document.body.appendChild(inputPathObjects);
        document.body.appendChild(browsePathObjects);

        // submit button
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));

        const submitPaths = document.createElement("button");
        submitPaths.innerHTML = "Load Libraries";
        document.body.appendChild(submitPaths);
        submitPaths.onclick = async () => {
            this.showLoading("Loading libraries");

            this.costumesLibraryPath = inputPathCostumes.value;
            this.soundsLibraryPath = inputPathSounds.value;
            await this.saveConfiguration();
            await this.loadLibraries();
            console.log('yah bro im done Loading blibraries', this.costumesLibrary, this.soundsLibrary);

            this.showLoading("Processing library");
            await this.loadObjectsLibraryFolder();
            console.log("yea bro i finish", this.costumesInFolder, this.soundsInFolder);
            console.log("low key", this.getUnlistedCostumes());

            this.showLibrarySelector();
        };
    }
    static showLibrarySelector() {
        this.clearScreen();

        // labels
        const labelLibraries = document.createElement("h1");
        labelLibraries.innerHTML = "Libraries";
        const labelBack = document.createElement("h1");
        labelBack.innerHTML = "Back";
        // buttons
        const buttonCostumes = document.createElement("button");
        buttonCostumes.innerHTML = "Costumes";
        buttonCostumes.onclick = () => this.showLibrary("costumes");
        const buttonSounds = document.createElement("button");
        buttonSounds.innerHTML = "Sounds";
        buttonSounds.onclick = () => this.showLibrary("sounds");
        const buttonBack = document.createElement("button");
        buttonBack.innerHTML = "Back";
        buttonBack.onclick = () => {
            this.showPathSelector();
        };

        // add stuff in order
        document.body.appendChild(labelLibraries);
        document.body.appendChild(buttonCostumes);
        document.body.appendChild(buttonSounds);
        document.body.appendChild(labelBack);
        document.body.appendChild(buttonBack);
    }
    static showLibrary(type) {
        this.clearScreen();

        const buttonBack = document.createElement("button");
        buttonBack.innerHTML = "Back";
        buttonBack.onclick = () => this.showLibrarySelector();
        document.body.appendChild(buttonBack);

        const labelLibrary = document.createElement("h1");
        labelLibrary.innerHTML = type === "costumes" ? "Costumes": "Sounds";
        document.body.appendChild(labelLibrary);
        const buttonSave = document.createElement("button");
        buttonSave.innerHTML = "Save";
        buttonSave.onclick = () => {
            if (type === "costumes") {
                fs.writeFileSync(this.costumesLibraryPath, JSON.stringify(this.costumesLibrary, null, 4), "utf8");
            } else {
                fs.writeFileSync(this.soundsLibraryPath, JSON.stringify(this.soundsLibrary, null, 4), "utf8");
            }
        };
        document.body.appendChild(buttonSave);

        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));

        const detailsUnlisted = document.createElement("details");
        const detailsListed = document.createElement("details");
        const summaryUnlisted = document.createElement("summary");
        const summaryListed = document.createElement("summary");
        summaryUnlisted.innerHTML = "Unlisted";
        summaryListed.innerHTML = "Library list";
        document.body.appendChild(detailsUnlisted);
        document.body.appendChild(detailsListed);
        detailsUnlisted.appendChild(summaryUnlisted);
        detailsListed.appendChild(summaryListed);

        // fill out the lists
        const unlistedObjects = type === "costumes" ? this.getUnlistedCostumes() : this.getUnlistedSounds();
        for (const filePath of unlistedObjects) {
            const button = AppUI.makeButtonForObject(type, this.objectsLibraryPath, filePath);
            detailsUnlisted.appendChild(button);

            button.onclick = () => this.showAssetMenu(type, filePath);
        }

        const listedObjects = (type === "costumes" ? this.costumesLibrary : this.soundsLibrary)
            .filter(object => object.fromPenguinModLibrary);
        for (const object of listedObjects) {
            const filePath = object.libraryFilePage;
            const button = AppUI.makeButtonForObject(type, this.objectsLibraryPath, filePath);
            detailsListed.appendChild(button);

            button.onclick = () => this.showAssetMenu(type, null, object);
        }
    }
    static showAssetMenu(type, newFromFilePath, editingObject) {
        this.clearScreen();

        const buttonBack = document.createElement("button");
        buttonBack.innerHTML = "Back";
        buttonBack.onclick = () => this.showLibrary(type);
        document.body.appendChild(buttonBack);

        const labelMenu = document.createElement("h1");
        labelMenu.innerHTML = newFromFilePath ? ("New " + (type === "costumes" ? "Costume" : "Sound") + " from " + newFromFilePath)
            : "Editing " + editingObject.name;
        document.body.appendChild(labelMenu);

        // values that always be made
        // name
        const labelName = document.createElement("label");
        labelName.appendChild(document.createTextNode("Name:"));
        const inputName = document.createElement("input");
        inputName.placeholder = "Name";
        inputName.value = editingObject ? editingObject.name : path.basename(newFromFilePath);
        labelName.appendChild(inputName);
        document.body.appendChild(labelName);
        // tags
        const labelTags = document.createElement("label");
        labelTags.appendChild(document.createTextNode("Tags (,):"));
        const inputTags = document.createElement("input");
        inputTags.placeholder = "animals,music,fantasy";
        inputTags.value = editingObject ? editingObject.tags.join(",") : "";
        labelTags.appendChild(inputTags);
        document.body.appendChild(labelTags);

        // values that can be made sometimes
        // dataFormat
        const labelDataFormat = document.createElement("label");
        labelDataFormat.appendChild(document.createTextNode("Data Format:"));
        const inputDataFormat = document.createElement("input");
        inputDataFormat.placeholder = "svg or png";
        inputDataFormat.value = editingObject ? editingObject.dataFormat : (newFromFilePath.endsWith("svg") ? "svg" : "png");
        labelDataFormat.appendChild(inputDataFormat);
        document.body.appendChild(labelDataFormat);
        labelDataFormat.style.display = type === "costumes" ? "" : "none";
        // bitmapResolution
        const labelBitmapResolution = document.createElement("label");
        labelBitmapResolution.appendChild(document.createTextNode("Bitmap Res:"));
        const inputBitmapResolution = document.createElement("input");
        inputBitmapResolution.type = "number";
        inputBitmapResolution.step = 1;
        inputBitmapResolution.placeholder = "1 (svg) or 2 (png)";
        inputBitmapResolution.value = editingObject ? editingObject.bitmapResolution : (newFromFilePath.endsWith("svg") ? 1 : 2);
        labelBitmapResolution.appendChild(inputBitmapResolution);
        document.body.appendChild(labelBitmapResolution);
        labelBitmapResolution.style.display = type === "costumes" ? "" : "none";
        // rotationCenterX
        const labelRotationCenterX = document.createElement("label");
        labelRotationCenterX.appendChild(document.createTextNode("Rotation Center X:"));
        const inputRotationCenterX = document.createElement("input");
        inputRotationCenterX.type = "number";
        inputRotationCenterX.step = 1;
        inputRotationCenterX.placeholder = "0 for SVG";
        inputRotationCenterX.value = editingObject ? editingObject.rotationCenterX : 0;
        labelRotationCenterX.appendChild(inputRotationCenterX);
        document.body.appendChild(labelRotationCenterX);
        labelRotationCenterX.style.display = type === "costumes" ? "" : "none";
        // rotationCenterY
        const labelRotationCenterY = document.createElement("label");
        labelRotationCenterY.appendChild(document.createTextNode("Rotation Center Y:"));
        const inputRotationCenterY = document.createElement("input");
        inputRotationCenterY.type = "number";
        inputRotationCenterY.step = 1;
        inputRotationCenterY.placeholder = "0 for SVG";
        inputRotationCenterY.value = editingObject ? editingObject.rotationCenterY : 0;
        labelRotationCenterY.appendChild(inputRotationCenterY);
        document.body.appendChild(labelRotationCenterY);
        labelRotationCenterY.style.display = type === "costumes" ? "" : "none";

        // rate
        const labelRate = document.createElement("label");
        labelRate.appendChild(document.createTextNode("Sample Rate:"));
        const inputRate = document.createElement("input");
        inputRate.type = "number";
        inputRate.step = 1;
        inputRate.placeholder = "44100";
        inputRate.value = editingObject ? editingObject.rate : 44100;
        labelRate.appendChild(inputRate);
        document.body.appendChild(labelRate);
        labelRate.style.display = type === "sounds" ? "" : "none";

        // save button
        const buttonSave = document.createElement("button");
        buttonSave.innerHTML = "Save";
        buttonSave.onclick = () => {
            console.log('gotta save');
        };
        document.body.appendChild(buttonSave);
    }
}

module.exports = LibraryApp;