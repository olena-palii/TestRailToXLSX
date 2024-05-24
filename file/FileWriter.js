import fs from 'fs';
import path from 'path';
export default class FileWriter {
    static _instanceCache;
    static get instance() {
        if (!this._instanceCache) this._instanceCache = new this();
        return this._instanceCache;
    }
    static ensureDirectoryExistence(filePath) {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
    static addToFile(filePath, text) {
        this.ensureDirectoryExistence(filePath);
        fs.appendFileSync(filePath, text);
    }
}