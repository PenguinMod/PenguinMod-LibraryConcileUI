class Utils {
    static tryJSONParse(json, fallback) {
        try {
            return JSON.parse(json);
        } catch {
            return fallback;
        }
    }
}

module.exports = Utils;