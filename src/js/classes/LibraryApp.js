const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

const AppDatabase = require("./AppDatabase");
const AppUI = require("./AppUI");
const AppIO = require("./AppIO");
const Utils = require("./Utils");
class LibraryApp {
    static backdropsLibraryPath = "";
    static costumesLibraryPath = "";
    static soundsLibraryPath = "";
    static objectsLibraryPath = "";

    /** @type {[import('../types').Costume]} */
    static backdropsLibrary = [];
    /** @type {[import('../types').Costume]} */
    static costumesLibrary = [];
    /** @type {[import('../types').Sound]} */
    static soundsLibrary = [];

    static costumesInFolder = [];
    static soundsInFolder = [];

    static initialize() {
        // load paths
        this.backdropsLibraryPath = AppDatabase.Settings.get("backdropsLibraryPath") || "";
        this.costumesLibraryPath = AppDatabase.Settings.get("costumesLibraryPath") || "";
        this.soundsLibraryPath = AppDatabase.Settings.get("soundsLibraryPath") || "";
        this.objectsLibraryPath = AppDatabase.Settings.get("objectsLibraryPath") || "";
    }
    static saveConfiguration() {
        AppDatabase.Settings.set("backdropsLibraryPath", this.backdropsLibraryPath);
        AppDatabase.Settings.set("costumesLibraryPath", this.costumesLibraryPath);
        AppDatabase.Settings.set("soundsLibraryPath", this.soundsLibraryPath);
        AppDatabase.Settings.set("objectsLibraryPath", this.objectsLibraryPath);
        console.log('saveConfiguration');
    }

    static loadBackdropsLibrary() {
        this.backdropsLibrary = [];
        const libraryText = fs.readFileSync(this.backdropsLibraryPath, "utf8");
        const libraryJSON = Utils.tryJSONParse(libraryText, []);
        this.backdropsLibrary = Array.isArray(libraryJSON) ? libraryJSON : [];
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
        this.loadBackdropsLibrary();
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
        return this.costumesInFolder.filter(filePath => !([
            ...this.backdropsLibrary,
            ...this.costumesLibrary,
        ].find(costume => costume.libraryFilePage === filePath)));
    }
    static getUnlistedSounds() {
        return this.soundsInFolder.filter(filePath => !(this.soundsLibrary.find(sound => sound.libraryFilePage === filePath)));
    }
    static getBackdropTags() {
        return [...new Set(this.backdropsLibrary.map(backdrop => backdrop.tags)
            .flat(Infinity))];
    }
    static getCostumeTags() {
        return [...new Set(this.costumesLibrary.map(costume => costume.tags)
            .flat(Infinity))];
    }
    static getSoundTags() {
        return [...new Set(this.soundsLibrary.map(sound => sound.tags)
            .flat(Infinity))];
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
        const labelPathBackdrops = document.createElement("p");
        labelPathBackdrops.innerHTML = "Backdrops Library JSON path";
        const labelPathCostumes = document.createElement("p");
        labelPathCostumes.innerHTML = "Costume Library JSON path";
        const labelPathSounds = document.createElement("p");
        labelPathSounds.innerHTML = "Sounds Library JSON path";
        const labelPathObjects = document.createElement("p");
        labelPathObjects.innerHTML = "PenguinMod-ObjectLibraries/files Folder Path";
        // inputs
        const inputPathBackdrops = document.createElement("input");
        inputPathBackdrops.placeholder = "backdrops.json";
        inputPathBackdrops.value = this.backdropsLibraryPath;
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
        const browsePathBackdrops = document.createElement("button");
        browsePathBackdrops.innerHTML = "Browse";
        browsePathBackdrops.onclick = AppUI.makeBrowseFileAction(["json"], "Backdrops Library JSON", (path) => {
            this.backdropsLibraryPath = path;
            inputPathBackdrops.value = path;
            this.saveConfiguration();
        });
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
        // backdrops path
        document.body.appendChild(labelPathBackdrops);
        document.body.appendChild(inputPathBackdrops);
        document.body.appendChild(browsePathBackdrops);
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

            this.backdropsLibraryPath = inputPathBackdrops.value;
            this.costumesLibraryPath = inputPathCostumes.value;
            this.soundsLibraryPath = inputPathSounds.value;
            await this.saveConfiguration();
            await this.loadLibraries();
            console.log('yah bro im done Loading blibraries', this.backdropsLibrary, this.costumesLibrary, this.soundsLibrary);

            this.showLoading("Processing library");
            await this.loadObjectsLibraryFolder();
            console.log("yea bro i finish", this.costumesInFolder, this.soundsInFolder);
            console.log("low key", this.getUnlistedCostumes(), this.getUnlistedSounds());

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
        const buttonBackdrops = document.createElement("button");
        buttonBackdrops.innerHTML = "Backdrops";
        buttonBackdrops.onclick = () => this.showLibrary("backdrops");
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
        document.body.appendChild(buttonBackdrops);
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
        labelLibrary.innerHTML = type === "costumes" ? "Costumes" : (type === "backdrops" ? "Backdrops" : "Sounds");
        document.body.appendChild(labelLibrary);
        const buttonSave = document.createElement("button");
        buttonSave.innerHTML = "Save";
        buttonSave.onclick = () => {
            if (type === "backdrops") {
                fs.writeFileSync(this.backdropsLibraryPath, JSON.stringify(this.backdropsLibrary, null, 4), "utf8");
            } else if (type === "costumes") {
                fs.writeFileSync(this.costumesLibraryPath, JSON.stringify(this.costumesLibrary, null, 4), "utf8");
            } else {
                fs.writeFileSync(this.soundsLibraryPath, JSON.stringify(this.soundsLibrary, null, 4), "utf8");
            }
        };
        document.body.appendChild(buttonSave);

        const buttonResort = document.createElement("button");
        buttonResort.innerHTML = "Resort Library";
        buttonResort.onclick = () => {
            this.showLoading("Sorting library");
            if (type === "backdrops") {
                this.backdropsLibrary.sort((a, b) => a.name.localeCompare(b.name));
            } else if (type === "costumes") {
                this.costumesLibrary.sort((a, b) => a.name.localeCompare(b.name));
            } else if (type === "sounds") {
                this.soundsLibrary.sort((a, b) => a.name.localeCompare(b.name));
            }
            this.showLibrary(type);
        }
        document.body.appendChild(buttonResort);

        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));

        const detailsUnlisted = document.createElement("details");
        const detailsNew = document.createElement("details");
        const detailsListed = document.createElement("details");
        const summaryUnlisted = document.createElement("summary");
        const summaryNew = document.createElement("summary");
        const summaryListed = document.createElement("summary");
        summaryUnlisted.innerHTML = "Unlisted";
        summaryNew.innerHTML = "Marked as New";
        summaryListed.innerHTML = "Library list";
        document.body.appendChild(detailsUnlisted);
        document.body.appendChild(detailsNew);
        document.body.appendChild(detailsListed);
        detailsUnlisted.appendChild(summaryUnlisted);
        detailsNew.appendChild(summaryNew);
        detailsListed.appendChild(summaryListed);

        // fill out the lists
        const unlistedObjects = (type === "costumes" || type === "backdrops") ? this.getUnlistedCostumes() : this.getUnlistedSounds();
        for (const filePath of unlistedObjects) {
            const button = AppUI.makeButtonForObject(type, this.objectsLibraryPath, filePath);
            detailsUnlisted.appendChild(button);

            button.onclick = () => this.showAssetMenu(type, filePath);
        }

        const listedObjects = (type === "backdrops" ? this.backdropsLibrary : (type === "costumes" ? this.costumesLibrary : this.soundsLibrary))
            .filter(object => object.fromPenguinModLibrary)
            .toSorted((a, b) => a.name.localeCompare(b.name));
        const newObjects = listedObjects.filter(object => object.tags.includes("new"));
        for (const object of newObjects) {
            const filePath = object.libraryFilePage;
            const button = AppUI.makeButtonForObject(type, this.objectsLibraryPath, filePath, object);
            detailsNew.appendChild(button);

            button.onclick = () => this.showAssetMenu(type, null, object);
        }

        for (const object of listedObjects) {
            const filePath = object.libraryFilePage;
            const button = AppUI.makeButtonForObject(type, this.objectsLibraryPath, filePath, object);
            detailsListed.appendChild(button);

            button.onclick = () => this.showAssetMenu(type, null, object);
        }
    }
    static showAssetMenu(type, newFromFilePath, editingObject) {
        const filePath = editingObject ? editingObject.libraryFilePage : newFromFilePath;
        this.clearScreen();

        const buttonBack = document.createElement("button");
        buttonBack.innerHTML = "Back";
        buttonBack.onclick = () => this.showLibrary(type);
        document.body.appendChild(buttonBack);

        const labelMenu = document.createElement("h1");
        labelMenu.innerHTML = newFromFilePath ? ("New " + (type === "backdrops" ? "Backdrop" : (type === "costumes" ? "Costume" : "Sound")) + " from " + newFromFilePath)
            : "Editing " + editingObject.name;
        document.body.appendChild(labelMenu);
        if (type === "costumes" || type === "backdrops") {
            const image = document.createElement("img");
            image.src = path.join(this.objectsLibraryPath, filePath);
            image.classList.add("costume-image");
            document.body.appendChild(image);
        } else {
            const audio = document.createElement("audio");
            audio.src = path.join(this.objectsLibraryPath, filePath);
            audio.controls = true;
            audio.volume = 0.5;
            document.body.appendChild(audio);
        }

        const buttonLocate = document.createElement("button");
        buttonLocate.innerHTML = "Locate in folder";
        buttonLocate.onclick = () => AppIO.locateInExplorer(path.join(this.objectsLibraryPath, filePath));
        document.body.appendChild(buttonLocate);

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
        // we can just show common tags in this library
        const commonTags = document.createElement("p");
        commonTags.innerHTML = "Common tags: " +
            ((type === "backdrops" ? this.getBackdropTags() : (type === "costumes" ? this.getCostumeTags() : this.getSoundTags()))
            .toSorted((a, b) => a.localeCompare(b))
            .join(" "));
        commonTags.style.width = "calc(100% - 16px)";
        commonTags.style.display = "none";
        inputTags.onfocus = () => {
            commonTags.style.display = "";
        };
        inputTags.onblur = () => {
            commonTags.style.display = "none";
        };
        document.body.appendChild(commonTags);

        // values that can be made sometimes
        // dataFormat
        const labelDataFormat = document.createElement("label");
        labelDataFormat.appendChild(document.createTextNode("Data Format:"));
        const inputDataFormat = document.createElement("input");
        inputDataFormat.placeholder = "svg or png";
        inputDataFormat.value = editingObject ? editingObject.dataFormat : (newFromFilePath.endsWith("svg") ? "svg" : "png");
        labelDataFormat.appendChild(inputDataFormat);
        document.body.appendChild(labelDataFormat);
        labelDataFormat.style.display = type === "costumes" || type === "backdrops" ? "" : "none";
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
        labelBitmapResolution.style.display = type === "costumes" || type === "backdrops" ? "" : "none";
        // rotationCenterX
        const labelRotationCenterX = document.createElement("label");
        labelRotationCenterX.appendChild(document.createTextNode("Rotation Center X:"));
        const inputRotationCenterX = document.createElement("input");
        inputRotationCenterX.type = "number";
        inputRotationCenterX.step = 1;
        inputRotationCenterX.placeholder = "0 for SVG";
        inputRotationCenterX.value = editingObject ? editingObject.rotationCenterX
            : (type === "backdrops" && !newFromFilePath.endsWith("svg") ? 480 : 0);
        labelRotationCenterX.appendChild(inputRotationCenterX);
        document.body.appendChild(labelRotationCenterX);
        labelRotationCenterX.style.display = type === "costumes" || type === "backdrops" ? "" : "none";
        // rotationCenterY
        const labelRotationCenterY = document.createElement("label");
        labelRotationCenterY.appendChild(document.createTextNode("Rotation Center Y:"));
        const inputRotationCenterY = document.createElement("input");
        inputRotationCenterY.type = "number";
        inputRotationCenterY.step = 1;
        inputRotationCenterY.placeholder = "0 for SVG";
        inputRotationCenterY.value = editingObject ? editingObject.rotationCenterY
            : (type === "backdrops" && !newFromFilePath.endsWith("svg") ? 360 : 0);
        labelRotationCenterY.appendChild(inputRotationCenterY);
        document.body.appendChild(labelRotationCenterY);
        labelRotationCenterY.style.display = type === "costumes" || type === "backdrops" ? "" : "none";

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

            const objectToEdit = editingObject ? editingObject : ((type === "costumes" || type === "backdrops") ? {
                    name: "",
                    tags: [],
                    bitmapResolution: 1,
                    dataFormat: "svg",
                    rotationCenterX: 0,
                    rotationCenterY: 0,
                    fromPenguinModLibrary: true,
                    libraryFilePage: ""
                } : {
                    name: "",
                    tags: [],
                    dataFormat: "mpeg",
                    md5ext: "sound.mp3",
                    rate: 44100,
                    fromPenguinModLibrary: true,
                    libraryFilePage: ""
            });
            if (newFromFilePath) {
                objectToEdit.libraryFilePage = newFromFilePath;
            }

            objectToEdit.name = inputName.value;
            objectToEdit.tags = inputTags.value.split(",");
            if (type === "costumes" || type === "backdrops") {
                objectToEdit.dataFormat = inputDataFormat.value;
                objectToEdit.bitmapResolution = Number(inputBitmapResolution.value);
                objectToEdit.rotationCenterX = Number(inputRotationCenterX.value);
                objectToEdit.rotationCenterY = Number(inputRotationCenterY.value);
            } else {
                objectToEdit.rate = Number(inputRate.value);
            }

            if (!editingObject) {
                if (type === "backdrops") {
                    this.backdropsLibrary.push(objectToEdit);
                } else if (type === "costumes") {
                    this.costumesLibrary.push(objectToEdit);
                } else {
                    this.soundsLibrary.push(objectToEdit);
                }
            }

            this.showLibrary(type);
        };
        document.body.appendChild(buttonSave);
    }
}

module.exports = LibraryApp;