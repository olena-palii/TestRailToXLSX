import Config from '../config/Config.js';
import CellGenerator from './CellGenerator.js';
export default class StatisticsGenerator {
    constructor() {
        this.cellGenerator = new CellGenerator();
    }
    statuses(tabConfig) {
        let config = Config.statistics[tabConfig.statistics].rules;
        let statuses = Object.keys(config);
        return statuses;
    }
    async addStatusesToStatistics(tabConfig) {
        this.statistics = [[null]];
        for (const status of this.statuses(tabConfig)) {
            let cell = await this.cellGenerator.getCellWithStyle(Config.statistics.column, status);
            this.statistics.push([cell]);
        }
    }
    addZeroValues(tabConfig) {
        for (let i = 0; i < this.statuses(tabConfig).length; i++) {
            let cell = this.cellGenerator.getCellNumber(0);
            this.statistics[i + 1].push(cell);
        }
    }
    async addColumnForTab(tabConfig) {
        if (!this.statistics) await this.addStatusesToStatistics(tabConfig);
        let cell = this.cellGenerator.getCell(tabConfig.name);
        this.statistics[0].push(cell);
        this.addZeroValues(tabConfig);
        return this.statistics[0].length - 1;
    }
    async addTabStatistics(testCases, tabConfig) {
        let column = await this.addColumnForTab(tabConfig);
        for (const testCase of testCases)
            for (let i = 0; i < this.statuses(tabConfig).length; i++) {
                if (testCase[Config.statistics.column] == this.statuses(tabConfig)[i])
                    this.statistics[i + 1][column].v += 1;
            }
        console.log(`Added statistics for for ${tabConfig.name} tab`);
    }
}