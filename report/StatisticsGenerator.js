import Config from '../config/Config.js';
import CellGenerator from './CellGenerator.js';
export default class StatisticsGenerator {
    constructor() {
        this.cellGenerator = new CellGenerator();
        this.groupStatistics = [];
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
    async addColumnForTab(tabConfig) {
        if (!this.statistics) await this.addStatusesToStatistics(tabConfig);
        let cell = this.cellGenerator.getCell(tabConfig.name);
        this.statistics[0].push(cell);
        for (let i = 0; i < this.statuses(tabConfig).length; i++) {
            cell = this.cellGenerator.getCellNumber(0);
            this.statistics[i + 1].push(cell);
        }
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
    async addStatusesToGroupStatistics(tabConfig) {
        let last = this.groupStatistics.length - 1;
        this.groupStatistics[last].statistics = [[null]];
        for (const status of this.statuses(tabConfig)) {
            let cell = await this.cellGenerator.getCellWithStyle(Config.statistics.column, status);
            this.groupStatistics[last].statistics[0].push(cell);
        }
    }
    async addGroupsToGroupStatistics(groups, tabConfig) {
        await this.addStatusesToGroupStatistics(tabConfig);
        let last = this.groupStatistics.length - 1;
        for (const group of groups) {
            let cell = await this.cellGenerator.getCellWithStyle(tabConfig.group_by, group);
            this.groupStatistics[last].statistics.push([cell]);
        }
        for (let i = 0; i < groups.length; i++)
            for (const status of this.statuses(tabConfig)) {
                let cell = this.cellGenerator.getCellNumber(0);
                this.groupStatistics[last].statistics[i + 1].push(cell);
            }
    }
    async addGroupStatistics(testCases, groups, tabConfig) {
        let tabStatistics = { name: tabConfig.name + Config.statistics.tabName + Config.statistics[tabConfig.statistics].postfix };
        this.groupStatistics.push(tabStatistics);
        await this.addGroupsToGroupStatistics(groups, tabConfig);
        let last = this.groupStatistics.length - 1;
        for (const testCase of testCases)
            for (let i = 0; i < groups.length; i++)
                for (let j = 0; j < this.statuses(tabConfig).length; j++) {
                    if (testCase[tabConfig.group_by] == groups[i]
                        && testCase[Config.statistics.column] == this.statuses(tabConfig)[j]) {
                        this.groupStatistics[last].statistics[i + 1][j + 1].v += 1;
                    }
                }
        console.log(`Added group statistics for for ${tabConfig.name} tab`);
    }
}