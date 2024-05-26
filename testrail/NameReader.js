import TestRailAPI from './TestRailAPI.js';
import Config from '../config/Config.js';
export default class NameReader {
    constructor() {
        this.testRailAPI = new TestRailAPI();
    }
    async getFields() {
        if (!this.fields) {
            let fields = await this.testRailAPI.getSupportedFields();
            for (let i = 0; i < fields.length; i++) {
                let itemsString = fields[i].configs[0].options.items;
                if (itemsString) fields[i].options = this.parseFieldOptions(itemsString)
            }
            this.fields = this.addFieldOptions(fields);
        }
        return this.fields;
    }
    addFieldOptions(fields) {
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].configs[0] && fields[i].configs[0].options) {
                let itemsString = fields[i].configs[0].options.items;
                if (itemsString) fields[i].options = this.parseFieldOptions(itemsString)
            }
        }
        return fields;
    }
    parseFieldOptions(itemsString) {
        let fieldOptions = {};
        let items = itemsString.split("\n");
        for (const item of items) {
            let itemSplit = item.split(",");
            let itemKey = itemSplit[0];
            let itemValue = itemSplit[1];
            fieldOptions[itemKey] = itemValue;
        }
        return fieldOptions;
    }
    async getColumnNames(columns) {
        let columnNames = [];
        for (const column of columns) {
            let fields = await this.getFields();
            let field = await fields.find(x => x.system_name === column);
            let columnName = field ? field.label : column[0].toUpperCase() + column.substring(1);
            let cell = { v: columnName, s: Config.xlsx.heading_style };
            columnNames.push(cell);
        }
        return columnNames;
    }
    async getValueLabel(column, value) {
        let cell = { v: value };
        if(column == 'id') cell.l = { Target: `https://${Config.testrail.baseURL}/index.php?/cases/view/${value}` };
        let fields = await this.getFields();
        let field = await fields.find(x => x.system_name === column);
        if (field && field.options) cell.v = field.options[value];
        return cell;
    }
}