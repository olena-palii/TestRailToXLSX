import Config from '../config/Config.js';
import TestCaseReader from '../testrail/TestCaseReader.js';
import CellGenerator from './CellGenerator.js';
import StatisticsGenerator from './StatisticsGenerator.js';
import GroupStatisticsGenerator from './GroupStatisticsGenerator.js';
import Report from './Report.js';
import ReportWriterXLSX from './ReportWriterXLSX.js';
export default class ReportGenerator {
    constructor() {
        this.testCaseReader = new TestCaseReader();
        this.cellGenerator = new CellGenerator();
        this.statisticsGenerator = new StatisticsGenerator();
        this.groupStatisticsGenerator = new GroupStatisticsGenerator();
    }
    async generate(name) {
        this.report = new Report(name);
        await this.generateTestCasesTabs();
        await this.generateStatisticsTabs();
    }
    async generateTestCasesTabs() {
        let tabConfigs = Config.report;
        for (const tabConfig of tabConfigs) {
            console.log(`Start generating ${tabConfig.name} tab...`)
            this.report.addTab(tabConfig.name);
            this.report.addResult(await this.generateResult(tabConfig));
        }
    }
    async generateStatisticsTabs() {
        if (Config.statistics.summary_enabled) {
            this.report.addTab(Config.statistics.tabName);
            this.report.addResult(this.statisticsGenerator.statistics);
        }
        if (Config.statistics.group_enabled) {
            for (const groupStatistics of this.groupStatisticsGenerator.statistics) {
                this.report.addTab(groupStatistics.name);
                this.report.addResult(groupStatistics.statistics);
            }
        }
    }
    async generateResult(tabConfig) {
        let result = [];
        let testCases = await this.testCaseReader.read(tabConfig);
        let columns = Config.statistics.enabled ? [...tabConfig.columns, Config.statistics.column] : tabConfig.columns;
        let heading = await this.cellGenerator.getHeadingLine(columns);
        let content = await this.generateContent(testCases, columns, tabConfig);
        result = [heading, ...content];
        await this.generateStatistics(testCases, tabConfig);
        return result;
    }
    async generateContent(testCases, columns, tabConfig) {
        let result = [];
        this.groupCurrent = null;
        this.sectionCurrent = null;
        for (const testCase of testCases) {
            let groupLine = this.generateGroupLine(testCase, tabConfig);
            if (groupLine) result.push(groupLine);
            let sectionLine = this.generateSectionLine(testCase, tabConfig);
            if (sectionLine) result.push(sectionLine);
            let line = await this.generateLine(testCase, columns);
            if (line) result.push(line);
        }
        return result;
    }
    generateGroupLine(testCase, tabConfig) {
        let groupLine;
        if (tabConfig.group_by && testCase[tabConfig.group_by] != this.groupCurrent) {
            this.groupCurrent = testCase[tabConfig.group_by];
            if (tabConfig.show_groups) groupLine = this.cellGenerator.getGroupLine(this.groupCurrent);
        }
        return groupLine;
    }
    generateSectionLine(testCase, tabConfig) {
        let sectionLine;
        if (testCase.section.depth < tabConfig.sections_max_depth && testCase.section.name != this.sectionCurrent) {
            this.sectionCurrent = testCase.section.name;
            sectionLine = this.cellGenerator.getSectionLine(this.sectionCurrent);
        }
        return sectionLine;
    }
    async generateLine(testCase, columns) {
        let line = [];
        for (const column of columns) {
            let cell = await this.cellGenerator.getCellWithStyle(column, testCase[column]);
            line.push(cell);
        }
        return line;
    }
    async generateStatistics(testCases, tabConfig) {
        if (Config.statistics.summary_enabled)
            await this.statisticsGenerator.addTabStatistics(testCases, tabConfig);
        if (tabConfig.group_by && Config.statistics.group_enabled)
            await this.groupStatisticsGenerator.addGroupStatistics(testCases, this.testCaseReader.groups, tabConfig);
    }
    saveToXLSX() {
        let reportWriterXLSX = new ReportWriterXLSX(this.report.name);
        for (const tab of this.report.tabs)
            reportWriterXLSX.addTabToFile(tab.content, tab.name);
        reportWriterXLSX.save();
    }
}