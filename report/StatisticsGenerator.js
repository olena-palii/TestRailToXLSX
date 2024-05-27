import Config from '../config/Config.js';
import CellGenerator from './CellGenerator.js';
export default class StatisticsGenerator {
    constructor() {
        this.cellGenerator = new CellGenerator();
        this.addStatusesToStatistics();
        this.groupStatistics = [];
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
            cell = this.cellGenerator.getCellNumber(0);
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
    }
    async addStatusesToGroupStatistics() {
        let last = this.groupStatistics.length - 1;
        this.groupStatistics[last].statistics = [[null]];
        for (const status of this.statuses()) {
            let cell = await this.cellGenerator.getCellWithStyle(Config.statistics.column, status);
            this.groupStatistics[last].statistics[0].push(cell);
        }
    }
    async addGroupsToGroupStatistics(groups, tabConfig) {
        await this.addStatusesToGroupStatistics();
        let last = this.groupStatistics.length - 1;
        for (const group of groups) {
            let cell = await this.cellGenerator.getCellWithStyle(tabConfig.group_by, group);
            this.groupStatistics[last].statistics.push([cell]);
        }
        for (let i = 0; i < groups.length; i++)
            for (const status of this.statuses()) {
                let cell = this.cellGenerator.getCellNumber(0);
                this.groupStatistics[last].statistics[i + 1].push(cell);
            }
    }
    async addGroupStatistics(testCases, groups, tabConfig) {
        let tabStatistics = { name: tabConfig.name + Config.statistics.tabName };
        this.groupStatistics.push(tabStatistics);
        await this.addGroupsToGroupStatistics(groups, tabConfig);
        let last = this.groupStatistics.length - 1;
        for (const testCase of testCases)
            for (let i = 0; i < groups.length; i++)
                for (let j = 0; j < this.statuses().length; j++) {
                    if (testCase[tabConfig.group_by] == groups[i]
                        && testCase[Config.statistics.column] == this.statuses()[j]) {
                        this.groupStatistics[last].statistics[i + 1][j + 1].v += 1;
                    }
                }
        console.log(`Added group statistics for for ${tabConfig.name} tab`);
    }
}