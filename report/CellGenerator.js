import FieldReader from '../testrail/FieldReader.js';
import Config from '../config/Config.js';
export default class NameReader {
    constructor() {
        this.fieldReader = new FieldReader();
    }
    async getHeadingLine(columns) {
        let columnNames = [];
        for (const column of columns) {
            let columnName
            if (column == Config.statistics.column) columnName = Config.statistics.columnName;
            else {
                let fields = await this.fieldReader.getFields();
                let field = await fields.find(x => x.system_name === column);
                columnName = field ? field.label : column[0].toUpperCase() + column.substring(1);
            }
            let cell = { v: columnName, s: Config.xlsx.heading_style };
            columnNames.push(cell);
        }
        return columnNames;
    }
    getGroupLine(groupName) {
        let cell = { v: groupName, s: Config.xlsx.group_style };
        let groupLine = [null, cell];
        return groupLine;
    }
    getSectionLine(sectionName) {
        let cell = { v: sectionName, s: Config.xlsx.section_style };
        let sectionLine = [null, cell];
        return sectionLine;
    }
    getCell(value) {
        return { v: value };
    }
    getCellNumber(value) {
        return { t: "n", v: value };
    }
    async getCellWithStyle(column, value) {
        let cell = { v: value };
        if (column == 'id') cell.l = { Target: `https://${Config.testrail.baseURL}/index.php?/cases/view/${value}` };
        if (Config.xlsx[column]) cell.s = { fill: { fgColor: { rgb: Config.xlsx[column][cell.v] } } }
        return cell;
    }
}