import XLSX from 'xlsx-js-style';
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
        worksheet = this.applyFormats(worksheet);
        worksheet = this.adjustColumnWidth(worksheet);
        if (workbook.SheetNames.includes(tabName)) workbook.Sheets[tabName] = worksheet;
        else XLSX.utils.book_append_sheet(workbook, worksheet, tabName);
        XLSX.writeFile(workbook, this.file);
    }
    applyFormats(worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = range.s.r; row <= range.e.r; ++row) {
            for (let column = range.s.c; column <= range.e.c; ++column) {
                const cell_address = { c: column, r: row };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                const cell = worksheet[cell_ref];
                if(cell && row == 0){
                    cell.s = Config.xlsx.heading_style;
                }
                if (cell && cell.v && cell.v[0] == Config.xlsx.formula_symbol) {
                    cell.f = cell.v.substring(1);
                    cell.v = null;
                }
                if (cell && cell.v && cell.v[0] == Config.xlsx.link_symbol) {
                    let linkSplit = cell.v.substring(1).split(Config.xlsx.link_symbol);
                    let link = linkSplit[0];
                    let linkName = linkSplit[1];
                    cell.l = { Target: link };
                    cell.v = linkName;
                }
                if (cell && cell.v && cell.v[0] == Config.xlsx.group_symbol) {
                    cell.v = cell.v.substring(1);
                    cell.s = Config.xlsx.group_style;
                }
                if (cell && cell.v && cell.v[0] == Config.xlsx.section_symbol) {
                    cell.v = cell.v.substring(1);
                    cell.s = Config.xlsx.section_style;
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