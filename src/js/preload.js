const fs = require("fs");
const path = require("path");
const electron = require('electron');

const LibraryApp = require('./classes/LibraryApp');

window.addEventListener("DOMContentLoaded", () => {
    LibraryApp.initialize();

    // switch to the path selector
    LibraryApp.showPathSelector();
});