import XLSX from 'xlsx-js-style';
import Config from '../config/Config.js';
import DateNow from '../config/DateNow.js';
import FileReader from '../file/FileReader.js';

export default class ReportWriterXLSX {
    constructor(fileName) {
        this.file = `output/${fileName}_${DateNow.yyyy}_${DateNow.mm}_${DateNow.dd}_${DateNow.hh}_${DateNow.mi}.xlsx`;
        this.openWorkbook();

    }
    openWorkbook() {
        if (FileReader.fileExists(this.file)) this.workbook = XLSX.readFile(this.file);
        else this.workbook = XLSX.utils.book_new();
    }
    save() {
        XLSX.writeFile(this.workbook, this.file);
        console.log('Report saved: ' + this.file);
    }
    addTabToFile(result, tabName) {
        let worksheet = XLSX.utils.aoa_to_sheet([]);
        result.forEach((row, rowIndex) => {
            row.forEach((cellData, columnIndex) => {
                if (cellData) this.setCell(worksheet, cellData, rowIndex, columnIndex);
            });
        });
        worksheet['!ref'] = XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: result.length - 1, c: result[0].length - 1 }
        });
        worksheet = this.adjustColumnWidth(worksheet);
        if (this.workbook.SheetNames.includes(tabName)) this.workbook.Sheets[tabName] = worksheet;
        else XLSX.utils.book_append_sheet(this.workbook, worksheet, tabName);
    }
    setCell(worksheet, cellData, row, column) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: column });
        worksheet[cellAddress] = cellData;
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