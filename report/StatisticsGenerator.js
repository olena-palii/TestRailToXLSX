import Config from '../config/Config.js';
import CellGenerator from './CellGenerator.js';
export default class StatisticsGenerator {
    constructor() {
        this.cellGenerator = new CellGenerator();
        this.addStatusesToStatistics();
    }
    statuses() {
        let config = Config.statistics.rules;
        let statuses = Object.keys(config);
        return statuses;
    }
    async addStatusesToStatistics() {
        this.statistics = [[null]];
        for (const status of this.statuses()) {
            let cell = await this.cellGenerator.getCellWithStyle(Config.statistics.column, status);
            this.statistics.push([cell]);
        }
    }
    async addColumnForTab(tabName) {
        if (!this.statistics) await this.addStatusesToStatistics();
        let cell = this.cellGenerator.getCell(tabName);
        this.statistics[0].push(cell);
        for (let i = 0; i < this.statuses().length; i++) {
            cell = this.cellGenerator.getCell(0);
            this.statistics[i + 1].push(cell);
        }
        return this.statistics[0].length - 1;
    }
    async addTabStatistics(testCases, tabName) {
        let column = await this.addColumnForTab(tabName);
        for (const testCase of testCases)
            for (let i = 0; i < this.statuses().length; i++) {
                if (testCase[Config.statistics.column] == this.statuses()[i])
                    this.statistics[i + 1][column].v += 1;
            }
        console.log(`Added statistics for for ${tabName} tab`);
        return this.statistics;
    }
}