import XLSX from 'xlsx';
import DateNow from '../config/DateNow.js';
import FileReader from '../file/FileReader.js';

export default class ReportWriterXLSX {
    constructor(fileName) {
        this.file = `output/${fileName}_${DateNow.yyyy}_${DateNow.mm}_${DateNow.dd}_${DateNow.hh}_${DateNow.mi}.xlsx`;
    }
    addTabToFile(result, tabName) {
        var workbook;
        if (FileReader.fileExists(this.file)) workbook = XLSX.readFile(this.file);
        else workbook = XLSX.utils.book_new();
        var worksheet = XLSX.utils.aoa_to_sheet(result);
        worksheet = this.applyFormulas(worksheet);
        if (workbook.SheetNames.includes(tabName)) workbook.Sheets[tabName] = worksheet;
        else XLSX.utils.book_append_sheet(workbook, worksheet, tabName);
        XLSX.writeFile(workbook, this.file);
    }
    applyFormulas(worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = range.s.r; row <= range.e.r; ++row) {
            for (let column = range.s.c; column <= range.e.c; ++column) {
                const cell_address = { c: column, r: row };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                const cell = worksheet[cell_ref];
                if (cell && cell.v[0] == '=') {
                    cell.t = "n";
                    cell.f = cell.v.substring(1);
                    cell.v = null;
                }
            }
        }
        return worksheet;
    }
}