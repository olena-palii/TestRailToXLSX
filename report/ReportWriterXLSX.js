import XLSX from 'xlsx';
import Config from '../config/Config.js';
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
        worksheet = this.adjustColumnWidth(worksheet);
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
    adjustColumnWidth(worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const columnsWidths = new Array(range.e.c - range.s.c + 1).fill(0);
        for (let column = range.s.c; column <= range.e.c; ++column) {
            let max_length = Config.xlsx.min_width;
            for (let row = range.s.r; row <= range.e.r; ++row) {
                const cell_address = { c: column, r: row };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                const cell = worksheet[cell_ref];
                if (cell && cell.v && cell.v[0] != '=')
                    max_length = Math.max(max_length, cell.v.toString().length * Config.xlsx.character_width);
            }
            columnsWidths[column] = Math.min(max_length, Config.xlsx.max_width);
        }
        worksheet['!cols'] = columnsWidths.map(width => ({ wpx: width }));
        return worksheet;
    }
}