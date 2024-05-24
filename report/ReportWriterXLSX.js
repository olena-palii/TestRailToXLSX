import XLSX from 'xlsx';
import DateNow from '../config/DateNow.js';
import FileReader from '../file/FileReader.js';

export default class ReportWriterXLSX {
    constructor(fileName) {
        this.file = `output/${fileName}_${DateNow.yyyy}_${DateNow.mm}_${DateNow.dd}_${DateNow.hh}_${DateNow.mi}.xlsx`;
    }
    addTabToFile(result, tabName) {
        var wb;
        if (FileReader.fileExists(this.file)) wb = XLSX.readFile(this.file);
        else wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet(result);
        if (wb.SheetNames.includes(tabName)) wb.Sheets[tabName] = ws;
        else XLSX.utils.book_append_sheet(wb, ws, tabName);
        XLSX.writeFile(wb, this.file);
    }
}