import TestRailAPI from './TestRailAPI.js';
export default class NameReader {
    constructor() {
        this.testRailAPI = new TestRailAPI();
    }
    async getColumnNames(columns) {
        let columnNames = [];
        let fields = await this.getSupportedFields();
        for (const column of columns) {
            let field = fields.find(x => x.system_name === column);
            let columnName = field ? field.label : column[0].toUpperCase() + column.substring(1);
            columnNames.push(columnName);
        }
        return columnNames;
    }
    async getSupportedFields() {
        let fields = await this.testRailAPI.getSupportedFields();
        return fields;
    }
}