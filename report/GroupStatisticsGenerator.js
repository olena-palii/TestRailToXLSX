import Config from '../config/Config.js';
import CellGenerator from './CellGenerator.js';
export default class GroupStatisticsGenerator {
    constructor() {
        this.cellGenerator = new CellGenerator();
        this.statistics = [];
    }
    statuses(tabConfig) {
        let config = Config.statistics[tabConfig.statistics].rules;
        let statuses = Object.keys(config);
        return statuses;
    }
    async addStatusesToStatistics(tabConfig) {
        let last = this.statistics.length - 1;
        this.statistics[last].statistics = [[null]];
        for (const status of this.statuses(tabConfig)) {
            let cell = await this.cellGenerator.getCellWithStyle(Config.statistics.column, status);
            this.statistics[last].statistics[0].push(cell);
        }
    }
    addZeroValues(groups, tabConfig) {
        let last = this.statistics.length - 1;
        for (let i = 0; i < groups.length; i++)
            for (const status of this.statuses(tabConfig)) {
                let cell = this.cellGenerator.getCellNumber(0);
                this.statistics[last].statistics[i + 1].push(cell);
            }
    }
    async addGroupsToStatistics(groups, tabConfig) {
        await this.addStatusesToStatistics(tabConfig);
        let last = this.statistics.length - 1;
        for (const group of groups) {
            let cell = await this.cellGenerator.getCellWithStyle(tabConfig.group_by, group);
            this.statistics[last].statistics.push([cell]);
        }
        this.addZeroValues(groups, tabConfig);
    }
    calculateStatistics(testCase, groups, tabConfig) {
        let last = this.statistics.length - 1;
        for (let i = 0; i < groups.length; i++)
            for (let j = 0; j < this.statuses(tabConfig).length; j++) {
                if (testCase[tabConfig.group_by] == groups[i]
                    && testCase[Config.statistics.column] == this.statuses(tabConfig)[j]) {
                    this.statistics[last].statistics[i + 1][j + 1].v += 1;
                }
            }
    }
    async addGroupStatistics(testCases, groups, tabConfig) {
        let tabStatistics =
        {
            name: tabConfig.name + Config.statistics.tabName + Config.statistics[tabConfig.statistics].postfix
        };
        this.statistics.push(tabStatistics);
        await this.addGroupsToStatistics(groups, tabConfig);
        for (const testCase of testCases)
            this.calculateStatistics(testCase, groups, tabConfig);
        console.log(`Added group statistics for for ${tabConfig.name} tab`);
    }
}