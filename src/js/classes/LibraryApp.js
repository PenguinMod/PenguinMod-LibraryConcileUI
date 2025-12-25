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
        };
    }
}

module.exports = LibraryApp;