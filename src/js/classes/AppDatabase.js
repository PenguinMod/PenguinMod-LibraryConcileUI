const path = require("path");
const Database = require("sync-json-database");

class AppDatabase {
    static databasesPath = path.join(__dirname, "../../../databases");

    static Settings = new Database(path.join(this.databasesPath, "settings.json"), { indented: true });
}

module.exports = AppDatabase;