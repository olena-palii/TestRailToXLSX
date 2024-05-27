import Config from '../config/Config.js';
import TestCaseReader from '../testrail/TestCaseReader.js';
import CellGenerator from './CellGenerator.js';
import StatisticsGenerator from './StatisticsGenerator.js';
import Report from './Report.js';
import ReportWriterXLSX from './ReportWriterXLSX.js';
export default class ReportGenerator {
    constructor() {
        this.testCaseReader = new TestCaseReader();
        this.cellGenerator = new CellGenerator();
        this.statisticsGenerator = new StatisticsGenerator();
    }
    async generate(name) {
        this.report = new Report(name);
        let tabConfigs = Config.report;
        for (const tabConfig of tabConfigs) {
            this.report.addTab(tabConfig.name);
            this.report.addResult(await this.generateResult(tabConfig));
        }
    }
    async generateResult(tabConfig) {
        let result = [];
        let testCases = await this.testCaseReader.read(tabConfig);
        testCases = await this.statisticsGenerator.addStatisticsStatusToTestCases(testCases);
        let columns = tabConfig.statistics ? [...tabConfig.columns, 'statistics_status'] : tabConfig.columns;
        result.push(await this.cellGenerator.getHeadingLine(columns));
        let groupCurrent;
        let sectionCurrent;
        for (const testCase of testCases) {
            if (tabConfig.show_groups && testCase[tabConfig.group_by] != groupCurrent) {
                groupCurrent = testCase[tabConfig.group_by];
                result.push(this.cellGenerator.getGroupLine(groupCurrent));
            }
            if (testCase.section.depth < tabConfig.sections_max_depth && testCase.section.name != sectionCurrent) {
                sectionCurrent = testCase.section.name;
                result.push(this.cellGenerator.getSectionLine(sectionCurrent));
            }
            let line = await this.generateLine(testCase, columns);
            result.push(line);
        }
        return result;
    }
    async generateLine(testCase, columns) {
        let line = [];
        for (const column of columns) {
            let cell = await this.cellGenerator.getCellWithStyle(column, testCase[column]);
            line.push(cell);
        }
        return line;
    }
    saveToXLSX() {
        let reportWriterXLSX = new ReportWriterXLSX(this.report.name);
        for (const tab of this.report.tabs)
            reportWriterXLSX.addTabToFile(tab.content, tab.name);
    }
}