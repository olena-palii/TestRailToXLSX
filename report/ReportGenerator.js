import Config from '../config/Config.js';
import TestRailAPI from '../testrail/TestRailAPI.js';
import Report from './Report.js';
import ReportWriterXLSX from './ReportWriterXLSX.js';
export default class ReportGenerator {
    constructor() {
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
        let testCases = await this.getTestCases(tabConfig);
        result.push(tabConfig.columns);
        let groupName;
        let sectionName;
        for (const testCase of testCases) {
            if (tabConfig.show_groups && testCase[tabConfig.group_by] != groupName) {
                groupName = testCase[tabConfig.group_by];
                let groupLine = [null, groupName];
                result.push(groupLine);
            }
            if (testCase.section.depth < tabConfig.sections_max_depth && testCase.section.name != sectionName) {
                sectionName = testCase.section.name;
                let sectionLine = [null, sectionName];
                if (JSON.stringify(result[result.length - 1]) != JSON.stringify(sectionLine)) result.push(sectionLine);
            }
            let line = this.generateLine(testCase, tabConfig.columns);
            result.push(line);
        }
        return result;
    }
    generateLine(testCase, columns) {
        let line = [];
        for (const column of columns) {
            line.push(testCase[column]);
        }
        return line;
    }
    async getTestCases(tabConfig) {
        let testRailAPI = new TestRailAPI();
        let testCases = await testRailAPI.getTestCases(tabConfig.project_id, tabConfig.suite_id, tabConfig.filters);
        testCases = testCases.sort((a, b) => a[tabConfig.group_by].toString().localeCompare(b[tabConfig.group_by]));
        let sections = await testRailAPI.getSections(tabConfig.project_id, tabConfig.suite_id);
        testCases = this.addSectionsInfoToTestCases(testCases, sections);
        return testCases;
    }
    addSectionsInfoToTestCases(testCases, sections) {
        for (let i = 0; i < testCases.length; i++) {
            testCases[i].section = sections.find(x => x.id === testCases[i].section_id);
        }
        return testCases;
    }
    saveToXLSX() {
        let reportWriterXLSX = new ReportWriterXLSX(this.report.name);
        for (const tab of this.report.tabs)
            reportWriterXLSX.addTabToFile(tab.content, tab.name);
    }
}