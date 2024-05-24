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
            this.report.addResult(await this.calculateResult(tabConfig));
        }
    }
    async calculateResult(tabConfig){
        let result = [];
        let testRailAPI = new TestRailAPI();
        let testCases = await testRailAPI.getTestCases(tabConfig.project_id, tabConfig.suite_id, tabConfig.filters);
        result.push(tabConfig.columns);
        for (const testCase of testCases) {
            let line = this.calculateLine(testCase, tabConfig.columns);
            result.push(line);
        }
        return result;
    }
    calculateLine(testCase, columns){
        let line = [];
        for (const column of columns) {
            line.push(testCase[column]);
        }
        return line;
    }
    saveToXLSX() {
        let reportWriterXLSX = new ReportWriterXLSX(this.report.name);
        for (const tab of this.report.tabs)
            reportWriterXLSX.addTabToFile(tab.content, tab.name);
    }
}