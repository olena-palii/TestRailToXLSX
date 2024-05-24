import fs from 'fs';
export default class FileReader {
    static _instanceCache;
    static get instance() {
        if (!this._instanceCache) this._instanceCache = new this();
        return this._instanceCache;
    }
    static readAllFiles(folderName) {
        let files = fs.readdirSync(folderName).filter(function (file) {
            if (file.indexOf(".") > -1) return file;
        });
        return files;
    }
    static readFile(fileName) {
        let data = fs.readFileSync(fileName);
        return data.toString();
    }
    static fileExists(fileName) {
        return fs.existsSync(fileName);
    }
}