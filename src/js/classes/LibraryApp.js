const AppDatabase = require("./AppDatabase");
const AppUI = require("./AppUI");

class LibraryApp {
    static costumesLibraryPath = "";
    static soundsLibraryPath = "";

    static initialize() {
        // load paths
        this.costumesLibraryPath = AppDatabase.Settings.get("costumesLibraryPath") || "";
        this.soundsLibraryPath = AppDatabase.Settings.get("soundsLibraryPath") || "";
    }
    static saveConfiguration() {
        AppDatabase.Settings.set("costumesLibraryPath", this.costumesLibraryPath);
        AppDatabase.Settings.set("soundsLibraryPath", this.soundsLibraryPath);
    }

    static clearScreen() {
        // incase we need to change this later its a func
        document.body.innerHTML = "";
    }
    static showPathSelector() {
        this.clearScreen();

        // labels
        const labelPathCostumes = document.createElement("p");
        labelPathCostumes.innerHTML = "Costume Library JSON path";
        const labelPathSounds = document.createElement("p");
        labelPathSounds.innerHTML = "Sounds Library JSON path";
        // inputs
        const inputPathCostumes = document.createElement("input");
        inputPathCostumes.placeholder = "costumes.json";
        inputPathCostumes.value = this.costumesLibraryPath;
        const inputPathSounds = document.createElement("input");
        inputPathSounds.placeholder = "sounds.json";
        inputPathSounds.value = this.soundsLibraryPath;
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

        // add those in order
        // costume path
        document.body.appendChild(labelPathCostumes);
        document.body.appendChild(inputPathCostumes);
        document.body.appendChild(browsePathCostumes);
        // sound path
        document.body.appendChild(labelPathSounds);
        document.body.appendChild(inputPathSounds);
        document.body.appendChild(browsePathSounds);

        // submit button
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(document.createElement("br"));

        const submitPaths = document.createElement("button");
        submitPaths.innerHTML = "Load Libraries";
        document.body.appendChild(submitPaths);
    }
}

module.exports = LibraryApp;